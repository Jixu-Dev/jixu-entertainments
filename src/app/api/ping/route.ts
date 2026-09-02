import { NextResponse } from "next/server";
import { recordVisitAsync, getTotalVisitsAsync, getOnlineCountAsync } from "@/lib/db";
import { notifyVisitorMilestone } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientInfo(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const cf = req.headers.get("cf-connecting-ip") ?? "";
  const real = req.headers.get("x-real-ip") ?? "";
  const ip = cf || fwd.split(",")[0]?.trim() || real || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const referer = req.headers.get("referer") ?? "";

  // Create a stable visitor ID from IP + simplified UA
  const uaPart = userAgent.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  const visitorId = `${ip}::${uaPart}`;

  return { ip, userAgent, referer, visitorId };
}

export async function GET(req: Request) {
  const now = Date.now();
  const { ip, userAgent, referer, visitorId } = getClientInfo(req);

  try {
    const { totalVisits, online } = await recordVisitAsync(visitorId, { ip, userAgent, referer });
    return NextResponse.json(
      {
        online,
        totalVisits,
        serverTime: now,
      },
      {
        headers: { "cache-control": "no-store, max-age=0" },
      },
    );
  } catch {
    const [totalVisits, online] = await Promise.all([getTotalVisitsAsync(), getOnlineCountAsync()]);
    return NextResponse.json(
      {
        online: Math.max(1, online),
        totalVisits: Math.max(1, totalVisits),
        serverTime: now,
      },
      {
        headers: { "cache-control": "no-store, max-age=0" },
      },
    );
  }
}

export async function POST(req: Request) {
  const now = Date.now();
  const { ip, userAgent, referer, visitorId } = getClientInfo(req);

  try {
    const { totalVisits, online, isNew } = await recordVisitAsync(visitorId, { ip, userAgent, referer });

    // If this visit pushed us to a traffic milestone, fire Discord webhook asynchronously
    if (isNew) {
      notifyVisitorMilestone(totalVisits, online).catch((e) =>
        console.warn("[ping] milestone webhook warning:", e),
      );
    }

    return NextResponse.json(
      {
        online: Math.max(1, online),
        totalVisits: Math.max(1, totalVisits),
        serverTime: now,
      },
      {
        headers: { "cache-control": "no-store, max-age=0" },
      },
    );
  } catch (err) {
    console.error("[api/ping] error:", err);
    const [totalVisits, online] = await Promise.all([getTotalVisitsAsync(), getOnlineCountAsync()]);
    return NextResponse.json(
      {
        online: Math.max(1, online),
        totalVisits: Math.max(1, totalVisits),
        serverTime: now,
      },
      {
        headers: { "cache-control": "no-store, max-age=0" },
      },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
