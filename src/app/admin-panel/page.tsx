import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Globe2,
  Film,
  Inbox,
  ExternalLink,
  Wrench,
  Scale,
  Zap,
  ArrowRight,
  Activity,
  Plus,
  Layers,
  Play,
  Tv,
  Sparkles,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getRegions, getLinksForRegion } from "@/lib/data";
import {
  getTotalVisitsAsync,
  getPendingRequestsCountAsync,
  getPendingDmcaCountAsync,
  getRecentSubmissionsAsync,
} from "@/lib/db";
import { env } from "@/lib/env";
import { FlagIcon } from "@/components/flag-icon";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Studio Dashboard · Jixu Entertainments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface RecentSubmission {
  id: string | number;
  siteName: string;
  siteUrl: string;
  submittedAt: number;
}

// Category aesthetic themes & background artwork gradients
const CATEGORY_THEMES: Record<
  string,
  {
    gradient: string;
    glow: string;
    border: string;
    iconColor: string;
    subtitle: string;
    bgPattern: string;
  }
> = {
  movies_shows: {
    gradient: "from-[#4F46E5]/90 via-[#7C3AED]/70 to-[#0F172A]/95",
    glow: "rgba(99, 102, 241, 0.35)",
    border: "border-indigo-500/30",
    iconColor: "text-indigo-400",
    subtitle: "Blockbuster 4K, Hollywood & Cinema",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.4) 0%, transparent 60%)",
  },
  anime: {
    gradient: "from-[#DB2777]/90 via-[#9333EA]/70 to-[#0F172A]/95",
    glow: "rgba(236, 72, 153, 0.35)",
    border: "border-pink-500/30",
    iconColor: "text-pink-400",
    subtitle: "Sub & Dub Simulcasts, OVA & Movies",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.4) 0%, transparent 60%)",
  },
  manga: {
    gradient: "from-[#D97706]/90 via-[#DC2626]/70 to-[#0F172A]/95",
    glow: "rgba(245, 158, 11, 0.35)",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    subtitle: "Manhwa, Manhua & Webtoons",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.4) 0%, transparent 60%)",
  },
  livetv: {
    gradient: "from-[#059669]/90 via-[#0284C7]/70 to-[#0F172A]/95",
    glow: "rgba(16, 185, 129, 0.35)",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    subtitle: "Global Live Sports, Cable & Broadcasts",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.4) 0%, transparent 60%)",
  },
  paid_apps: {
    gradient: "from-[#CA8A04]/90 via-[#EA580C]/70 to-[#0F172A]/95",
    glow: "rgba(234, 179, 8, 0.35)",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    subtitle: "Official OTT Platforms & Premium Subs",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(234, 179, 8, 0.4) 0%, transparent 60%)",
  },
  apps: {
    gradient: "from-[#2563EB]/90 via-[#06B6D4]/70 to-[#0F172A]/95",
    glow: "rgba(37, 99, 235, 0.35)",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    subtitle: "Android APKs, Smart TV & Stremio Addons",
    bgPattern: "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.4) 0%, transparent 60%)",
  },
};

async function getDashboardData() {
  const [regions, usa, lifetimeVisits, pendingRequests, pendingDmca, recentSubmissions] =
    await Promise.all([
      getRegions(),
      getLinksForRegion("USA"),
      getTotalVisitsAsync().catch(() => 1),
      getPendingRequestsCountAsync().catch(() => 0),
      getPendingDmcaCountAsync().catch(() => 0),
      getRecentSubmissionsAsync(4).catch(() => []),
    ]);

  const siteCount = usa.categories.reduce((sum, c) => sum + c.sites.length, 0);

  return {
    regions,
    categories: usa.categories,
    siteCount,
    pendingRequests,
    pendingDmca,
    recentSubmissions,
    lifetimeVisits,
  };
}

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin-panel/login");

  const isOwner = user.githubLogin.toLowerCase() === env.REPO_OWNER().toLowerCase();
  const data = await getDashboardData();
  const repo = `${env.REPO_OWNER()}/${env.REPO_NAME()}`;

  return (
    <div className="w-full space-y-8 pb-16">
      {/* 1. Full-Width Panoramic Hero Console */}
      <div className="w-full relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8 backdrop-blur-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <Image
                src={user.avatarUrl}
                alt={user.githubLogin}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl ring-2 ring-[var(--accent)]/40 object-cover shadow-sm"
                unoptimized
              />
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] text-white ring-2 ring-[var(--bg)] font-bold">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold font-space text-[var(--fg)] tracking-tight">
                  Welcome back, {user.githubLogin}
                </h1>
                {isOwner && (
                  <span className="rounded-full bg-rose-500/15 px-3 py-0.5 text-xs font-mono font-bold uppercase text-rose-500 border border-rose-500/30">
                    👑 Owner
                  </span>
                )}
              </div>

              <div className="text-xs text-[var(--fg-muted)] flex flex-wrap items-center gap-2 font-mono">
                <span>Repository:</span>
                <a
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <span>{repo}</span>
                  <ExternalLink size={11} />
                </a>
                <span className="text-[var(--border)]">•</span>
                <span>branch: {env.REPO_BRANCH()}</span>
                <span className="text-[var(--border)]">•</span>
                <span className="text-emerald-500 font-bold">● Live Sync Active</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button Bar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin-panel/sites"
              className="inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer font-space"
              style={{
                background: "linear-gradient(135deg, #5B3DF5 0%, #3B82F6 100%)",
              }}
            >
              <Plus size={15} />
              <span>Add Streaming Site</span>
            </Link>

            <Link
              href="/admin-panel/tools"
              className="porcelain-pill inline-flex h-11 items-center gap-2 px-5 text-xs font-semibold"
            >
              <Wrench size={14} />
              <span>Power Tools</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="porcelain-pill inline-flex h-11 items-center gap-2 px-5 text-xs font-semibold"
            >
              <ExternalLink size={14} />
              <span>View Public Site</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Full-Width Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="porcelain-card rounded-3xl p-6 border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Worldwide Regions
            </span>
            <Globe2 size={18} className="text-blue-500" />
          </div>
          <div className="mt-3 text-4xl font-bold font-space text-[var(--fg)] tracking-tight">
            {data.regions.length}
          </div>
          <div className="mt-2 text-xs text-[var(--fg-muted)]">
            <span className="text-emerald-500 font-bold">100% active</span> · Global territories
          </div>
        </div>

        {/* Metric 2 */}
        <div className="porcelain-card rounded-3xl p-6 border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Media Catalogs
            </span>
            <Layers size={18} className="text-purple-500" />
          </div>
          <div className="mt-3 text-4xl font-bold font-space text-[var(--fg)] tracking-tight">
            {data.categories.length}
          </div>
          <div className="mt-2 text-xs text-[var(--fg-muted)]">
            Movies, Anime, TV, Sports & Cartoons
          </div>
        </div>

        {/* Metric 3 */}
        <div className="porcelain-card rounded-3xl p-6 border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Verified Mirrors
            </span>
            <Film size={18} className="text-emerald-500" />
          </div>
          <div className="mt-3 text-4xl font-bold font-space text-[var(--fg)] tracking-tight">
            {data.siteCount}
          </div>
          <div className="mt-2 text-xs text-[var(--fg-muted)]">
            Active streaming sources
          </div>
        </div>

        {/* Metric 4 */}
        <div className="porcelain-card rounded-3xl p-6 border border-[var(--border)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Pending Queues
            </span>
            <Inbox size={18} className="text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold font-space text-[var(--fg)] tracking-tight">
              {data.pendingRequests}
            </span>
            <span className="text-xs font-mono text-[var(--fg-muted)]">site requests</span>
          </div>
          <div className="mt-2 text-xs text-[var(--fg-muted)] flex items-center justify-between">
            <span>DMCA notices:</span>
            <span className={cn("font-bold font-mono", data.pendingDmca > 0 ? "text-rose-500" : "text-emerald-500")}>
              {data.pendingDmca} pending
            </span>
          </div>
        </div>
      </div>

      {/* 3. Wide Panoramic Two-Column Studio Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left / Main Column (2/3 width) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Cinematic Poster Cover Catalogs Showcase */}
          <div className="porcelain-card rounded-3xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--bg-card)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-space text-[var(--fg)] tracking-tight">
                  Streaming Directory Catalogs
                </h2>
                <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-1">
                  Manage links, mirrors, logos, and custom categorizations across all active media types.
                </p>
              </div>

              <Link
                href="/admin-panel/sites"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline font-space"
              >
                <span>Edit All Sites</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Poster Cover Catalog Grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {data.categories.map((cat) => {
                const theme =
                  CATEGORY_THEMES[cat.id] ?? {
                    gradient: "from-[#4F46E5]/90 via-[#7C3AED]/70 to-[#0F172A]/95",
                    glow: "rgba(99, 102, 241, 0.35)",
                    border: "border-indigo-500/30",
                    iconColor: "text-indigo-400",
                    subtitle: "Streaming Media Directory",
                    bgPattern: "none",
                  };

                // Get top 4 sites with logos for visual cover collage
                const topSitesWithLogos = cat.sites
                  .filter((s) => s.logo && s.logo !== `./logo/${cat.id}/`)
                  .slice(0, 4);

                return (
                  <Link
                    key={cat.id}
                    href={`/admin-panel/sites#cat-${cat.id}`}
                    className={cn(
                      "group relative min-h-[170px] overflow-hidden rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl cursor-pointer",
                      theme.border
                    )}
                    style={{
                      background: `linear-gradient(145deg, var(--bg-card), var(--bg-surface))`,
                    }}
                  >
                    {/* Cinematic Poster Gradient Backdrop */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-85 transition-opacity duration-300 group-hover:opacity-100",
                        theme.gradient
                      )}
                    />

                    {/* Radial Glow Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                      style={{ background: theme.bgPattern }}
                    />

                    {/* Floating Platform Logo Stack / Poster Collage in Background */}
                    <div className="absolute -right-2 -bottom-2 flex items-center gap-1.5 opacity-30 group-hover:opacity-45 transition-all duration-300 transform group-hover:scale-105 pointer-events-none">
                      {topSitesWithLogos.map((s, idx) => (
                        <div
                          key={idx}
                          className="grid h-12 w-12 place-items-center rounded-2xl bg-black/40 p-2 backdrop-blur-md border border-white/10 shadow-lg"
                        >
                          <Image
                            src={s.logo.replace(/^\./, "")}
                            alt=""
                            width={36}
                            height={36}
                            className="max-h-full max-w-full object-contain filter drop-shadow"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>

                    {/* Top Content Row: Category Title + Site Pill */}
                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold font-space text-white tracking-tight drop-shadow-md group-hover:text-white transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] font-medium text-white/80 mt-0.5 line-clamp-1 drop-shadow-xs">
                          {theme.subtitle}
                        </p>
                      </div>

                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-white backdrop-blur-md border border-white/20 shrink-0 shadow-xs">
                        {cat.sites.length} sites
                      </span>
                    </div>

                    {/* Bottom Content Row: Top Names Preview & Quick Action */}
                    <div className="relative z-10 pt-4 flex items-end justify-between border-t border-white/15 text-xs">
                      <div className="font-mono text-[10px] text-white/90 truncate max-w-[140px] drop-shadow-xs">
                        {cat.sites.slice(0, 3).map((s) => s.name).join(", ")}
                        {cat.sites.length > 3 ? "..." : ""}
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-xl bg-white/25 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md group-hover:bg-white group-hover:text-black transition-all shadow-xs">
                        <span>Edit</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Worldwide Regions Matrix */}
          <div className="porcelain-card rounded-3xl p-6 sm:p-8 border border-[var(--border)] bg-[var(--bg-card)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-space text-[var(--fg)] tracking-tight">
                  Global Territories & Localization
                </h2>
                <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-1">
                  Configure country landing pages, toggle regional streaming availability, and edit national mirrors.
                </p>
              </div>

              <Link
                href="/admin-panel/regions"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline font-space"
              >
                <span>Manage Regions</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
              {data.regions.map((reg) => (
                <Link
                  key={reg.code}
                  href={`/admin-panel/sites?region=${reg.code}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3.5 text-center hover:border-[var(--accent)] hover:shadow-md transition-all flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="h-7 w-9 flex items-center justify-center filter drop-shadow-xs group-hover:scale-110 transition-transform">
                    {reg.flag && <FlagIcon code={reg.flag} size={22} />}
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                    {reg.code}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (1/3 width) */}
        <div className="space-y-8">
          {/* Recent Submissions Feed */}
          <div className="porcelain-card rounded-3xl p-6 border border-[var(--border)] bg-[var(--bg-card)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-space text-[var(--fg)] tracking-tight">
                Site Requests Queue
              </h3>
              {data.pendingRequests > 0 && (
                <span className="rounded-full bg-amber-500 text-black px-2.5 py-0.5 text-[10px] font-mono font-bold">
                  {data.pendingRequests} New
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {data.recentSubmissions.length > 0 ? (
                data.recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3.5 text-xs space-y-1 hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="font-space text-[var(--fg)]">{sub.siteName}</strong>
                      <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[var(--accent)] truncate">
                      {sub.siteUrl}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[var(--fg-muted)] rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                  ✨ No pending submissions. All requests reviewed!
                </div>
              )}
            </div>

            <Link
              href="/admin-panel/requests"
              className="block w-full text-center py-2.5 text-xs font-bold font-space rounded-2xl bg-[var(--accent)] text-white shadow-xs hover:opacity-90 transition-opacity"
            >
              Open Submissions Inbox →
            </Link>
          </div>

          {/* Quick Power Tools Launchpad */}
          <div className="porcelain-card rounded-3xl p-6 border border-[var(--border)] bg-[var(--bg-card)] space-y-5">
            <h3 className="text-lg font-bold font-space text-[var(--fg)] tracking-tight">
              Power Tools Launchpad
            </h3>

            <div className="space-y-2">
              <Link
                href="/admin-panel/tools"
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3.5 hover:border-[var(--accent)] transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--fg)] font-space group-hover:text-[var(--accent)]">
                    Domain URL Replace
                  </div>
                  <div className="text-[10px] text-[var(--fg-muted)]">
                    Swap dead mirrors worldwide
                  </div>
                </div>
                <ArrowRight size={13} className="text-[var(--fg-muted)] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin-panel/tools"
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3.5 hover:border-[var(--accent)] transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--fg)] font-space group-hover:text-[var(--accent)]">
                    Global Cross-Region Search
                  </div>
                  <div className="text-[10px] text-[var(--fg-muted)]">
                    Query any streaming site
                  </div>
                </div>
                <ArrowRight size={13} className="text-[var(--fg-muted)] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin-panel/tools"
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3.5 hover:border-[var(--accent)] transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--fg)] font-space group-hover:text-[var(--accent)]">
                    Duplicate Mirror Detector
                  </div>
                  <div className="text-[10px] text-[var(--fg-muted)]">
                    Scan for redundant links
                  </div>
                </div>
                <ArrowRight size={13} className="text-[var(--fg-muted)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Owner Legal DMCA Quick Card */}
          {isOwner && (
            <div className="porcelain-card rounded-3xl p-6 border border-rose-500/20 bg-rose-500/[0.04] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-space text-[var(--fg)] tracking-tight">
                  ⚖️ DMCA Compliance
                </h3>
                <span className={cn("text-xs font-mono font-bold", data.pendingDmca > 0 ? "text-rose-500" : "text-emerald-500")}>
                  {data.pendingDmca} Pending
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                Confidential copyright takedowns submitted through the official DMCA form.
              </p>
              <Link
                href="/admin-panel/dmca"
                className="block w-full text-center py-2.5 text-xs font-bold font-space rounded-2xl bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition-colors"
              >
                Open Legal Inbox →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
