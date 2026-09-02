import "server-only";
import { NextResponse } from "next/server";
import { getSession, type SessionRecord } from "./session";
import { env } from "../env";

export async function requireAdmin(): Promise<
  { ok: true; session: SessionRecord } | { ok: false; res: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { ok: true, session };
}

export async function requireOwner(): Promise<
  { ok: true; session: SessionRecord } | { ok: false; res: NextResponse }
> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const owner = env.REPO_OWNER().toLowerCase();
  if (auth.session.githubLogin.toLowerCase() !== owner) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "forbidden", detail: "Only the repository owner is authorized to access legal DMCA requests." },
        { status: 403 },
      ),
    };
  }
  return { ok: true, session: auth.session };
}
