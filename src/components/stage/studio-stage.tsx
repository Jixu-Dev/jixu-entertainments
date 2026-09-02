"use client";

import { useState, useMemo } from "react";
import type { Region, Category, Site } from "@/lib/types";
import { SpotlightBento } from "./spotlight-bento";
import { ChannelDock, type ViewMode } from "./channel-dock";
import { BentoView } from "./bento-view";
import { ReelsView } from "./reels-view";
import { TableView } from "./table-view";
import { SiteInspector } from "./site-inspector";
import { RecentlyVisited } from "@/components/recently-visited";
import { useFavorites } from "@/lib/favorites";

interface Props {
  region: Region;
  categories: Category[];
  totalSites: number;
}

export function StudioStage({ region, categories, totalSites }: Props) {
  const [activeChannel, setActiveChannel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("bento");
  const [inspectSite, setInspectSite] = useState<{ site: Site; categoryId: string } | null>(null);

  const { items: favItems, mounted } = useFavorites();

  // Compute category categories filtered by active channel and search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return categories
      .filter((cat) => {
        if (activeChannel === "all" || activeChannel === "favorites") return true;
        return cat.id === activeChannel;
      })
      .map((cat) => {
        if (!q) return cat;
        const matchingSites = cat.sites.filter((site) => {
          const matchName = site.name.toLowerCase().includes(q);
          const matchUrl = site.url.toLowerCase().includes(q);
          const matchTags = (site.tags ?? []).some((t) => t.toLowerCase().includes(q));
          return matchName || matchUrl || matchTags;
        });
        return { ...cat, sites: matchingSites };
      })
      .filter((cat) => cat.sites.length > 0);
  }, [categories, activeChannel, searchQuery]);

  // Total filtered count
  const totalFiltered = useMemo(() => {
    if (activeChannel === "favorites" && mounted) {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return favItems.length;
      return favItems.filter((f) => f.name.toLowerCase().includes(q) || f.url.toLowerCase().includes(q)).length;
    }
    return filteredCategories.reduce((acc, cat) => acc + cat.sites.length, 0);
  }, [filteredCategories, activeChannel, favItems, mounted, searchQuery]);

  const filteredFavItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return favItems;
    return favItems.filter((f) => f.name.toLowerCase().includes(q) || f.url.toLowerCase().includes(q));
  }, [favItems, searchQuery]);

  function handleInspect(site: Site, categoryId: string) {
    setInspectSite({ site, categoryId });
  }

  const isFavChannel = activeChannel === "favorites";

  const categoryTabList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.sites.length,
  }));

  return (
    <div className="min-w-0 flex-1">
      {/* Dynamic 5-Min Rotating Cinematic Hero Stage with Poster Blend & Gradient */}
      <SpotlightBento
        categories={categories}
        totalSites={totalSites}
        activeRegion={region}
        onInspect={handleInspect}
      />

      {/* Recently Visited Bar */}
      <RecentlyVisited />

      {/* Static In-Place Channel Navigation Dock & View Switcher */}
      <ChannelDock
        categories={categoryTabList}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalFiltered={totalFiltered}
      />

      {/* Main Dynamic View Stage */}
      <div className="pb-12">
        {viewMode === "bento" && (
          <BentoView
            categories={filteredCategories}
            isFavorites={isFavChannel}
            favItems={filteredFavItems}
            onInspect={handleInspect}
          />
        )}

        {viewMode === "reels" && (
          <ReelsView categories={filteredCategories} />
        )}

        {viewMode === "table" && (
          <TableView categories={filteredCategories} onInspect={handleInspect} />
        )}
      </div>

      {/* Site Inspector Drawer Modal */}
      {inspectSite && (
        <SiteInspector
          site={inspectSite.site}
          categoryId={inspectSite.categoryId}
          onClose={() => setInspectSite(null)}
        />
      )}
    </div>
  );
}
