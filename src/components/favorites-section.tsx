"use client";

import Image from "next/image";
import { Star, Trash2, ExternalLink } from "lucide-react";
import { useFavorites, toggleStar, clearFavorites } from "@/lib/favorites";
import { normalizeAsset } from "@/lib/utils";

export function FavoritesSection() {
  const { items, mounted } = useFavorites();
  if (!mounted || items.length === 0) return null;

  return (
    <section
      id="cat-favorites"
      data-category="favorites"
      className="mb-8 scroll-mt-28 aurora-panel p-4 md:p-6 rounded-3xl border-[var(--border)]"
    >
      <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 text-amber-400">
            <Star size={16} fill="currentColor" />
          </div>
          <h2 className="text-lg font-black tracking-tight sm:text-xl text-[var(--fg)]">
            Bookmarked Vault
            <span
              className="ml-2 rounded-full px-2 py-0.5 text-xs font-mono font-bold"
              style={{ background: "var(--bg-elev)", color: "var(--accent)" }}
            >
              {items.length}
            </span>
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all bookmarked sites?")) clearFavorites();
          }}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] hover:border-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-colors cursor-pointer"
        >
          <Trash2 size={13} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((fav) => (
          <a
            key={fav.url}
            href={fav.url}
            target="_blank"
            rel="noreferrer noopener"
            data-name={fav.name.toLowerCase()}
            data-category="favorites"
            className="aurora-ticket group relative flex flex-col justify-between p-3.5 min-h-[130px]"
            title={fav.name}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Favorite
              </span>
              <button
                type="button"
                aria-label="Remove bookmark"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleStar(fav);
                }}
                className="grid h-6 w-6 place-items-center rounded-md text-amber-400 hover:bg-[var(--bg-elev)] cursor-pointer"
              >
                <Star size={12} fill="currentColor" />
              </button>
            </div>

            <div className="flex h-10 w-full items-center justify-center my-1">
              <Image
                src={normalizeAsset(fav.logo)}
                alt={fav.name}
                width={120}
                height={40}
                className="max-h-9 w-auto object-contain transition-transform group-hover:scale-105"
                unoptimized
              />
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-[10px] font-semibold text-[var(--fg-muted)] group-hover:text-[var(--fg)]">
              <span className="truncate">{fav.name}</span>
              <ExternalLink size={9} className="text-[var(--accent)] shrink-0 ml-1" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
