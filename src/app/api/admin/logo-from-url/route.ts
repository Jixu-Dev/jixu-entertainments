import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB hard cap
const ALLOWED = /^image\/(png|jpe?g|svg\+xml|gif|webp|x-icon|avif|vnd\.microsoft\.icon)$/i;

function isPrivateIpOrHost(hostname: string): boolean {
  const h = hostname.toLowerCase().trim();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;

  // IPv4 private ranges
  const match = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (match) {
    const [, a, b] = match.map(Number);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 Link-local / Cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 0) return true;
  }
  return false;
}

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("png")) return ".png";
  if (m.includes("svg")) return ".svg";
  if (m.includes("jpeg") || m.includes("jpg")) return ".jpg";
  if (m.includes("gif")) return ".gif";
  if (m.includes("webp")) return ".webp";
  if (m.includes("avif")) return ".avif";
  if (m.includes("icon")) return ".ico";
  return ".png";
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const url = body.url?.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (isPrivateIpOrHost(parsedUrl.hostname)) {
      return NextResponse.json({ error: "forbidden_host", detail: "Internal/private network hosts are blocked." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": "Jixu-Entertainments-Admin/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "fetch_failed", detail: e instanceof Error ? e.message : "unknown" },
      { status: 502 },
    );
  }
  if (!res.ok) {
    return NextResponse.json({ error: "fetch_failed", detail: `http ${res.status}` }, { status: 502 });
  }

  const contentType = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
  if (!ALLOWED.test(contentType)) {
    return NextResponse.json({ error: "not_an_image", detail: contentType }, { status: 415 });
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "too_large", detail: `${buf.length} bytes` }, { status: 413 });
  }

  let suggestedName = "";
  try {
    const tail = parsedUrl.pathname.split("/").pop() ?? "";
    suggestedName = tail || parsedUrl.hostname;
  } catch {
    suggestedName = "logo";
  }

  return NextResponse.json({
    ok: true,
    contentBase64: buf.toString("base64"),
    mimeType: contentType,
    suggestedExt: extFromMime(contentType),
    suggestedName,
    bytes: buf.length,
  });
}
