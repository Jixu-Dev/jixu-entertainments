"use client";

import { Search, X, LayoutGrid, Rows3, Table2, Star, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/constants";
import { CategoryIcon } from "@/components/category-icon";
import { useFavorites } from "@/lib/favorites";

export type ViewMode = "bento" | "reels" | "table";

interface Props {
  categories: { id: string; name: string; count: number }[];
  activeChannel: string;
  setActiveChannel: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalFiltered: number;
}

export function ChannelDock({
  categories,
  activeChannel,
  setActiveChannel,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  totalFiltered,
}: Props) {
  const { items: favs, mounted } = useFavorites();

  return (
    <div className="mb-8 space-y-3">
      {/* Unified Studio Console Bar */}
      <div className="porcelain-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2 rounded-2xl bg-white shadow-sm border border-[var(--border)]">
        {/* Left: Scrollable Channel Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
          {/* All Channels */}
          <button
            type="button"
            onClick={() => setActiveChannel("all")}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer font-space",
              activeChannel === "all"
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
            )}
          >
            <span>All Channels</span>
          </button>

          {/* Bookmarks Tab */}
          {mounted && favs.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveChannel("favorites")}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer font-space",
                activeChannel === "favorites"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
              )}
            >
              <Star size={13} fill="currentColor" />
              <span>Saved ({favs.length})</span>
            </button>
          )}

          {/* Category Channel Tabs */}
          {categories.map((c) => {
            const meta = CATEGORY_META[c.id];
            const isSel = activeChannel === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChannel(c.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer font-space",
                  isSel
                    ? "bg-[var(--accent)] text-white shadow-xs font-bold"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
                )}
              >
                <CategoryIcon id={c.id} size={13} />
                <span>{meta?.label ?? c.name}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Integrated Search Input + View Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
          {/* Integrated Real-Time Filter Search */}
          <div className="relative flex-1 sm:w-64 lg:w-72">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter streaming sources..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] py-1.5 pl-9 pr-8 text-xs font-medium outline-none focus:border-[var(--accent)] rounded-xl placeholder:text-[var(--fg-muted)] transition-colors"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X size={12} />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--fg-muted)] opacity-60">
                {totalFiltered}
              </span>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1 shrink-0">
            <button
              type="button"
              aria-label="Grid View"
              onClick={() => setViewMode("bento")}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-all cursor-pointer",
                viewMode === "bento"
                  ? "bg-white text-[var(--accent)] shadow-xs font-bold"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              )}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              aria-label="Reels View"
              onClick={() => setViewMode("reels")}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-all cursor-pointer",
                viewMode === "reels"
                  ? "bg-white text-[var(--accent)] shadow-xs font-bold"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              )}
              title="Horizontal Reels View"
            >
              <Rows3 size={13} />
            </button>
            <button
              type="button"
              aria-label="Table View"
              onClick={() => setViewMode("table")}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-white text-[var(--accent)] shadow-xs font-bold"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              )}
              title="Data Table View"
            >
              <Table2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
