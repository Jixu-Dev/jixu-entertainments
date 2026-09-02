import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSessionToken } from "@/lib/auth/session";
import {
  getAllSiteRequestsAsync,
  getSiteRequestByIdAsync,
  updateSiteRequestAsync,
  type SiteRequestModel,
} from "@/lib/db";
import { commitChanges, getRepoFile, type FileChange } from "@/lib/github/repo";
import { linksPathForRegion } from "@/lib/admin/paths";
import type { Category, LinksData, Site } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "approved", "rejected", "spam"] as const;
type Status = (typeof VALID_STATUSES)[number];

interface Target {
  region: string;
  categoryId: string;
}

interface RequestDoc {
  _id: string;
  siteUrl: string;
  siteName: string;
  siteFeature?: string;
  targets: Target[];
  status?: Status;
}

function modelToDoc(m: SiteRequestModel): RequestDoc {
  return {
    _id: m.id,
    siteUrl: m.siteUrl,
    siteName: m.siteName,
    siteFeature: m.siteFeature,
    targets: m.targets,
    status: m.status as Status,
  };
}

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 500);

  const rows = await getAllSiteRequestsAsync(status, limit);

  const items = rows.map((row) => ({
    id: row.id,
    siteUrl: row.siteUrl,
    siteName: row.siteName,
    siteFeature: row.siteFeature ?? undefined,
    targets: row.targets,
    status: row.status,
    submittedAt: new Date(row.submittedAt).toISOString(),
    reviewedBy: row.reviewedBy ?? null,
    reviewedAt: row.reviewedAt ? new Date(row.reviewedAt).toISOString() : null,
    commitSha: row.commitSha ?? null,
    commitUrl: row.commitUrl ?? null,
  }));

  return NextResponse.json({ items });
}

interface RequestOverrides {
  siteName?: string;
  siteUrl?: string;
  siteFeature?: string;
  targets?: Target[];
}

function applyOverrides(doc: RequestDoc, ov: RequestOverrides | undefined): RequestDoc {
  if (!ov) return doc;
  const next: RequestDoc = { ...doc };
  if (typeof ov.siteName === "string" && ov.siteName.trim()) next.siteName = ov.siteName.trim();
  if (typeof ov.siteUrl === "string" && ov.siteUrl.trim()) next.siteUrl = ov.siteUrl.trim();
  if (typeof ov.siteFeature === "string") next.siteFeature = ov.siteFeature;
  if (Array.isArray(ov.targets)) {
    const clean: Target[] = [];
    const seen = new Set<string>();
    for (const t of ov.targets) {
      if (!t || typeof t.region !== "string" || typeof t.categoryId !== "string") continue;
      const region = t.region.trim().toUpperCase();
      const categoryId = t.categoryId.trim().toLowerCase();
      if (!region || !categoryId) continue;
      const key = `${region}::${categoryId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      clean.push({ region, categoryId });
    }
    if (clean.length) next.targets = clean;
  }
  return next;
}

interface LogoInput {
  existingPath?: string;
  upload?: {
    fileName: string;
    contentBase64: string;
    categoryHint?: string;
  };
}

function sanitizeFileName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "logo.png"
  );
}

async function appendSiteToRegions(
  token: string,
  doc: RequestDoc,
  logo: LogoInput | undefined,
): Promise<{ commitSha: string; commitUrl: string; addedTo: number; skipped: string[]; logoPath: string | null }> {
  const byRegion = new Map<string, string[]>();
  for (const t of doc.targets) {
    const region = t.region.toUpperCase();
    const arr = byRegion.get(region) ?? [];
    arr.push(t.categoryId);
    byRegion.set(region, arr);
  }

  const changes: FileChange[] = [];
  const skipped: string[] = [];
  let addedTo = 0;

  let logoPath: string | null = null;
  const firstCategoryId = doc.targets[0]?.categoryId;
  if (logo?.upload && firstCategoryId) {
    const cat = (logo.upload.categoryHint ?? firstCategoryId).toLowerCase();
    const file = sanitizeFileName(logo.upload.fileName);
    logoPath = `./logo/${cat}/${file}`;
    changes.push({
      path: `public/logo/${cat}/${file}`,
      content: logo.upload.contentBase64,
      encoding: "base64",
    });
  } else if (logo?.existingPath) {
    logoPath = logo.existingPath.startsWith("./logo/")
      ? logo.existingPath
      : `./logo/${logo.existingPath.replace(/^\/?logo\//, "")}`;
  }

  for (const [region, categoryIds] of byRegion) {
    const filePath = linksPathForRegion(region);
    const raw = await getRepoFile({ token, path: filePath });
    if (!raw) {
      skipped.push(`${region}: file not found`);
      continue;
    }
    let parsed: LinksData;
    try {
      parsed = JSON.parse(raw) as LinksData;
    } catch {
      skipped.push(`${region}: invalid JSON`);
      continue;
    }
    if (!Array.isArray(parsed.categories)) {
      skipped.push(`${region}: malformed`);
      continue;
    }

    let mutated = false;
    for (const categoryId of categoryIds) {
      const cat = parsed.categories.find((c: Category) => c.id === categoryId);
      if (!cat) {
        skipped.push(`${region}/${categoryId}: category missing`);
        continue;
      }
      const dup = cat.sites.some(
        (s: Site) => s.url.trim().toLowerCase() === doc.siteUrl.trim().toLowerCase(),
      );
      if (dup) {
        skipped.push(`${region}/${categoryId}: duplicate URL`);
        continue;
      }
      const newSite: Site = {
        name: doc.siteName,
        url: doc.siteUrl,
        logo: logoPath ?? `./logo/${categoryId}/`,
        status: "new",
        enabled: true,
      };
      cat.sites.push(newSite);
      mutated = true;
      addedTo++;
    }

    if (mutated) {
      changes.push({
        path: filePath,
        content: JSON.stringify(parsed, null, 2) + "\n",
        encoding: "utf-8",
      });
    }
  }

  if (changes.length === 0) {
    throw new Error(
      skipped.length ? `nothing_to_add: ${skipped.join("; ")}` : "nothing_to_add",
    );
  }

  const message = `admin: approve "${doc.siteName}" (${addedTo} target${addedTo === 1 ? "" : "s"})`;
  const result = await commitChanges({ token, message, changes });
  return { commitSha: result.commitSha, commitUrl: result.url, addedTo, skipped, logoPath };
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  let body: { id?: string; status?: string; logo?: LogoInput; overrides?: RequestOverrides };
  try {
    body = (await req.json()) as {
      id?: string;
      status?: string;
      logo?: LogoInput;
      overrides?: RequestOverrides;
    };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { id, status, logo, overrides } = body;
  if (!id || !status) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  if (!(VALID_STATUSES as readonly string[]).includes(status as Status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const existing = await getSiteRequestByIdAsync(id);
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const doc = modelToDoc(existing);

  let commitSha: string | null = null;
  let commitUrl: string | null = null;
  let addedTo = 0;
  let skipped: string[] = [];

  const effectiveDoc = applyOverrides(doc, overrides);

  if (status === "approved") {
    const token = await getSessionToken();
    if (!token) return NextResponse.json({ error: "no_token" }, { status: 401 });
    if (!effectiveDoc.targets || effectiveDoc.targets.length === 0) {
      return NextResponse.json({ error: "no_targets" }, { status: 400 });
    }
    try {
      const r = await appendSiteToRegions(token, effectiveDoc, logo);
      commitSha = r.commitSha;
      commitUrl = r.commitUrl;
      addedTo = r.addedTo;
      skipped = r.skipped;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "commit_failed";
      return NextResponse.json({ error: "approve_failed", detail: msg }, { status: 500 });
    }
  }

  const updates: Partial<SiteRequestModel> = {
    status: status as Status,
    reviewedBy: auth.session.githubLogin,
    reviewedAt: Date.now(),
  };

  if (overrides) {
    if (effectiveDoc.siteName !== doc.siteName) updates.siteName = effectiveDoc.siteName;
    if (effectiveDoc.siteUrl !== doc.siteUrl) updates.siteUrl = effectiveDoc.siteUrl;
    if (effectiveDoc.siteFeature !== doc.siteFeature) updates.siteFeature = effectiveDoc.siteFeature;
    if (effectiveDoc.targets !== doc.targets) updates.targets = effectiveDoc.targets;
  }
  if (commitSha) updates.commitSha = commitSha;
  if (commitUrl) updates.commitUrl = commitUrl;
  if (skipped.length) updates.skipped = skipped;

  await updateSiteRequestAsync(id, updates);

  return NextResponse.json({
    ok: true,
    commitSha,
    commitUrl,
    addedTo,
    skipped,
  });
}
