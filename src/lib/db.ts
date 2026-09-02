import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { getMongoDb, isMongoConfigured } from "./mongodb";
import { ObjectId } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __jixu_sqlite: Database.Database | undefined;
}

const g = globalThis as typeof globalThis & {
  __jixu_sqlite?: Database.Database;
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS site_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siteUrl TEXT NOT NULL,
  siteName TEXT NOT NULL,
  siteFeature TEXT,
  targets TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  submittedAt INTEGER NOT NULL,
  submitterIp TEXT,
  userAgent TEXT,
  reviewedAt INTEGER,
  reviewedBy TEXT,
  commitSha TEXT,
  commitUrl TEXT,
  skipped TEXT
);
CREATE INDEX IF NOT EXISTS idx_site_requests_submitted ON site_requests(submittedAt DESC);
CREATE INDEX IF NOT EXISTS idx_site_requests_status_submitted ON site_requests(status, submittedAt DESC);

CREATE TABLE IF NOT EXISTS site_analytics (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS visitor_logs (
  visitorId TEXT PRIMARY KEY,
  ip TEXT,
  userAgent TEXT,
  referer TEXT,
  firstSeenAt INTEGER NOT NULL,
  lastSeenAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_visitor_last_seen ON visitor_logs(lastSeenAt DESC);

CREATE TABLE IF NOT EXISTS dmca_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  claimantName TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  infringingUrl TEXT NOT NULL,
  originalWorkDescription TEXT NOT NULL,
  digitalSignature TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submittedAt INTEGER NOT NULL,
  submitterIp TEXT,
  userAgent TEXT,
  resolvedAt INTEGER,
  resolutionNotes TEXT
);
CREATE INDEX IF NOT EXISTS idx_dmca_submitted ON dmca_requests(submittedAt DESC);
CREATE INDEX IF NOT EXISTS idx_dmca_status ON dmca_requests(status, submittedAt DESC);
`;

function getDbPath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "jixu_data.db");
  }
  const dataDir = path.join(process.cwd(), "data");
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    return path.join(dataDir, "jixu_data.db");
  } catch {
    return path.join(os.tmpdir(), "jixu_data.db");
  }
}

function openDb(): Database.Database {
  const dbPath = getDbPath();
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  try {
    db.prepare("INSERT OR IGNORE INTO site_analytics (key, value) VALUES ('total_visits', 1)").run();
  } catch {}
  return db;
}

export function getDb(): Database.Database {
  if (!g.__jixu_sqlite) {
    g.__jixu_sqlite = openDb();
  } else {
    try {
      g.__jixu_sqlite.exec(SCHEMA);
    } catch {}
  }
  return g.__jixu_sqlite;
}

// -------------------------------------------------------------
// VISITOR & TRAFFIC ANALYTICS (MongoDB with SQLite Fallback)
// -------------------------------------------------------------

export interface VisitorMetadata {
  ip: string;
  userAgent: string;
  referer?: string;
}

export interface VisitorLogEntry {
  visitorId: string;
  ip: string;
  userAgent: string;
  referer?: string;
  firstSeenAt: number;
  lastSeenAt: number;
}

const ACTIVE_WINDOW_MS = 45_000;
const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function recordVisitAsync(
  visitorId: string,
  meta: VisitorMetadata,
): Promise<{ totalVisits: number; online: number; isNew: boolean }> {
  const now = Date.now();
  let isNew = false;
  let totalVisits = 1;
  let online = 1;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const visitors = db.collection<VisitorLogEntry>("visitor_logs");
        const analytics = db.collection<{ key: string; value: number; updatedAt: number }>("site_analytics");

        const existing = await visitors.findOne({ visitorId });
        if (!existing) {
          isNew = true;
          await visitors.insertOne({
            visitorId,
            ip: meta.ip,
            userAgent: meta.userAgent,
            referer: meta.referer || "",
            firstSeenAt: now,
            lastSeenAt: now,
          });
        } else {
          // If returning after 24 hours, count as a new session visit
          if (now - existing.lastSeenAt > DEDUPE_WINDOW_MS) {
            isNew = true;
          }
          await visitors.updateOne(
            { visitorId },
            {
              $set: {
                lastSeenAt: now,
                ip: meta.ip,
                userAgent: meta.userAgent,
                ...(meta.referer ? { referer: meta.referer } : {}),
              },
            },
          );
        }

        if (isNew) {
          const res = await analytics.findOneAndUpdate(
            { key: "total_visits" },
            { $inc: { value: 1 }, $set: { updatedAt: now } },
            { upsert: true, returnDocument: "after" },
          );
          totalVisits = res?.value ?? 1;
        } else {
          const doc = await analytics.findOne({ key: "total_visits" });
          totalVisits = doc?.value ?? 1;
        }

        const activeCutoff = now - ACTIVE_WINDOW_MS;
        online = await visitors.countDocuments({ lastSeenAt: { $gte: activeCutoff } });
        online = Math.max(1, online);

        return { totalVisits: Math.max(1, totalVisits), online, isNew };
      }
    } catch (err) {
      console.error("[db.ts] recordVisitAsync MongoDB error:", err);
    }
  }

  // Fallback to SQLite
  try {
    const db = getDb();
    const existing = db.prepare("SELECT lastSeenAt FROM visitor_logs WHERE visitorId = ?").get(visitorId) as
      | { lastSeenAt: number }
      | undefined;

    if (!existing) {
      isNew = true;
      db.prepare(
        "INSERT INTO visitor_logs (visitorId, ip, userAgent, referer, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?)",
      ).run(visitorId, meta.ip, meta.userAgent, meta.referer || "", now, now);
      totalVisits = recordVisit();
    } else {
      if (now - existing.lastSeenAt > DEDUPE_WINDOW_MS) {
        isNew = true;
        totalVisits = recordVisit();
      } else {
        totalVisits = getTotalVisits();
      }
      db.prepare(
        "UPDATE visitor_logs SET lastSeenAt = ?, ip = ?, userAgent = ?, referer = ? WHERE visitorId = ?",
      ).run(now, meta.ip, meta.userAgent, meta.referer || "", visitorId);
    }

    const activeCutoff = now - ACTIVE_WINDOW_MS;
    const activeRow = db
      .prepare("SELECT COUNT(*) as c FROM visitor_logs WHERE lastSeenAt >= ?")
      .get(activeCutoff) as { c: number } | undefined;
    online = Math.max(1, activeRow?.c ?? 1);
  } catch (err) {
    console.error("[db.ts] recordVisitAsync SQLite error:", err);
    totalVisits = recordVisit();
  }

  return { totalVisits: Math.max(1, totalVisits), online, isNew };
}

export async function getTotalVisitsAsync(): Promise<number> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const doc = await db
          .collection<{ key: string; value: number }>("site_analytics")
          .findOne({ key: "total_visits" });
        if (doc && typeof doc.value === "number") {
          return Math.max(1, doc.value);
        }
      }
    } catch (err) {
      console.error("[db.ts] getTotalVisitsAsync MongoDB error:", err);
    }
  }
  return getTotalVisits();
}

export async function getOnlineCountAsync(): Promise<number> {
  const now = Date.now();
  const activeCutoff = now - ACTIVE_WINDOW_MS;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const count = await db
          .collection<VisitorLogEntry>("visitor_logs")
          .countDocuments({ lastSeenAt: { $gte: activeCutoff } });
        return Math.max(1, count);
      }
    } catch (err) {
      console.error("[db.ts] getOnlineCountAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    const row = db
      .prepare("SELECT COUNT(*) as c FROM visitor_logs WHERE lastSeenAt >= ?")
      .get(activeCutoff) as { c: number } | undefined;
    return Math.max(1, row?.c ?? 1);
  } catch {
    return 1;
  }
}

export async function getVisitorLogsAsync(limit = 50): Promise<VisitorLogEntry[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        return (await db
          .collection<VisitorLogEntry>("visitor_logs")
          .find({})
          .sort({ lastSeenAt: -1 })
          .limit(limit)
          .toArray()) as VisitorLogEntry[];
      }
    } catch (err) {
      console.error("[db.ts] getVisitorLogsAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    return db
      .prepare("SELECT * FROM visitor_logs ORDER BY lastSeenAt DESC LIMIT ?")
      .all(limit) as VisitorLogEntry[];
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// SITE REQUESTS (MongoDB with SQLite Fallback)
// -------------------------------------------------------------

export interface SiteRequestModel {
  id: string;
  siteUrl: string;
  siteName: string;
  siteFeature?: string;
  targets: Array<{ region: string; categoryId: string }>;
  status: "pending" | "approved" | "rejected" | "spam";
  submittedAt: number;
  submitterIp?: string;
  userAgent?: string;
  reviewedAt?: number | null;
  reviewedBy?: string | null;
  commitSha?: string | null;
  commitUrl?: string | null;
  skipped?: string[] | null;
}

export async function insertSiteRequestAsync(data: {
  siteUrl: string;
  siteName: string;
  siteFeature?: string;
  targets: Array<{ region: string; categoryId: string }>;
  submittedAt: number;
  submitterIp?: string;
  userAgent?: string;
}): Promise<string> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const res = await db.collection("site_requests").insertOne({
          ...data,
          status: "pending",
          reviewedAt: null,
          reviewedBy: null,
          commitSha: null,
          commitUrl: null,
          skipped: null,
        });
        return res.insertedId.toString();
      }
    } catch (err) {
      console.error("[db.ts] insertSiteRequestAsync MongoDB error:", err);
    }
  }

  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO site_requests
       (siteUrl, siteName, siteFeature, targets, status, submittedAt, submitterIp, userAgent)
     VALUES
       (@siteUrl, @siteName, @siteFeature, @targets, 'pending', @submittedAt, @submitterIp, @userAgent)`,
  );
  const info = stmt.run({
    siteUrl: data.siteUrl,
    siteName: data.siteName,
    siteFeature: data.siteFeature ?? null,
    targets: JSON.stringify(data.targets),
    submittedAt: data.submittedAt,
    submitterIp: data.submitterIp ?? null,
    userAgent: data.userAgent ?? null,
  });
  return String(info.lastInsertRowid);
}

export async function getAllSiteRequestsAsync(
  status?: string,
  limit = 100,
): Promise<SiteRequestModel[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const filter = status && ["pending", "approved", "rejected", "spam"].includes(status)
          ? { status }
          : {};
        const docs = await db
          .collection("site_requests")
          .find(filter)
          .sort({ submittedAt: -1 })
          .limit(limit)
          .toArray();

        return docs.map((d) => ({
          id: d._id ? d._id.toString() : String(d.id || ""),
          siteUrl: d.siteUrl,
          siteName: d.siteName,
          siteFeature: d.siteFeature,
          targets: Array.isArray(d.targets) ? d.targets : [],
          status: d.status ?? "pending",
          submittedAt: Number(d.submittedAt) || Date.now(),
          submitterIp: d.submitterIp,
          userAgent: d.userAgent,
          reviewedAt: d.reviewedAt ?? null,
          reviewedBy: d.reviewedBy ?? null,
          commitSha: d.commitSha ?? null,
          commitUrl: d.commitUrl ?? null,
          skipped: d.skipped ?? null,
        }));
      }
    } catch (err) {
      console.error("[db.ts] getAllSiteRequestsAsync MongoDB error:", err);
    }
  }

  const db = getDb();
  let rows: Array<{
    id: number;
    siteUrl: string;
    siteName: string;
    siteFeature: string | null;
    targets: string;
    status: string | null;
    submittedAt: number;
    submitterIp: string | null;
    userAgent: string | null;
    reviewedAt: number | null;
    reviewedBy: string | null;
    commitSha: string | null;
    commitUrl: string | null;
    skipped: string | null;
  }>;

  if (status && ["pending", "approved", "rejected", "spam"].includes(status)) {
    rows = db
      .prepare("SELECT * FROM site_requests WHERE status = ? ORDER BY submittedAt DESC LIMIT ?")
      .all(status, limit) as typeof rows;
  } else {
    rows = db
      .prepare("SELECT * FROM site_requests ORDER BY submittedAt DESC LIMIT ?")
      .all(limit) as typeof rows;
  }

  return rows.map((r) => ({
    id: String(r.id),
    siteUrl: r.siteUrl,
    siteName: r.siteName,
    siteFeature: r.siteFeature ?? undefined,
    targets: parseJsonArray(r.targets),
    status: (r.status ?? "pending") as SiteRequestModel["status"],
    submittedAt: r.submittedAt,
    submitterIp: r.submitterIp ?? undefined,
    userAgent: r.userAgent ?? undefined,
    reviewedAt: r.reviewedAt,
    reviewedBy: r.reviewedBy,
    commitSha: r.commitSha,
    commitUrl: r.commitUrl,
    skipped: parseJsonArray(r.skipped),
  }));
}

export async function getSiteRequestByIdAsync(id: string): Promise<SiteRequestModel | null> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        let filter: Record<string, unknown> = { id };
        if (ObjectId.isValid(id)) {
          filter = { $or: [{ _id: new ObjectId(id) }, { id }] };
        }
        const d = await db.collection("site_requests").findOne(filter);
        if (d) {
          return {
            id: d._id ? d._id.toString() : String(d.id || id),
            siteUrl: d.siteUrl,
            siteName: d.siteName,
            siteFeature: d.siteFeature,
            targets: Array.isArray(d.targets) ? d.targets : [],
            status: d.status ?? "pending",
            submittedAt: Number(d.submittedAt) || Date.now(),
            submitterIp: d.submitterIp,
            userAgent: d.userAgent,
            reviewedAt: d.reviewedAt ?? null,
            reviewedBy: d.reviewedBy ?? null,
            commitSha: d.commitSha ?? null,
            commitUrl: d.commitUrl ?? null,
            skipped: d.skipped ?? null,
          };
        }
      }
    } catch (err) {
      console.error("[db.ts] getSiteRequestByIdAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    const numericId = Number(id);
    if (isNaN(numericId)) return null;
    const r = db.prepare("SELECT * FROM site_requests WHERE id = ?").get(numericId) as
      | {
          id: number;
          siteUrl: string;
          siteName: string;
          siteFeature: string | null;
          targets: string;
          status: string | null;
          submittedAt: number;
          submitterIp: string | null;
          userAgent: string | null;
          reviewedAt: number | null;
          reviewedBy: string | null;
          commitSha: string | null;
          commitUrl: string | null;
          skipped: string | null;
        }
      | undefined;
    if (!r) return null;
    return {
      id: String(r.id),
      siteUrl: r.siteUrl,
      siteName: r.siteName,
      siteFeature: r.siteFeature ?? undefined,
      targets: parseJsonArray(r.targets),
      status: (r.status ?? "pending") as SiteRequestModel["status"],
      submittedAt: r.submittedAt,
      submitterIp: r.submitterIp ?? undefined,
      userAgent: r.userAgent ?? undefined,
      reviewedAt: r.reviewedAt,
      reviewedBy: r.reviewedBy,
      commitSha: r.commitSha,
      commitUrl: r.commitUrl,
      skipped: parseJsonArray(r.skipped),
    };
  } catch {
    return null;
  }
}

export async function updateSiteRequestAsync(
  id: string,
  updates: Partial<SiteRequestModel>,
): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        let filter: Record<string, unknown> = { id };
        if (ObjectId.isValid(id)) {
          filter = { $or: [{ _id: new ObjectId(id) }, { id }] };
        }
        const res = await db.collection("site_requests").updateOne(filter, { $set: updates });
        return res.matchedCount > 0;
      }
    } catch (err) {
      console.error("[db.ts] updateSiteRequestAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    const numericId = Number(id);
    if (isNaN(numericId)) return false;
    const sets: string[] = [];
    const params: Record<string, unknown> = { id: numericId };

    if (updates.status !== undefined) {
      sets.push("status = @status");
      params.status = updates.status;
    }
    if (updates.reviewedAt !== undefined) {
      sets.push("reviewedAt = @reviewedAt");
      params.reviewedAt = updates.reviewedAt;
    }
    if (updates.reviewedBy !== undefined) {
      sets.push("reviewedBy = @reviewedBy");
      params.reviewedBy = updates.reviewedBy;
    }
    if (updates.commitSha !== undefined) {
      sets.push("commitSha = @commitSha");
      params.commitSha = updates.commitSha;
    }
    if (updates.commitUrl !== undefined) {
      sets.push("commitUrl = @commitUrl");
      params.commitUrl = updates.commitUrl;
    }
    if (updates.skipped !== undefined) {
      sets.push("skipped = @skipped");
      params.skipped = JSON.stringify(updates.skipped);
    }
    if (updates.siteName !== undefined) {
      sets.push("siteName = @siteName");
      params.siteName = updates.siteName;
    }
    if (updates.siteUrl !== undefined) {
      sets.push("siteUrl = @siteUrl");
      params.siteUrl = updates.siteUrl;
    }
    if (updates.siteFeature !== undefined) {
      sets.push("siteFeature = @siteFeature");
      params.siteFeature = updates.siteFeature;
    }
    if (updates.targets !== undefined) {
      sets.push("targets = @targets");
      params.targets = JSON.stringify(updates.targets);
    }

    if (sets.length === 0) return true;
    db.prepare(`UPDATE site_requests SET ${sets.join(", ")} WHERE id = @id`).run(params);
    return true;
  } catch (err) {
    console.error("[db.ts] updateSiteRequestAsync SQLite error:", err);
    return false;
  }
}

export async function getPendingRequestsCountAsync(): Promise<number> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        return await db
          .collection("site_requests")
          .countDocuments({ $or: [{ status: "pending" }, { status: null }, { status: { $exists: false } }] });
      }
    } catch (err) {
      console.error("[db.ts] getPendingRequestsCountAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    const row = db
      .prepare("SELECT COUNT(*) as c FROM site_requests WHERE status = 'pending' OR status IS NULL")
      .get() as { c: number } | undefined;
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

export async function getRecentSubmissionsAsync(
  limit = 4,
): Promise<Array<{ id: string; siteName: string; siteUrl: string; submittedAt: number }>> {
  const reqs = await getAllSiteRequestsAsync(undefined, limit);
  return reqs.map((r) => ({
    id: r.id,
    siteName: r.siteName,
    siteUrl: r.siteUrl,
    submittedAt: r.submittedAt,
  }));
}

// -------------------------------------------------------------
// DMCA REQUESTS (MongoDB with SQLite Fallback)
// -------------------------------------------------------------

export interface DmcaRequestModel {
  id: string;
  claimantName: string;
  organization?: string;
  email: string;
  infringingUrl: string;
  originalWorkDescription: string;
  digitalSignature: string;
  status: "pending" | "resolved" | "dismissed";
  submittedAt: number;
  submitterIp?: string;
  userAgent?: string;
  resolvedAt?: number | null;
  resolutionNotes?: string | null;
}

export async function insertDmcaRequestAsync(data: {
  claimantName: string;
  organization?: string;
  email: string;
  infringingUrl: string;
  originalWorkDescription: string;
  digitalSignature: string;
  submittedAt: number;
  submitterIp?: string;
  userAgent?: string;
}): Promise<string> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const res = await db.collection("dmca_requests").insertOne({
          ...data,
          status: "pending",
          resolvedAt: null,
          resolutionNotes: null,
        });
        return res.insertedId.toString();
      }
    } catch (err) {
      console.error("[db.ts] insertDmcaRequestAsync MongoDB error:", err);
    }
  }

  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO dmca_requests
       (claimantName, organization, email, infringingUrl, originalWorkDescription, digitalSignature, status, submittedAt, submitterIp, userAgent)
       VALUES
       (@claimantName, @organization, @email, @infringingUrl, @originalWorkDescription, @digitalSignature, 'pending', @submittedAt, @submitterIp, @userAgent)`,
    )
    .run({
      claimantName: data.claimantName,
      organization: data.organization ?? null,
      email: data.email,
      infringingUrl: data.infringingUrl,
      originalWorkDescription: data.originalWorkDescription,
      digitalSignature: data.digitalSignature,
      submittedAt: data.submittedAt,
      submitterIp: data.submitterIp ?? null,
      userAgent: data.userAgent ?? null,
    });
  return String(info.lastInsertRowid);
}

export async function getAllDmcaRequestsAsync(status?: string): Promise<DmcaRequestModel[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const filter = status && ["pending", "resolved", "dismissed"].includes(status) ? { status } : {};
        const docs = await db.collection("dmca_requests").find(filter).sort({ submittedAt: -1 }).toArray();
        return docs.map((d) => ({
          id: d._id ? d._id.toString() : String(d.id || ""),
          claimantName: d.claimantName,
          organization: d.organization,
          email: d.email,
          infringingUrl: d.infringingUrl,
          originalWorkDescription: d.originalWorkDescription,
          digitalSignature: d.digitalSignature,
          status: d.status ?? "pending",
          submittedAt: Number(d.submittedAt) || Date.now(),
          submitterIp: d.submitterIp,
          userAgent: d.userAgent,
          resolvedAt: d.resolvedAt ?? null,
          resolutionNotes: d.resolutionNotes ?? null,
        }));
      }
    } catch (err) {
      console.error("[db.ts] getAllDmcaRequestsAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    let rows: Array<{
      id: number;
      claimantName: string;
      organization: string | null;
      email: string;
      infringingUrl: string;
      originalWorkDescription: string;
      digitalSignature: string;
      status: string;
      submittedAt: number;
      submitterIp: string | null;
      userAgent: string | null;
      resolvedAt: number | null;
      resolutionNotes: string | null;
    }>;
    if (status && ["pending", "resolved", "dismissed"].includes(status)) {
      rows = db.prepare("SELECT * FROM dmca_requests WHERE status = ? ORDER BY submittedAt DESC").all(status) as typeof rows;
    } else {
      rows = db.prepare("SELECT * FROM dmca_requests ORDER BY submittedAt DESC").all() as typeof rows;
    }
    return rows.map((r) => ({
      id: String(r.id),
      claimantName: r.claimantName,
      organization: r.organization ?? undefined,
      email: r.email,
      infringingUrl: r.infringingUrl,
      originalWorkDescription: r.originalWorkDescription,
      digitalSignature: r.digitalSignature,
      status: (r.status || "pending") as DmcaRequestModel["status"],
      submittedAt: r.submittedAt,
      submitterIp: r.submitterIp ?? undefined,
      userAgent: r.userAgent ?? undefined,
      resolvedAt: r.resolvedAt,
      resolutionNotes: r.resolutionNotes,
    }));
  } catch {
    return [];
  }
}

export async function updateDmcaRequestAsync(
  id: string,
  updates: { status: "pending" | "resolved" | "dismissed"; resolutionNotes?: string; resolvedAt?: number },
): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        let filter: Record<string, unknown> = { id };
        if (ObjectId.isValid(id)) {
          filter = { $or: [{ _id: new ObjectId(id) }, { id }] };
        }
        const res = await db.collection("dmca_requests").updateOne(filter, {
          $set: {
            status: updates.status,
            resolutionNotes: updates.resolutionNotes ?? "",
            resolvedAt: updates.resolvedAt ?? Date.now(),
          },
        });
        return res.matchedCount > 0;
      }
    } catch (err) {
      console.error("[db.ts] updateDmcaRequestAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    const numericId = Number(id);
    if (isNaN(numericId)) return false;
    const info = db
      .prepare(
        `UPDATE dmca_requests
         SET status = @status, resolvedAt = @resolvedAt, resolutionNotes = @resolutionNotes
         WHERE id = @id`,
      )
      .run({
        id: numericId,
        status: updates.status,
        resolvedAt: updates.resolvedAt ?? Date.now(),
        resolutionNotes: updates.resolutionNotes ?? "",
      });
    return info.changes > 0;
  } catch (err) {
    console.error("[db.ts] updateDmcaRequestAsync SQLite error:", err);
    return false;
  }
}

export async function deleteDmcaRequestAsync(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        let filter: Record<string, unknown> = { id };
        if (ObjectId.isValid(id)) {
          filter = { $or: [{ _id: new ObjectId(id) }, { id }] };
        }
        const res = await db.collection("dmca_requests").deleteOne(filter);
        return res.deletedCount > 0;
      }
    } catch (err) {
      console.error("[db.ts] deleteDmcaRequestAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    const numericId = Number(id);
    if (isNaN(numericId)) return false;
    db.prepare("DELETE FROM dmca_requests WHERE id = ?").run(numericId);
    return true;
  } catch {
    return false;
  }
}

export async function getPendingDmcaCountAsync(): Promise<number> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        return await db
          .collection("dmca_requests")
          .countDocuments({ $or: [{ status: "pending" }, { status: null }, { status: { $exists: false } }] });
      }
    } catch (err) {
      console.error("[db.ts] getPendingDmcaCountAsync MongoDB error:", err);
    }
  }

  try {
    const db = getDb();
    const row = db
      .prepare("SELECT COUNT(*) as c FROM dmca_requests WHERE status = 'pending' OR status IS NULL")
      .get() as { c: number } | undefined;
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

// -------------------------------------------------------------
// LEGACY SYNCHRONOUS HELPERS (Maintained for backward compatibility)
// -------------------------------------------------------------

export function recordVisit(): number {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT value FROM site_analytics WHERE key = 'total_visits'").get() as
      | { value: number }
      | undefined;
    if (!existing) {
      db.prepare("INSERT INTO site_analytics (key, value) VALUES ('total_visits', 1)").run();
      return 1;
    }
    db.prepare("UPDATE site_analytics SET value = value + 1 WHERE key = 'total_visits'").run();
    const row = db.prepare("SELECT value FROM site_analytics WHERE key = 'total_visits'").get() as
      | { value: number }
      | undefined;
    return typeof row?.value === "number" ? row.value : 1;
  } catch (err) {
    console.error("recordVisit error", err);
    return 1;
  }
}

export function getTotalVisits(): number {
  try {
    const db = getDb();
    const row = db.prepare("SELECT value FROM site_analytics WHERE key = 'total_visits'").get() as
      | { value: number }
      | undefined;
    if (typeof row?.value === "number") return row.value;
    db.prepare("INSERT OR IGNORE INTO site_analytics (key, value) VALUES ('total_visits', 1)").run();
    return 1;
  } catch (err) {
    console.error("getTotalVisits error", err);
    return 1;
  }
}

function parseJsonArray<T>(raw: string | null | undefined): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
