import { getSession } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { redirect } from "next/navigation";
import { DmcaInboxClient } from "./dmca-inbox-client";
import { Lock, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Owner DMCA Inbox · Jixu Admin",
};

export const dynamic = "force-dynamic";

export default async function DmcaAdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin-panel/login");
  }

  const owner = env.REPO_OWNER().toLowerCase();
  const isOwner = session.githubLogin.toLowerCase() === owner;

  if (!isOwner) {
    return (
      <div className="porcelain-card p-10 rounded-3xl text-center max-w-lg mx-auto my-12 border-rose-500/30">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold text-[var(--fg)] font-space">Owner Access Restricted</h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
          DMCA takedown notices contain sensitive legal communications and are strictly restricted to the primary repository owner (<strong>@{env.REPO_OWNER()}</strong>).
        </p>
        <div className="mt-6">
          <a
            href="/admin-panel"
            className="porcelain-pill inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
          >
            Return to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-500 mb-1">
            <Lock size={13} />
            <span>Owner-Only Legal Confidential</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)] font-space">
            DMCA Legal Inbox
          </h1>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)]">
            Review, investigate, and resolve copyright takedown notices submitted by content owners.
          </p>
        </div>
      </div>

      <DmcaInboxClient />
    </div>
  );
}
