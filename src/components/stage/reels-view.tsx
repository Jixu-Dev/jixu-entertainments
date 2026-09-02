"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { SiteCard } from "@/components/site-card";
import { CATEGORY_META } from "@/lib/constants";
import { CategoryIcon } from "@/components/category-icon";

interface Props {
  categories: Category[];
}

export function ReelsView({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <div className="porcelain-card p-12 text-center rounded-3xl">
        <p className="text-xs font-semibold text-[var(--fg-muted)]">
          No matching streaming shelves found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map((cat) => (
        <ReelRow key={cat.id} category={cat} />
      ))}
    </div>
  );
}

function ReelRow({ category }: { category: Category }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[category.id];

  function scroll(offset: number) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  }

  return (
    <section className="relative">
      {/* Reel Header */}
      <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <div className="flex items-center gap-2.5">
          <CategoryIcon id={category.id} size={17} />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--fg)] font-space">
            {meta?.label ?? category.name}
          </h2>
          <span className="font-mono text-xs text-[var(--fg-muted)]">
            ({category.sites.length})
          </span>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-320)}
            className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(320)}
            className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Reel Track */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
      >
        {category.sites.map((site) => (
          <div key={`${site.name}-${site.url}`} className="w-[220px] sm:w-[260px] shrink-0">
            <SiteCard site={site} categoryId={category.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
