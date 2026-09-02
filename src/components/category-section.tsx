import { CATEGORY_META } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { SiteCard } from "./site-card";
import { CategoryIcon } from "./category-icon";
import { Film } from "lucide-react";

export function CategorySection({ category }: { category: Category }) {
  const meta = CATEGORY_META[category.id];
  return (
    <section id={`cat-${category.id}`} data-category={category.id} className="scroll-mt-28 mb-12">
      {/* Artistic Category Section Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white border border-[var(--border)] text-[var(--accent)] shadow-xs">
            <CategoryIcon id={category.id} size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--fg)] font-space">
                {meta?.label ?? category.name}
              </h2>
              <span className="rounded-full bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)]">
                {category.sites.length} Sources
              </span>
            </div>
            {meta?.blurb && (
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                {meta.blurb}
              </p>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-[var(--fg-muted)]">
          <Film size={12} className="text-[var(--accent)]" />
          <span>Curated Index</span>
        </div>
      </div>

      {/* Fluid Full-Screen Responsive Card Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7">
        {category.sites.map((site) => (
          <SiteCard key={`${site.name}-${site.url}`} site={site} categoryId={category.id} />
        ))}
      </div>
    </section>
  );
}
