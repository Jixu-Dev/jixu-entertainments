"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLink, Copy, Check, Star, Info } from "lucide-react";
import type { Category, Site } from "@/lib/types";
import { normalizeAsset, cn } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/constants";
import { useFavorites } from "@/lib/favorites";

interface Props {
  categories: Category[];
  onInspect: (site: Site, catId: string) => void;
}

export function TableView({ categories, onInspect }: Props) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const { has, toggle, mounted } = useFavorites();

  const allSites: { site: Site; categoryId: string; categoryName: string }[] = [];
  for (const cat of categories) {
    for (const site of cat.sites) {
      allSites.push({ site, categoryId: cat.id, categoryName: cat.name });
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1400);
    } catch {}
  }

  if (allSites.length === 0) {
    return (
      <div className="porcelain-card p-12 text-center rounded-3xl">
        <p className="text-xs font-semibold text-[var(--fg-muted)]">
          No records matching current criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="porcelain-card overflow-hidden rounded-3xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--border)] bg-[var(--bg)]/80 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            <tr>
              <th className="px-5 py-3">Platform</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {allSites.map(({ site, categoryId, categoryName }) => {
              const starred = mounted && has(site.url);
              const isCopied = copiedUrl === site.url;
              let host = "";
              try {
                host = new URL(site.url).hostname.replace(/^www\./, "");
              } catch {}

              return (
                <tr
                  key={`${categoryId}-${site.url}`}
                  className="hover:bg-[var(--bg)] transition-colors group"
                >
                  {/* Platform Column */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-7 w-12 place-items-center rounded-lg bg-[#161722] p-1 border border-black/10 shrink-0 shadow-inner">
                        <Image
                          src={normalizeAsset(site.logo)}
                          alt={site.name}
                          width={48}
                          height={20}
                          className="max-h-5 w-auto object-contain drop-shadow-sm"
                          unoptimized
                        />
                      </div>
                      <div className="font-bold text-[var(--fg)] text-xs font-space">{site.name}</div>
                    </div>
                  </td>

                  {/* Channel Column */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-[var(--accent)] font-medium">
                      {CATEGORY_META[categoryId]?.label ?? categoryName}
                    </span>
                  </td>

                  {/* Domain Hostname */}
                  <td className="px-4 py-3.5 font-mono text-xs text-[var(--fg-muted)]">{host}</td>

                  {/* Actions Column */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        aria-label="Inspect"
                        onClick={() => onInspect(site, categoryId)}
                        className="grid h-6 w-6 place-items-center rounded-md border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                        title="Details"
                      >
                        <Info size={12} />
                      </button>

                      <button
                        type="button"
                        aria-label={isCopied ? "Copied" : "Copy URL"}
                        onClick={() => copyUrl(site.url)}
                        className="grid h-6 w-6 place-items-center rounded-md border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                        title="Copy Domain URL"
                      >
                        {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>

                      <button
                        type="button"
                        aria-label={starred ? "Unstar" : "Star"}
                        onClick={() => toggle({ name: site.name, url: site.url, logo: site.logo, categoryId })}
                        className={cn(
                          "grid h-6 w-6 place-items-center rounded-md border border-[var(--border)] cursor-pointer",
                          starred ? "text-amber-500 border-amber-500/40" : "text-[var(--fg-muted)] hover:text-amber-500",
                        )}
                        title="Save"
                      >
                        <Star size={12} fill={starred ? "currentColor" : "none"} />
                      </button>

                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:opacity-90 ml-1"
                        style={{
                          background: "var(--accent)",
                        }}
                      >
                        <span>Open</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
