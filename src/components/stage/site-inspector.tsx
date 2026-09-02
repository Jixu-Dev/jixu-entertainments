"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X, ExternalLink, Copy, Check, Star } from "lucide-react";
import type { Site } from "@/lib/types";
import { normalizeAsset, cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import { CATEGORY_META } from "@/lib/constants";

interface Props {
  site: Site | null;
  categoryId: string;
  onClose: () => void;
}

export function SiteInspector({ site, categoryId, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const { has, toggle, mounted } = useFavorites();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (site) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [site, onClose]);

  if (!site) return null;

  const starred = mounted && has(site.url);
  const categoryMeta = CATEGORY_META[categoryId];

  let host = "";
  try {
    host = new URL(site.url).hostname.replace(/^www\./, "");
  } catch {}

  async function copyUrl() {
    if (!site) return;
    try {
      await navigator.clipboard.writeText(site.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={onClose}>
      {/* Dimmed Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Slide-Over Drawer Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex h-full w-full max-w-md flex-col justify-between overflow-y-auto border-l border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-2xl animate-in slide-in-from-right duration-250 sm:p-8"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
            <div className="font-space text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Platform Details
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)] cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Logo Showcase Box in Off-Grey */}
          <div className="mb-6 flex h-32 w-full items-center justify-center rounded-2xl p-6 bg-[#161722] border border-black/10 shadow-inner">
            <Image
              src={normalizeAsset(site.logo)}
              alt={site.name}
              width={200}
              height={70}
              className="max-h-16 w-auto object-contain drop-shadow-md"
              unoptimized
            />
          </div>

          {/* Site Title & Category */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--fg)] font-space">{site.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-[var(--fg-muted)] font-mono">
              <span>{categoryMeta?.label ?? categoryId}</span>
              <span>•</span>
              <span>{host}</span>
            </div>
          </div>

          {/* Tags */}
          {site.tags && site.tags.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--fg-muted)] mb-2">
                Tags & Features
              </div>
              <div className="flex flex-wrap gap-1.5">
                {site.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-xs font-mono text-[var(--fg)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notice */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-xs text-[var(--fg-muted)] leading-relaxed">
            <p className="font-bold text-[var(--fg)] mb-1 font-space">Curator Note:</p>
            Always pair external streaming sites with an ad-blocker like uBlock Origin for a clean, secure viewing experience.
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 mt-6 border-t border-[var(--border)] flex flex-col gap-2.5">
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold shadow-sm transition-all duration-150 hover:opacity-90 cursor-pointer text-white"
            style={{
              background: "var(--accent)",
            }}
          >
            <span>Launch Stream</span>
            <ExternalLink size={14} />
          </a>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyUrl}
              className="porcelain-pill flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? "URL Copied" : "Copy Domain"}</span>
            </button>

            <button
              type="button"
              onClick={() => toggle({ name: site.name, url: site.url, logo: site.logo, categoryId })}
              className={cn(
                "porcelain-pill px-4 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold cursor-pointer transition-colors",
                starred && "text-amber-500 border-amber-500/40",
              )}
            >
              <Star size={13} fill={starred ? "currentColor" : "none"} />
              <span>{starred ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
