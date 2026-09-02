"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Info, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, Film, Dices } from "lucide-react";
import type { Site, Region, Category } from "@/lib/types";
import { normalizeAsset, cn } from "@/lib/utils";
import { LiveUsers } from "@/components/live-users";

interface Props {
  categories: Category[];
  totalSites: number;
  activeRegion: Region;
  onInspect: (site: Site, catId: string) => void;
}

interface FeaturedMeta {
  site: Site;
  categoryId: string;
  categoryLabel: string;
  tagline: string;
  posters: { title: string; image: string; tag: string }[];
}

// 5-minute rotation duration in milliseconds (300,000ms)
const ROTATION_INTERVAL_MS = 5 * 60 * 1000;

export function SpotlightBento({
  categories,
  totalSites,
  activeRegion,
  onInspect,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [rolling, setRolling] = useState(false);

  // Extract all sites for Random Discovery
  const allSites = useMemo(() => {
    const list: { site: Site; categoryId: string }[] = [];
    for (const cat of categories) {
      for (const s of cat.sites || []) {
        if (s.enabled !== false && s.url) {
          list.push({ site: s, categoryId: cat.id });
        }
      }
    }
    return list;
  }, [categories]);

  // Extract movie & anime featured sites from catalog
  const featuredList: FeaturedMeta[] = useMemo(() => {
    const movieCat = categories.find((c) => c.id === "movies");
    const animeCat = categories.find((c) => c.id === "anime");

    const movieSites = (movieCat?.sites || []).filter((s) => s.enabled !== false);
    const animeSites = (animeCat?.sites || []).filter((s) => s.enabled !== false);

    const list: FeaturedMeta[] = [];

    // 1. Featured Movie Hub: 1Shows
    const site1 = movieSites.find((s) => s.name.toLowerCase().includes("1shows")) || movieSites[0];
    if (site1) {
      list.push({
        site: site1,
        categoryId: "movies",
        categoryLabel: "Featured Movie Hub",
        tagline: "4K UHD mirror streams with fast multi-server playback and instant subtitles.",
        posters: [
          { title: "Dune: Part Two", tag: "Sci-Fi", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80" },
          { title: "Oppenheimer", tag: "Drama", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80" },
          { title: "Spider-Man", tag: "Action", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80" },
          { title: "Interstellar", tag: "IMAX", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80" },
          { title: "Blade Runner", tag: "Cyberpunk", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80" },
        ],
      });
    }

    // 2. Featured Anime Portal: Miruro / ReAnime
    const anime1 = animeSites.find((s) => s.name.toLowerCase().includes("miruro") || s.name.toLowerCase().includes("reanime") || s.name.toLowerCase().includes("animepahe")) || animeSites[0];
    if (anime1) {
      list.push({
        site: anime1,
        categoryId: "anime",
        categoryLabel: "Featured Anime Portal",
        tagline: "Comprehensive subbed and dubbed anime library with zero buffer lag.",
        posters: [
          { title: "Solo Leveling", tag: "Action", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80" },
          { title: "Jujutsu Kaisen", tag: "Shonen", image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80" },
          { title: "Demon Slayer", tag: "Supernatural", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80" },
          { title: "Cyberpunk: Edgerunners", tag: "Sci-Fi", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80" },
          { title: "Attack on Titan", tag: "Epic", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80" },
        ],
      });
    }

    // 3. Featured Global Cinema: PRMovies / Cinejoy
    const site2 = movieSites.find((s) => s.name.toLowerCase().includes("prmovies") || s.name.toLowerCase().includes("hollymoviehd") || s.name.toLowerCase().includes("cinejoy")) || movieSites[1];
    if (site2) {
      list.push({
        site: site2,
        categoryId: "movies",
        categoryLabel: "Featured Global Cinema",
        tagline: "Multilingual cinema catalogue featuring Hollywood, Bollywood & regional hits.",
        posters: [
          { title: "Avatar: Way of Water", tag: "3D", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80" },
          { title: "The Dark Knight", tag: "Thriller", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80" },
          { title: "Inception", tag: "Mind-Bending", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80" },
          { title: "Gladiator II", tag: "Epic", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80" },
          { title: "Dune", tag: "Sci-Fi", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80" },
        ],
      });
    }

    // 4. Featured Streaming Hub: Spenflix / FlickyStream
    const site3 = movieSites.find((s) => s.name.toLowerCase().includes("spenflix") || s.name.toLowerCase().includes("flickystream") || s.name.toLowerCase().includes("1flex")) || movieSites[2];
    if (site3) {
      list.push({
        site: site3,
        categoryId: "movies",
        categoryLabel: "Featured Streaming Hub",
        tagline: "Ad-free playback interface with cross-device sync and auto-next episodes.",
        posters: [
          { title: "Blade Runner 2049", tag: "Cyberpunk", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80" },
          { title: "Arcane Season 2", tag: "Animation", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80" },
          { title: "Top Gun: Maverick", tag: "Action", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80" },
          { title: "Stranger Things", tag: "Horror", image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80" },
          { title: "The Batman", tag: "Noir", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80" },
        ],
      });
    }

    return list.length > 0 ? list : [{
      site: movieSites[0] || { name: "1Shows", url: "https://1shows.org", logo: "./logo/movies_shows/1shows.png" },
      categoryId: "movies",
      categoryLabel: "Featured Platform",
      tagline: "Hand-curated high-speed streaming index with fast player mirrors and minimal ad friction.",
      posters: [
        { title: "Dune", tag: "Sci-Fi", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80" },
        { title: "Interstellar", tag: "IMAX", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80" },
      ],
    }];
  }, [categories]);

  // 5-minute timer rotation
  useEffect(() => {
    if (featuredList.length <= 1) return;

    const timer = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredList.length);
        setFade(false);
      }, 200);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [featuredList.length]);

  function changeFeatured(index: number) {
    if (index === currentIndex) return;
    setFade(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(false);
    }, 150);
  }

  function nextFeatured() {
    changeFeatured((currentIndex + 1) % featuredList.length);
  }

  function prevFeatured() {
    changeFeatured((currentIndex - 1 + featuredList.length) % featuredList.length);
  }

  // Random Discovery Roulette
  function rollRandomStream() {
    if (allSites.length === 0 || rolling) return;
    setRolling(true);
    let counter = 0;
    const interval = setInterval(() => {
      const pick = allSites[Math.floor(Math.random() * allSites.length)];
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        setRolling(false);
        onInspect(pick.site, pick.categoryId);
      }
    }, 80);
  }

  const current = featuredList[currentIndex] || featuredList[0];

  return (
    <section className="mb-8 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
      {/* Left Block: Featured Spotlight Card with Full-Bleed Posters */}
      <div className="porcelain-card relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-8 bg-white shadow-sm border border-[var(--border)] min-h-[270px]">
        {/* Full-Bleed Posters Covering the Whole Background */}
        <div className="pointer-events-none absolute inset-0 flex items-stretch select-none overflow-hidden">
          <div className="flex w-full h-full gap-1">
            {current.posters.map((p, i) => (
              <div key={`${p.title}-${i}`} className="relative flex-1 h-full min-w-0">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover scale-105"
                  sizes="300px"
                  unoptimized
                />
              </div>
            ))}
          </div>

          {/* Clean Porcelain Frosted Fade Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/35 dark:from-[#141422] dark:via-[#141422]/90 dark:to-transparent" />
        </div>

        {/* Top Header: Badge, 5-Min Timer Note & Switcher */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-xs">
              <Sparkles size={11} />
              <span>{current.categoryLabel}</span>
            </span>
            <span className="text-[11px] font-mono text-[var(--fg-muted)] font-medium hidden sm:inline-block">
              • Rotates every 5 min
            </span>
          </div>

          {/* Quick Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous Featured"
              onClick={prevFeatured}
              className="grid h-7 w-7 place-items-center rounded-full bg-white/90 border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-white transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="flex items-center gap-1 px-1">
              {featuredList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Featured platform ${idx + 1}`}
                  onClick={() => changeFeatured(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    currentIndex === idx
                      ? "w-5 bg-[var(--accent)]"
                      : "w-1.5 bg-[var(--fg-muted)]/40 hover:bg-[var(--fg-muted)]"
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next Featured"
              onClick={nextFeatured}
              className="grid h-7 w-7 place-items-center rounded-full bg-white/90 border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-white transition-all cursor-pointer shadow-xs"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Main Details Area */}
        <div className={cn("relative z-10 max-w-xl transition-opacity duration-200", fade && "opacity-0")}>
          <div className="flex items-center gap-4 mb-3">
            <div className="grid h-16 w-32 place-items-center rounded-2xl bg-[#161722] p-2.5 border border-black/10 shrink-0 shadow-inner">
              <Image
                src={normalizeAsset(current.site.logo)}
                alt={current.site.name}
                width={120}
                height={44}
                className="max-h-10 w-auto object-contain drop-shadow-sm"
                unoptimized
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)] font-space">
                {current.site.name}
              </h1>
              <div className="text-[11px] font-mono text-[var(--accent)] font-semibold mt-0.5">
                Verified Streaming Mirror
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed line-clamp-2 mt-2">
            {current.tagline}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 mt-6 flex items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <a
              href={current.site.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm transition-all duration-150 hover:opacity-90 cursor-pointer text-white font-space"
              style={{
                background: "var(--accent)",
              }}
            >
              <span>Launch Stream</span>
              <ArrowUpRight size={14} />
            </a>

            <button
              type="button"
              onClick={() => onInspect(current.site, current.categoryId)}
              className="porcelain-pill inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold cursor-pointer bg-white/90"
            >
              <Info size={13} />
              <span>Details</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--fg-muted)] font-medium">
            <Film size={12} className="text-[var(--accent)]" />
            <span>Featured Catalog</span>
          </div>
        </div>
      </div>

      {/* Right Block: Single Unified Clean Animated Cinema Pulse Card */}
      <div className="porcelain-card relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 bg-white shadow-sm border border-[var(--border)] min-h-[270px]">
        {/* Animated Background Audio/Frequency Wave Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden flex items-end justify-center gap-2 pb-4 select-none">
          {[40, 65, 85, 45, 95, 70, 50, 80, 60, 90, 75, 40, 85, 55, 70].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-[var(--accent)]/30 via-cyan-400/20 to-transparent transition-all duration-500 animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 120}ms`,
                animationDuration: `${1.4 + (i % 3) * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Top: Live Network Telemetry Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--fg)]">
              Live Network
            </span>
          </div>

          <LiveUsers />
        </div>

        {/* Center: Clean Big Metric Display */}
        <div className="relative z-10 my-3">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)] font-space tracking-tight tabular-nums">
              {totalSites}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Verified Sources
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[var(--fg-muted)] leading-relaxed">
            Community-verified high bitrate streaming mirrors indexed across movies, anime, and live TV.
          </p>
        </div>

        {/* Bottom: Interactive Stream Discovery Action */}
        <div className="relative z-10 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={rollRandomStream}
            disabled={rolling}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2.5 rounded-2xl py-3 px-4 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer font-space",
              rolling ? "opacity-80 scale-[0.99]" : "hover:opacity-95 hover:shadow-md"
            )}
            style={{
              background: "linear-gradient(135deg, #5B3DF5 0%, #3B82F6 50%, #06B6D4 100%)",
            }}
          >
            <Dices size={16} className={cn("transition-transform duration-300", rolling && "animate-spin")} />
            <span>{rolling ? "Rolling Random Stream..." : "Surprise Me (Random Stream)"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
