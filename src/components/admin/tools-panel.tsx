"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Trash2,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Replace,
  Sparkles,
  ScanSearch,
  Cloud,
  Search,
  Copy,
  Lock,
  Zap,
  Layers,
  Globe2,
  CheckCircle2,
  FolderSync,
} from "lucide-react";
import type { Region } from "@/lib/types";
import { FlagIcon } from "../flag-icon";
import { cn } from "@/lib/utils";

interface Orphan {
  repoPath: string;
  refPath: string;
  url: string;
  category: string;
  fileName: string;
}
interface BrokenRef {
  logo: string;
  refs: { region: string; categoryId: string; siteName: string }[];
}
interface UrlHit {
  region: string;
  categoryId: string;
  siteName: string;
  currentUrl: string;
}

export function ToolsPanel({ regions }: { regions: Region[] }) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] mb-2 border border-[var(--accent)]/20">
            <Zap size={12} />
            <span>Studio Engine · Power Tools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)] font-space">
            Global Catalog Power Tools
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--fg-muted)]">
            Repo-wide automation engines. Every action creates an atomic, verified Git commit on GitHub.
          </p>
        </div>
      </div>

      {/* 1. Cloudflare Cache (With Blocked / Vercel Auto-Managed Screen) */}
      <PurgeCacheTool />

      {/* 2. Global Multi-Region Search */}
      <SiteSearchTool regions={regions} />

      {/* 3. Global Domain URL Swapper */}
      <UrlReplaceTool />

      {/* 4. Duplicate Detector */}
      <DuplicateDetectorTool />

      {/* 5. Orphan Logo Scanner */}
      <OrphanLogosTool />

      {/* 6. Seed Empty Categories */}
      <FillEmptyTool />
    </div>
  );
}

/* ---------------- 1. Purge Cloudflare cache (Blocked / Inactive) ---------------- */

function PurgeCacheTool() {
  return (
    <ArtSection
      icon={<Cloud size={20} />}
      badge="CDN Engine"
      title="Cloudflare CDN Edge Cache"
      desc="Edge cache management and invalidation for custom domains."
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-slate-900/5 via-slate-900/10 to-transparent dark:from-white/[0.03] dark:via-white/[0.01] p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-3 border border-indigo-500/20 shadow-xs">
          <Lock size={22} />
        </div>

        <h3 className="text-sm font-bold text-[var(--fg)] font-space">
          Cloudflare Bypass Active · Vercel Auto-Purge Engaged
        </h3>
        <p className="mt-1.5 text-xs text-[var(--fg-muted)] max-w-lg mx-auto leading-relaxed">
          Your platform is deployed on <strong>Vercel Serverless Edge</strong>. Vercel automatically purges, invalidates, and rebuilds global edge caches on every Git commit in real time. Manual Cloudflare flushing is currently disabled.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} />
          <span>Vercel Zero-Config Cache Invalidation: Active</span>
        </div>
      </div>
    </ArtSection>
  );
}

/* ---------------- 2. Site search ---------------- */

interface SearchHit {
  region: string;
  categoryId: string;
  siteName: string;
  url: string;
  logo: string;
  enabled: boolean;
}

function SiteSearchTool({ regions }: { regions: Region[] }) {
  const [q, setQ] = useState("");
  const [field, setField] = useState<"any" | "name" | "url">("any");
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    hits: SearchHit[];
    totalHits: number;
    totalRegionsScanned: number;
  } | null>(null);

  const search = async () => {
    const query = q.trim();
    if (query.length < 2) {
      setError("Please type at least 2 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(
        `/api/admin/tools/site-search?q=${encodeURIComponent(query)}&field=${field}`,
        { cache: "no-store" }
      );
      const j = (await r.json()) as {
        ok?: boolean;
        hits?: SearchHit[];
        totalHits?: number;
        totalRegionsScanned?: number;
        error?: string;
      };
      if (!r.ok || !j.ok) throw new Error(j.error ?? "search_failed");
      setResult({
        hits: j.hits ?? [],
        totalHits: j.totalHits ?? 0,
        totalRegionsScanned: j.totalRegionsScanned ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "search failed");
    } finally {
      setBusy(false);
    }
  };

  const visible = result
    ? filterRegion
      ? result.hits.filter((h) => h.region === filterRegion)
      : result.hits
    : [];
  const regionsInHits = result
    ? Array.from(new Set(result.hits.map((h) => h.region))).sort()
    : [];

  return (
    <ArtSection
      icon={<Search size={20} />}
      badge="Global Telemetry"
      title="Search Across All Regions"
      desc="Instant cross-regional index query across movies, anime, and live TV."
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void search();
            }}
            placeholder="Search stream name or domain (e.g. 1shows, hianime)..."
            className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 text-xs sm:text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1 shrink-0">
          {(["any", "name", "url"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setField(f)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                field === f
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              )}
            >
              {f === "any" ? "All Fields" : f === "name" ? "Name Only" : "URL Only"}
            </button>
          ))}
        </div>

        <button
          onClick={search}
          disabled={busy || q.trim().length < 2}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-6 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0 font-space"
          style={{
            background: "linear-gradient(135deg, #5B3DF5 0%, #3B82F6 100%)",
          }}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          <span>Query Catalog</span>
        </button>
      </div>

      <Err msg={error} />

      {result && (
        <div className="mt-5 space-y-3 pt-4 border-t border-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-mono text-[var(--fg-muted)]">
              Found <strong className="text-[var(--accent)]">{result.totalHits}</strong> hits across{" "}
              <strong>{regionsInHits.length}</strong> regions (scanned {result.totalRegionsScanned})
            </div>

            {regionsInHits.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterRegion("")}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-mono cursor-pointer transition-colors",
                    filterRegion === ""
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg)] text-[var(--fg-muted)] border border-[var(--border)]"
                  )}
                >
                  All
                </button>
                {regionsInHits.map((r) => {
                  const meta = regions.find((x) => x.code === r);
                  return (
                    <button
                      key={r}
                      onClick={() => setFilterRegion(r)}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-mono cursor-pointer transition-colors inline-flex items-center gap-1",
                        filterRegion === r
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg)] text-[var(--fg-muted)] border border-[var(--border)]"
                      )}
                    >
                      {meta?.flag && <FlagIcon code={meta.flag} size={12} />}
                      <span>{r}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {visible.length > 0 ? (
            <div className="max-h-96 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
              <table className="w-full text-xs">
                <thead className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5 text-[11px] font-mono uppercase text-[var(--fg-muted)]">
                  <tr className="text-left">
                    <th className="px-4 py-2.5">Region / Cat</th>
                    <th className="px-4 py-2.5">Platform</th>
                    <th className="px-4 py-2.5">URL Target</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {visible.map((h, i) => (
                    <tr key={i} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--fg-muted)]">
                        {h.region} / {h.categoryId}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[var(--fg)] font-space">
                        {h.siteName}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--accent)]">
                        <a href={h.url} target="_blank" rel="noreferrer" className="hover:underline break-all">
                          {h.url}
                        </a>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase",
                            h.enabled
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          )}
                        >
                          {h.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <a
                          href={`/admin-panel/sites?region=${h.region}`}
                          target="_blank"
                          rel="noreferrer"
                          className="porcelain-pill inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-[var(--accent)]"
                        >
                          <span>Edit</span>
                          <ExternalLink size={10} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--fg-muted)]">No matches found.</div>
          )}
        </div>
      )}
    </ArtSection>
  );
}

/* ---------------- 3. URL replace ---------------- */

function UrlReplaceTool() {
  const [oldUrl, setOldUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [mode, setMode] = useState<"exact" | "host">("host");
  const [scanning, setScanning] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [hits, setHits] = useState<UrlHit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commit, setCommit] = useState<{ url: string; sha: string; replaced: number; regions: string[] } | null>(null);

  const preview = async () => {
    if (!oldUrl.trim()) return;
    setScanning(true);
    setError(null);
    setCommit(null);
    try {
      const r = await fetch(
        `/api/admin/tools/url-replace?url=${encodeURIComponent(oldUrl)}&mode=${mode}`,
        { cache: "no-store" }
      );
      const j = (await r.json()) as { hits: UrlHit[]; error?: string };
      if (!r.ok) throw new Error(j.error ?? "scan_failed");
      setHits(j.hits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "scan failed");
    } finally {
      setScanning(false);
    }
  };

  const replace = async () => {
    if (!oldUrl.trim() || !newUrl.trim()) return;
    if (!window.confirm(`Replace ${hits?.length ?? "all matching"} URLs across all regions in one atomic commit?`))
      return;
    setCommitting(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/tools/url-replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldUrl, newUrl, mode }),
      });
      const j = (await r.json()) as {
        ok?: boolean;
        replaced?: number;
        regions?: string[];
        commitSha?: string;
        commitUrl?: string;
        error?: string;
      };
      if (!r.ok || !j.ok) throw new Error(j.error ?? "replace_failed");
      setCommit({
        url: j.commitUrl!,
        sha: j.commitSha!,
        replaced: j.replaced ?? 0,
        regions: j.regions ?? [],
      });
      setHits(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "replace failed");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <ArtSection
      icon={<Replace size={20} />}
      badge="Global Migration"
      title="Domain URL Replace & Mirror Swapper"
      desc="Find and replace dead domains or mirror URLs across all regional catalogs in a single commit."
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={oldUrl}
          onChange={(e) => setOldUrl(e.target.value)}
          placeholder="Old URL or Domain (e.g. sflix.to)"
          className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 text-xs sm:text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="New Replacement URL (e.g. https://sflix.ps)"
          className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 text-xs sm:text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
        <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1 shrink-0">
          <button
            onClick={() => setMode("host")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              mode === "host"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            )}
            title="Preserves subpaths and queries"
          >
            Host Only
          </button>
          <button
            onClick={() => setMode("exact")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              mode === "exact"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            )}
            title="Exact match only"
          >
            Exact URL
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          onClick={preview}
          disabled={scanning || !oldUrl.trim()}
          className="porcelain-pill inline-flex h-10 items-center gap-2 px-5 text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />}
          <span>Scan Matching Hits</span>
        </button>

        <button
          onClick={replace}
          disabled={committing || !oldUrl.trim() || !newUrl.trim() || (hits !== null && hits.length === 0)}
          className="inline-flex h-10 items-center gap-2 rounded-2xl px-6 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 font-space"
          style={{
            background: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
          }}
        >
          {committing ? <Loader2 size={14} className="animate-spin" /> : <Replace size={14} />}
          <span>Replace & Commit to GitHub</span>
        </button>
      </div>

      <Err msg={error} />

      {commit && (
        <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          ✓ Successfully replaced {commit.replaced} links in {commit.regions.length} regions.{" "}
          <CommitPill url={commit.url} sha={commit.sha} />
        </div>
      )}

      {hits && (
        <div className="mt-4 space-y-2 pt-4 border-t border-[var(--border)]">
          <div className="text-xs font-bold text-[var(--fg)] font-space">
            Found {hits.length} occurrence{hits.length === 1 ? "" : "s"} ready for migration:
          </div>
          <div className="max-h-60 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 space-y-1.5">
            {hits.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <span className="font-mono text-[11px] text-[var(--fg-muted)]">
                  {h.region} / {h.categoryId} · <strong className="text-[var(--fg)]">{h.siteName}</strong>
                </span>
                <span className="font-mono text-[11px] text-[var(--accent)]">{h.currentUrl}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ArtSection>
  );
}

/* ---------------- 4. Duplicate detector ---------------- */

interface DupGroup {
  key: string;
  reason: "exact_url" | "host_only" | "name";
  occurrences: { region: string; categoryId: string; siteName: string; url: string }[];
}

function DuplicateDetectorTool() {
  const [mode, setMode] = useState<"host" | "exact" | "name">("host");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    duplicates: DupGroup[];
    totalGroups: number;
    totalOccurrences: number;
    totalRegionsScanned: number;
  } | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`/api/admin/tools/find-duplicates?mode=${mode}`, { cache: "no-store" });
      const j = (await r.json()) as {
        ok?: boolean;
        duplicates?: DupGroup[];
        totalGroups?: number;
        totalOccurrences?: number;
        totalRegionsScanned?: number;
        error?: string;
      };
      if (!r.ok || !j.ok) throw new Error(j.error ?? "scan_failed");
      setResult({
        duplicates: j.duplicates ?? [],
        totalGroups: j.totalGroups ?? 0,
        totalOccurrences: j.totalOccurrences ?? 0,
        totalRegionsScanned: j.totalRegionsScanned ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "scan failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <ArtSection
      icon={<Copy size={20} />}
      badge="Index Integrity"
      title="Duplicate Mirror Detector"
      desc="Scan the catalog to detect redundant links across categories and territories."
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1">
          {(["host", "exact", "name"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                mode === m
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              )}
            >
              {m === "host" ? "By Hostname" : m === "exact" ? "By Exact URL" : "By Site Name"}
            </button>
          ))}
        </div>

        <button
          onClick={run}
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 font-space"
          style={{
            background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
          }}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
          <span>Scan for Duplicates</span>
        </button>

        {result && (
          <span className="text-xs font-mono text-[var(--fg-muted)]">
            Found {result.totalGroups} groups ({result.totalOccurrences} occurrences in {result.totalRegionsScanned} regions)
          </span>
        )}
      </div>

      <Err msg={error} />

      {result && result.duplicates.length === 0 && (
        <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          ✓ All clean! Zero duplicate sites found in this mode.
        </div>
      )}

      {result && result.duplicates.length > 0 && (
        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pt-3 border-t border-[var(--border)]">
          {result.duplicates.map((g, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <code className="font-mono text-xs font-bold text-[var(--fg)] select-all">{g.key}</code>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--accent)]">
                    ×{g.occurrences.length} instances
                  </span>
                  <button
                    onClick={() => copy(g.key)}
                    className="porcelain-pill px-2 py-0.5 text-[10px] cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[var(--border)] pt-1">
                {g.occurrences.map((o, j) => (
                  <div key={j} className="flex items-center justify-between text-xs py-1">
                    <span className="text-[var(--fg-muted)]">
                      <strong className="text-[var(--fg)] font-mono">{o.region}/{o.categoryId}</strong> · {o.siteName}
                    </span>
                    <a
                      href={`/admin-panel/sites?region=${o.region}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline"
                    >
                      <span>Open</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ArtSection>
  );
}

/* ---------------- 5. Orphan logos ---------------- */

function OrphanLogosTool() {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    orphans: Orphan[];
    broken: BrokenRef[];
    scanned: { regions: number; logos: number };
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [commit, setCommit] = useState<{ url: string; sha: string } | null>(null);

  const scan = async () => {
    setLoading(true);
    setError(null);
    setCommit(null);
    try {
      const r = await fetch("/api/admin/tools/orphan-logos", { cache: "no-store" });
      const j = (await r.json()) as {
        orphans: Orphan[];
        broken: BrokenRef[];
        scanned: { regions: number; logos: number };
      };
      if (!r.ok) throw new Error("scan_failed");
      setData(j);
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "scan failed");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (p: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });

  const selectAll = () => {
    if (!data) return;
    setSelected(new Set(data.orphans.map((o) => o.repoPath)));
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Permanently purge ${selected.size} orphan logo files from GitHub?`)) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/tools/orphan-logos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: Array.from(selected) }),
      });
      const j = (await r.json()) as { ok?: boolean; commitSha?: string; commitUrl?: string; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error ?? "delete_failed");
      setCommit({ url: j.commitUrl!, sha: j.commitSha! });
      await scan();
    } catch (e) {
      setError(e instanceof Error ? e.message : "delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ArtSection
      icon={<ScanSearch size={20} />}
      badge="Asset Hygiene"
      title="Orphan Logo & Missing Asset Scanner"
      desc="Scans the repository for unused logo files and identifies broken image links."
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={scan}
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 font-space"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
          }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <ScanSearch size={15} />}
          <span>Scan Asset Directory</span>
        </button>

        {data && (
          <span className="text-xs font-mono text-[var(--fg-muted)]">
            Scanned {data.scanned.logos} logos in {data.scanned.regions} regions · {data.orphans.length} orphans ·{" "}
            {data.broken.length} broken
          </span>
        )}
      </div>

      <Err msg={error} />

      {commit && (
        <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          ✓ Successfully deleted selected assets. <CommitPill {...commit} />
        </div>
      )}

      {data && data.orphans.length > 0 && (
        <div className="mt-5 space-y-3 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="porcelain-pill px-3 py-1 text-xs cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="porcelain-pill px-3 py-1 text-xs cursor-pointer"
              >
                Clear
              </button>
            </div>

            <button
              onClick={deleteSelected}
              disabled={busy || selected.size === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Delete {selected.size} Selected</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-7 max-h-64 overflow-y-auto p-1">
            {data.orphans.map((o) => {
              const checked = selected.has(o.repoPath);
              return (
                <button
                  key={o.repoPath}
                  onClick={() => toggle(o.repoPath)}
                  title={`${o.category}/${o.fileName}`}
                  className={cn(
                    "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border p-2 cursor-pointer transition-all",
                    checked
                      ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--accent)]/10"
                      : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--fg-muted)]"
                  )}
                >
                  <Image
                    src={o.url}
                    alt=""
                    width={48}
                    height={48}
                    className="max-h-full max-w-full object-contain"
                    unoptimized
                  />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/75 px-1 py-0.5 text-[8px] font-mono text-white text-center">
                    {o.fileName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {data && data.broken.length > 0 && (
        <div className="mt-4 space-y-2 pt-4 border-t border-[var(--border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 font-space">
            Broken Logo References ({data.broken.length})
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {data.broken.map((b) => (
              <div
                key={b.logo}
                className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-2.5 text-xs"
              >
                <code className="font-mono text-[11px] text-rose-600 font-bold">{b.logo}</code>
                <div className="mt-1 text-[var(--fg-muted)]">
                  Referenced in:{" "}
                  {b.refs.map((r, i) => (
                    <span key={i} className="font-mono text-[11px]">
                      {r.region}/{r.categoryId} ({r.siteName})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ArtSection>
  );
}

/* ---------------- 6. Fill empty categories ---------------- */

function FillEmptyTool() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    seeded: number;
    details?: { region: string; categoryId: string }[];
    commitSha?: string;
    commitUrl?: string;
    message?: string;
  } | null>(null);

  const run = async () => {
    if (!window.confirm("Seed every empty category with a 'coming soon — request a site' placeholder card?"))
      return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/admin/tools/fill-empty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const j = (await r.json()) as {
        ok?: boolean;
        seeded?: number;
        details?: { region: string; categoryId: string }[];
        commitSha?: string;
        commitUrl?: string;
        message?: string;
        error?: string;
      };
      if (!r.ok) throw new Error(j.error ?? "fill_failed");
      setResult({
        seeded: j.seeded ?? 0,
        details: j.details,
        commitSha: j.commitSha,
        commitUrl: j.commitUrl,
        message: j.message,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "fill failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <ArtSection
      icon={<Sparkles size={20} />}
      badge="Catalog Seeder"
      title="Fill Empty Categories"
      desc="Auto-injects interactive 'Coming Soon — Request a Site' placeholder cards into blank categories."
    >
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={running}
          className="inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 font-space"
          style={{
            background: "linear-gradient(135deg, #5B3DF5 0%, #EC4899 100%)",
          }}
        >
          {running ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          <span>Seed Blank Categories</span>
        </button>
      </div>

      <Err msg={error} />

      {result && (
        <div className="mt-4 text-xs font-medium text-[var(--fg-muted)]">
          {result.seeded > 0 ? (
            <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-2">
              <div>
                ✓ Successfully seeded {result.seeded} categor{result.seeded === 1 ? "y" : "ies"}.{" "}
                {result.commitSha && result.commitUrl && (
                  <CommitPill url={result.commitUrl} sha={result.commitSha} />
                )}
              </div>
              {result.details && result.details.length > 0 && (
                <div className="grid grid-cols-2 gap-1 font-mono text-[10px] sm:grid-cols-3 pt-1">
                  {result.details.map((d, i) => (
                    <span key={i}>
                      • {d.region}/{d.categoryId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--border)]">
              {result.message ?? "All categories are already filled with active streaming links."}
            </div>
          )}
        </div>
      )}
    </ArtSection>
  );
}

/* ---------------- Custom Art Card Container ---------------- */

function ArtSection({
  icon,
  badge,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="porcelain-card relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#161726] border border-[var(--border)] shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shrink-0 shadow-xs">
          {icon}
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
            <span>{badge}</span>
          </div>
          <h2 className="text-lg font-bold text-[var(--fg)] font-space tracking-tight">{title}</h2>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">{desc}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </section>
  );
}

function Err({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-500/10 p-3.5 text-xs font-medium text-rose-600 border border-rose-500/20">
      <AlertTriangle size={15} className="shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

function CommitPill({ url, sha }: { url: string; sha: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--accent)] hover:underline"
    >
      <span>commit {sha.slice(0, 7)}</span>
      <ExternalLink size={11} />
    </a>
  );
}
