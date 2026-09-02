import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/require-admin";
import {
  getAllDmcaRequestsAsync,
  updateDmcaRequestAsync,
  deleteDmcaRequestAsync,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireOwner();
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;

  try {
    const rows = await getAllDmcaRequestsAsync(status);
    return NextResponse.json({ items: rows });
  } catch (e) {
    console.error("fetch dmca error", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireOwner();
  if (!auth.ok) return auth.res;

  let body: { id?: string | number; status?: "pending" | "resolved" | "dismissed"; resolutionNotes?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { id, status, resolutionNotes } = body;
  if (!id || !status || !["pending", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const success = await updateDmcaRequestAsync(String(id), {
      status,
      resolutionNotes: resolutionNotes || "",
      resolvedAt: Date.now(),
    });

    if (!success) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("update dmca error", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireOwner();
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  try {
    const success = await deleteDmcaRequestAsync(id);
    if (!success) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete dmca error", e);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
