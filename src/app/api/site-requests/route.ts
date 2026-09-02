import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { insertSiteRequestAsync } from "@/lib/db";
import { notifySiteSubmission } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Target {
  region: string;
  categoryId: string;
}

interface SubmitBody {
  siteUrl?: string;
  siteName?: string;
  siteFeature?: string;
  targets?: Target[];
}

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count++;
  return true;
}

function isValidUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "unknown";

  if (!checkRate(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const siteUrl = body.siteUrl?.trim() ?? "";
  const siteName = body.siteName?.trim() ?? "";
  const siteFeature = body.siteFeature?.trim() ?? "";
  const targets = Array.isArray(body.targets) ? body.targets : [];

  if (!siteUrl || !siteName || !siteFeature) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!isValidUrl(siteUrl)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
  if (siteName.length > 120 || siteFeature.length > 2000) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }
  const cleanTargets = targets
    .filter(
      (t): t is Target =>
        !!t &&
        typeof t.region === "string" &&
        typeof t.categoryId === "string" &&
        t.region.length > 0 &&
        t.categoryId.length > 0,
    )
    .slice(0, 20);
  if (cleanTargets.length === 0) {
    return NextResponse.json({ error: "no_targets" }, { status: 400 });
  }

  let submissionId = Date.now().toString(36).toUpperCase();

  try {
    submissionId = await insertSiteRequestAsync({
      siteUrl,
      siteName,
      siteFeature,
      targets: cleanTargets,
      submittedAt: Date.now(),
      submitterIp: ip,
      userAgent: h.get("user-agent") ?? "",
    });
  } catch (e) {
    console.warn("site-request DB warning:", e);
  }

  // Always notify Discord
  notifySiteSubmission({
    siteName,
    siteUrl,
    siteFeature,
    targets: cleanTargets,
    submitterIp: ip,
  }).catch((e) => console.warn("[site-request] discord notification warning:", e));

  return NextResponse.json({ ok: true, id: submissionId });
}
