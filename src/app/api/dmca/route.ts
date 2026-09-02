import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { insertDmcaRequestAsync } from "@/lib/db";
import { notifyDmcaSubmission } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DmcaSubmitBody {
  claimantName?: string;
  organization?: string;
  email?: string;
  infringingUrl?: string;
  originalWorkDescription?: string;
  digitalSignature?: string;
  goodFaithCheck?: boolean;
  accuracyCheck?: boolean;
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

function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
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

  let body: DmcaSubmitBody;
  try {
    body = (await req.json()) as DmcaSubmitBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const claimantName = body.claimantName?.trim() ?? "";
  const organization = body.organization?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const infringingUrl = body.infringingUrl?.trim() ?? "";
  const originalWorkDescription = body.originalWorkDescription?.trim() ?? "";
  const digitalSignature = body.digitalSignature?.trim() ?? "";

  if (!claimantName || !email || !infringingUrl || !originalWorkDescription || !digitalSignature) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  if (!isValidUrl(infringingUrl)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  if (
    claimantName.length > 120 ||
    organization.length > 150 ||
    originalWorkDescription.length > 4000 ||
    digitalSignature.length > 120
  ) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }

  if (!body.goodFaithCheck || !body.accuracyCheck) {
    return NextResponse.json({ error: "legal_checks_required" }, { status: 400 });
  }

  let ticketId = Date.now().toString(36).toUpperCase();

  try {
    ticketId = await insertDmcaRequestAsync({
      claimantName,
      organization,
      email,
      infringingUrl,
      originalWorkDescription,
      digitalSignature,
      submittedAt: Date.now(),
      submitterIp: ip,
      userAgent: h.get("user-agent") ?? "",
    });
  } catch (dbErr) {
    console.warn("DMCA DB storage warning:", dbErr);
  }

  // Always await Discord alert dispatch
  notifyDmcaSubmission({
    claimantName,
    organization,
    email,
    infringingUrl,
    originalWorkDescription,
    digitalSignature,
    submitterIp: ip,
  }).catch((e) => console.warn("[dmca] discord notification warning:", e));

  return NextResponse.json({
    ok: true,
    id: ticketId,
    message: "DMCA takedown notice submitted successfully. It will be reviewed by the compliance officer.",
  });
}
