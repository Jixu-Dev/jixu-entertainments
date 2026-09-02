import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { AdminTopbar } from "@/components/admin/topbar";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin Panel · Jixu Entertainments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const isOwner = user?.githubLogin.toLowerCase() === env.REPO_OWNER().toLowerCase();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] selection:bg-[var(--accent)] selection:text-white">
      {/* Handshake AI Style Floating Capsule Command Bar */}
      <AdminTopbar user={user} isOwner={isOwner} />

      <main className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-8 lg:px-12 2xl:px-16">
        {children}
      </main>
    </div>
  );
}
