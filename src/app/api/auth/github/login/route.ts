import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { authorizeUrl } from "@/lib/auth/github";
import { setOAuthState } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = env.GITHUB_CLIENT_ID();
  if (!clientId) {
    return NextResponse.redirect(`${env.SITE_URL()}/admin-panel/login?error=no_token`);
  }

  const state = randomBytes(16).toString("base64url");
  await setOAuthState(state);
  return NextResponse.redirect(authorizeUrl(state));
}
