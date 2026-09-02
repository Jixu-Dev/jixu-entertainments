"use client";

import { CategorySection } from "@/components/category-section";
import type { Category, Site } from "@/lib/types";
import { SiteCard } from "@/components/site-card";
import { Star } from "lucide-react";

interface Props {
  categories: Category[];
  isFavorites?: boolean;
  favItems?: { name: string; url: string; logo: string; categoryId: string }[];
  onInspect?: (site: Site, catId: string) => void;
}

export function BentoView({ categories, isFavorites, favItems = [] }: Props) {
  if (isFavorites) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--fg)] font-space">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <span>Saved Platforms</span>
            <span className="font-mono text-xs text-[var(--fg-muted)]">
              ({favItems.length})
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7">
          {favItems.map((fav) => (
            <SiteCard
              key={fav.url}
              site={{ name: fav.name, url: fav.url, logo: fav.logo }}
              categoryId={fav.categoryId}
            />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="porcelain-card p-12 text-center rounded-3xl">
        <p className="text-xs font-semibold text-[var(--fg-muted)]">
          No matching streaming sites found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map((cat) => (
        <CategorySection key={cat.id} category={cat} />
      ))}
    </div>
  );
}
