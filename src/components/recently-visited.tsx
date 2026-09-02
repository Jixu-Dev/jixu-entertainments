"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, X, ExternalLink } from "lucide-react";
import { normalizeAsset } from "@/lib/utils";

interface Recent {
  name: string;
  url: string;
  logo: string;
  categoryId: string;
  visitedAt: number;
}

const KEY = "streamvault-recents-v1";
const MAX = 8;

export function addRecent(item: Omit<Recent, "visitedAt">) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const arr: Recent[] = raw ? JSON.parse(raw) : [];
    const next = [
      { ...item, visitedAt: Date.now() },
      ...arr.filter((r) => r.url !== item.url),
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("streamvault-recents-changed"));
  } catch {}
}

async function fetchValidUrlSet(): Promise<Set<string>> {
  const regionsRes = await fetch("/regions.json", { cache: "no-store" });
  const regionsData = await regionsRes.json();
  const codes: string[] = (regionsData.regions || [])
    .filter((r: { enabled?: boolean }) => r.enabled !== false)
    .map((r: { code: string }) => r.code);

  const files = [
    "/links.json",
    ...codes
      .filter((c) => c !== "USA")
      .map((c) => `/Region-Links/links.${c}.json`),
  ];

  const valid = new Set<string>();
  const results = await Promise.all(
    files.map((f) => fetch(f, { cache: "no-store" }).then((r) => r.json()).catch(() => null))
  );
  for (const data of results) {
    if (!data?.categories) continue;
    for (const cat of data.categories) {
      for (const site of cat.sites || []) {
        if (site.enabled !== false && site.url) valid.add(site.url);
      }
    }
  }
  return valid;
}

export function RecentlyVisited() {
  const [items, setItems] = useState<Recent[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    function readStored(): Recent[] {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    function load() {
      setItems(readStored());
    }

    load();

    fetchValidUrlSet()
      .then((valid) => {
        if (cancelled) return;
        const stored = readStored();
        const kept = stored.filter((r) => valid.has(r.url));
        if (kept.length !== stored.length) {
          try {
            localStorage.setItem(KEY, JSON.stringify(kept));
          } catch {}
        }
        setItems(kept);
      })
      .catch(() => {});

    window.addEventListener("streamvault-recents-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("streamvault-recents-changed", load);
    };
  }, []);

  function clear() {
    localStorage.removeItem(KEY);
    setItems([]);
  }

  if (!mounted || items.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--fg-muted)]">
          <Clock size={12} className="text-[var(--accent)]" />
          <span>Recently Streamed</span>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-[11px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {items.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noreferrer noopener"
            className="porcelain-card flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl hover:scale-105 transition-all shadow-sm"
          >
            <div className="grid h-5 w-7 place-items-center rounded bg-[#161722] p-0.5 border border-black/10">
              <Image
                src={normalizeAsset(r.logo)}
                alt=""
                width={20}
                height={20}
                className="max-h-3.5 w-auto object-contain"
                unoptimized
              />
            </div>
            <span className="text-[var(--fg)] font-space">{r.name}</span>
            <ExternalLink size={9} className="text-[var(--accent)] opacity-60" />
          </a>
        ))}
      </div>
    </section>
  );
}
