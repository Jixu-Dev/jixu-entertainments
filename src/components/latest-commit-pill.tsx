"use client";

import { useEffect, useState } from "react";
import { GitCommit, ExternalLink } from "lucide-react";

interface LatestCommit {
  shortSha: string;
  message: string;
  url: string;
  author: string;
  date: string;
}

const STORAGE_KEY = "streamvault-latest-commit-v1";
const TTL_MS = 12 * 60 * 60 * 1000;

interface CachedEntry {
  at: number;
  data: LatestCommit;
}

function readCache(): CachedEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry;
    if (!parsed || typeof parsed.at !== "number" || !parsed.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: LatestCommit) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {}
}

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function LatestCommitPill() {
  const [commit, setCommit] = useState<LatestCommit | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const cached = readCache();
    if (cached && Date.now() - cached.at < TTL_MS) {
      setCommit(cached.data);
      return;
    }
    if (cached) setCommit(cached.data);

    fetch("/api/latest-commit")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: LatestCommit | null) => {
        if (cancelled || !j || !("shortSha" in j)) return;
        setCommit(j);
        writeCache(j);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!commit) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [commit]);

  if (!commit) return null;

  const ago = timeAgo(commit.date);
  void now;

  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noreferrer noopener"
      className="porcelain-pill group inline-flex max-w-full items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium hover:border-[var(--border-hover)] cursor-pointer"
      title={commit.message}
    >
      <GitCommit size={12} className="shrink-0 text-[var(--accent)]" />
      <span className="font-bold text-[var(--accent)]">{commit.shortSha}</span>
      <span className="text-[var(--fg-muted)]">· {ago}</span>
    </a>
  );
}
