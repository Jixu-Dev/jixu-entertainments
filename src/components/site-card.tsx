"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Copy, ExternalLink, Check, Star, Play } from "lucide-react";
import type { Site } from "@/lib/types";
import { normalizeAsset, cn } from "@/lib/utils";
import { addRecent } from "./recently-visited";
import { useFavorites } from "@/lib/favorites";

interface Props {
  site: Site;
  categoryId: string;
}

export function SiteCard({ site, categoryId }: Props) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { has, toggle, mounted } = useFavorites();
  const starred = mounted && has(site.url);
  const cardRef = useRef<HTMLAnchorElement>(null);

  async function copyUrl(e: React.MouseEvent | React.KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(site.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  }

  function star(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ name: site.name, url: site.url, logo: site.logo, categoryId });
  }

  let host = "";
  try {
    host = new URL(site.url).hostname.replace(/^www\./, "");
  } catch {}

  return (
    <a
      ref={cardRef}
      href={site.url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={() => addRecent({ name: site.name, url: site.url, logo: site.logo, categoryId })}
      data-name={site.name.toLowerCase()}
      data-category={categoryId}
      data-tags={(site.tags ?? []).join(",").toLowerCase()}
      className={cn(
        "porcelain-card group relative flex flex-col justify-between p-3.5 cursor-pointer min-h-[156px] rounded-2xl bg-white border border-[var(--border)] shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-md hover:border-[var(--accent)]/40",
        starred && "border-[var(--accent)]/50 ring-1 ring-[var(--accent)]/30"
      )}
      title={site.name}
    >
      {/* Top Header: Platform Title & Star Bookmark */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-space font-bold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors truncate">
          {site.name}
        </span>

        <button
          type="button"
          aria-label={starred ? "Unstar" : "Star"}
          aria-pressed={starred}
          onClick={star}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-lg transition-all cursor-pointer",
            starred
              ? "text-amber-500 opacity-100"
              : "text-[var(--fg-muted)] opacity-30 hover:opacity-100 group-hover:opacity-70 hover:text-amber-500"
          )}
        >
          <Star size={13} fill={starred ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Center: Cinematic Showcase Pad with Ambient Backlight on Hover */}
      <div className="relative flex h-[72px] w-full items-center justify-center my-1 px-3 rounded-xl bg-[#12131F] border border-black/15 shadow-inner transition-all duration-300 group-hover:bg-[#161726] group-hover:border-[var(--accent)]/30 group-hover:shadow-[0_0_20px_rgba(91,61,245,0.18)] overflow-hidden">
        {/* Subtle Ambient Studio Light inside the box */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.06] pointer-events-none" />

        {imgError ? (
          <div className="line-clamp-2 text-center text-xs font-bold tracking-tight text-white font-space">
            {site.name}
          </div>
        ) : (
          <Image
            src={normalizeAsset(site.logo)}
            alt={site.name}
            width={140}
            height={48}
            className="relative z-10 max-h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
            loading="lazy"
            unoptimized
            onError={() => setImgError(true)}
          />
        )}

        {/* Hover Action Pill Overlay */}
        <div className="absolute right-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="flex items-center gap-1 rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-white shadow-xs">
            <Play size={8} fill="currentColor" />
            <span>PLAY</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Hostname Domain + Copy Action */}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 mt-1.5">
        <div className="flex items-center gap-1.5 truncate text-[10px] font-mono font-medium text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition-colors">
          <ExternalLink size={10} className="shrink-0 text-[var(--accent)]" />
          <span className="truncate">{host || site.name}</span>
        </div>

        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy URL"}
          onClick={copyUrl}
          className="grid h-5 w-5 place-items-center rounded bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elev)] transition-all cursor-pointer"
        >
          {copied ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
        </button>
      </div>
    </a>
  );
}
