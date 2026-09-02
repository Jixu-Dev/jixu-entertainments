"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Fuse from "fuse.js";
import { Command } from "cmdk";
import { Search, Globe, Folder, ExternalLink, Star } from "lucide-react";
import type { Region, SiteSearchEntry } from "@/lib/types";
import { CATEGORY_META } from "@/lib/constants";
import { normalizeAsset } from "@/lib/utils";
import { useFavorites, toggleStar } from "@/lib/favorites";
import { FlagIcon } from "./flag-icon";

type Ctx = { open: () => void; close: () => void };
const PaletteCtx = createContext<Ctx | null>(null);

export function useCommandPalette() {
  const ctx = useContext(PaletteCtx);
  if (!ctx) return { open: () => {}, close: () => {} };
  return ctx;
}

interface ProviderProps {
  children: ReactNode;
  initialIndex: SiteSearchEntry[];
  regions: Region[];
}

export function CommandPaletteProvider({ children, initialIndex, regions }: ProviderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [q, setQ] = useState("");
  const { items: favs, has: isFav } = useFavorites();

  const fuse = useMemo(
    () =>
      new Fuse(initialIndex, {
        keys: [
          { name: "name", weight: 0.7 },
          { name: "tags", weight: 0.2 },
          { name: "categoryName", weight: 0.1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [initialIndex],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setQ(""); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((o) => !o);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const siteResults = useMemo(() => {
    if (!q.trim()) return initialIndex.slice(0, 8);
    return fuse.search(q).slice(0, 20).map((r) => r.item);
  }, [q, fuse, initialIndex]);

  const categoryMatches = useMemo(() => {
    const seen = new Set<string>();
    const out: { id: string; name: string }[] = [];
    for (const s of initialIndex) {
      if (!seen.has(s.categoryId)) {
        seen.add(s.categoryId);
        out.push({ id: s.categoryId, name: s.categoryName });
      }
    }
    if (!q.trim()) return out;
    const lc = q.toLowerCase();
    return out.filter((c) => c.id.includes(lc) || c.name.toLowerCase().includes(lc));
  }, [q, initialIndex]);

  const regionMatches = useMemo(() => {
    if (!q.trim()) return regions.slice(0, 5);
    const lc = q.toLowerCase();
    return regions.filter((r) => r.code.toLowerCase().includes(lc) || r.name.toLowerCase().includes(lc));
  }, [q, regions]);

  return (
    <PaletteCtx.Provider value={{ open, close }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" onClick={close}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-[min(600px,100%)] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <Command label="Search Jixu Entertainments" shouldFilter={false} className="flex flex-col">
              {/* Search Bar Header */}
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3.5">
                <Search size={16} className="text-[var(--accent)] shrink-0" />
                <Command.Input
                  value={q}
                  onValueChange={setQ}
                  placeholder="Search platforms, channels, regions..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm font-medium outline-none text-[var(--fg)] placeholder:text-[var(--fg-muted)]"
                />
                <kbd className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--fg-muted)]">ESC</kbd>
              </div>

              {/* Search Results List */}
              <Command.List className="max-h-[50vh] overflow-y-auto p-2.5 space-y-2">
                <Command.Empty className="py-8 text-center text-xs text-[var(--fg-muted)]">
                  No matching streaming sites found.
                </Command.Empty>

                {!q.trim() && favs.length > 0 && (
                  <Command.Group heading="Saved" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--accent)]">
                    {favs.slice(0, 6).map((f) => (
                      <Command.Item
                        key={`fav-${f.url}`}
                        value={`fav-${f.name}-${f.url}`}
                        onSelect={() => { window.open(f.url, "_blank", "noopener,noreferrer"); close(); }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold aria-selected:bg-[var(--bg)] transition-colors"
                      >
                        <div className="grid h-6 w-6 place-items-center rounded bg-[#161722] p-0.5 shrink-0">
                          <Image src={normalizeAsset(f.logo)} alt="" width={20} height={20} className="max-h-4 w-auto object-contain" unoptimized />
                        </div>
                        <div className="flex-1 truncate">
                          <div className="truncate font-bold text-[var(--fg)] font-space">{f.name}</div>
                          <div className="truncate text-[10px] text-[var(--fg-muted)] font-mono">{CATEGORY_META[f.categoryId]?.label ?? f.categoryId}</div>
                        </div>
                        <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {siteResults.length > 0 && (
                  <Command.Group heading="Streaming Platforms" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--fg-muted)]">
                    {siteResults.map((s) => {
                      const starred = isFav(s.url);
                      return (
                        <Command.Item
                          key={`${s.categoryId}-${s.url}`}
                          value={`site-${s.name}-${s.url}`}
                          onSelect={() => { window.open(s.url, "_blank", "noopener,noreferrer"); close(); }}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold aria-selected:bg-[var(--bg)] transition-colors"
                        >
                          <div className="grid h-6 w-6 place-items-center rounded bg-[#161722] p-0.5 shrink-0">
                            <Image src={normalizeAsset(s.logo)} alt="" width={20} height={20} className="max-h-4 w-auto object-contain" unoptimized />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="truncate font-bold text-[var(--fg)] font-space">{s.name}</div>
                            <div className="truncate text-[10px] text-[var(--fg-muted)] font-mono">{CATEGORY_META[s.categoryId]?.label ?? s.categoryName}</div>
                          </div>
                          <button
                            type="button"
                            aria-label={starred ? "Unstar" : "Star"}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleStar({ name: s.name, url: s.url, logo: s.logo, categoryId: s.categoryId });
                            }}
                            className={`grid h-5 w-5 place-items-center rounded ${starred ? "text-amber-500" : "text-[var(--fg-muted)] hover:text-amber-500"}`}
                          >
                            <Star size={11} fill={starred ? "currentColor" : "none"} />
                          </button>
                          <ExternalLink size={11} className="text-[var(--accent)] shrink-0 opacity-60" />
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                )}

                {categoryMatches.length > 0 && (
                  <Command.Group heading="Channels" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--fg-muted)]">
                    {categoryMatches.map((c) => (
                      <Command.Item
                        key={c.id}
                        value={`cat-${c.id}`}
                        onSelect={() => { router.push(`/${c.id}`); close(); }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold aria-selected:bg-[var(--bg)] transition-colors"
                      >
                        <span className="grid h-5 w-5 place-items-center rounded bg-[var(--bg)] text-[var(--accent)] shrink-0"><Folder size={12} /></span>
                        <span className="flex-1 font-bold text-[var(--fg)] font-space">{CATEGORY_META[c.id]?.label ?? c.name}</span>
                        <span className="text-[10px] text-[var(--accent)] font-mono font-bold">jump →</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {regionMatches.length > 0 && (
                  <Command.Group heading="Regions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--fg-muted)]">
                    {regionMatches.map((r) => (
                      <Command.Item
                        key={r.code}
                        value={`region-${r.code}`}
                        onSelect={() => { router.push(r.code === "USA" ? "/" : `/${r.code.toLowerCase()}`); close(); }}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold aria-selected:bg-[var(--bg)] transition-colors"
                      >
                        <span className="grid h-5 w-5 place-items-center shrink-0"><FlagIcon code={r.flag} size={14} /></span>
                        <span className="flex-1 font-bold text-[var(--fg)] font-space">{r.name}</span>
                        <Globe size={11} className="text-[var(--fg-muted)]" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Palette Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-[10px] font-mono text-[var(--fg-muted)]">
                <span><kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open</span>
                <span className="font-bold text-[var(--accent)]">Jixu Entertainments</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </PaletteCtx.Provider>
  );
}
