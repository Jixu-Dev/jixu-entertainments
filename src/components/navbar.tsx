"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { ThemeSwitcher } from "./theme-switcher";
import { CountrySelect } from "./country-select";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "./command-palette";

// Original navigation tabs preserved verbatim
const NAV = [
  { href: "/", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/request", label: "Submit Site" },
  { href: "/dmca", label: "DMCA" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const scrolledRef = useRef(false);
  const { open: openPalette } = useCommandPalette();

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const isPast = window.scrollY > 20;
      if (isPast !== scrolledRef.current) {
        scrolledRef.current = isPast;
        setScrolled(isPast);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    updateScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Hide public navigation bar completely inside the admin panel (after all hooks)
  if (pathname && pathname.startsWith("/admin-panel")) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu",
        scrolled ? "pt-3 px-3 sm:px-6 pointer-events-none" : "pt-3 px-4 sm:px-8 lg:px-12 2xl:px-16"
      )}
    >
      {/* 
        Container morphs between:
        - At Top (Unscrolled): Fully dissolved transparent layout across top
        - On Scroll: Pulls in into the Liquid Glass Reflection Bar with optical refraction of background content
      */}
      <div
        className={cn(
          "mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled ? "max-w-4xl lg:max-w-5xl pointer-events-auto" : "w-full max-w-[1920px]"
        )}
      >
        <nav
          className={cn(
            "relative flex items-center justify-between border-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu",
            scrolled
              ? "liquid-glass-reflect px-4 py-2 sm:px-6 sm:py-2.5"
              : "rounded-none bg-transparent backdrop-blur-none shadow-none px-0 py-1"
          )}
        >
          {/* Left: Animated Jixu Brand Logo */}
          <div className="flex items-center gap-2 shrink-0 relative z-10">
            <Link href="/" className="shrink-0 transition-all duration-300 hover:opacity-90">
              <BrandLogo size={scrolled ? 36 : 42} showText={true} />
            </Link>
          </div>

          {/* Center: Original Navigation Links */}
          <ul className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2 relative z-10">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);

              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={cn(
                      "relative rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold font-space transition-all duration-200 select-none block",
                      active
                        ? "text-white font-bold drop-shadow-sm"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elev)]/50"
                    )}
                  >
                    <span className="relative z-10">{n.label}</span>

                    {/* Active Glowing Pill Backplate */}
                    {active && (
                      <span
                        className="absolute inset-0 rounded-full shadow-sm"
                        style={{
                          background: "linear-gradient(135deg, #FF007A 0%, #7928CA 50%, #5B3DF5 100%)",
                          boxShadow: "0 0 16px rgba(255, 0, 122, 0.45)",
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={openPalette}
              aria-label="Search all streaming sites"
              title="Search (⌘K)"
              className={cn(
                "flex items-center justify-center rounded-full transition-all shadow-xs backdrop-blur-md",
                scrolled
                  ? "h-8 sm:h-9 px-2.5 sm:px-3 text-xs border-0 bg-white/20 dark:bg-white/10 text-[var(--fg)] hover:bg-white/30 dark:hover:bg-white/20"
                  : "h-9 px-3 gap-2 border-0 bg-[var(--bg-card)]/80 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
              )}
            >
              <Search size={14} className="text-[var(--accent)]" />
              <span className="hidden sm:inline font-mono">Search...</span>
              <kbd className="hidden rounded bg-[var(--bg)]/80 px-1.5 py-0.5 font-mono text-[10px] text-[var(--fg-muted)] lg:inline-block">
                ⌘K
              </kbd>
            </button>

            {/* Notification Sentinel Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotificationToast(!showNotificationToast)}
                aria-label="Live Mirror Updates"
                title="Live Mirror Health"
                className={cn(
                  "relative grid place-items-center rounded-full transition-all shadow-xs backdrop-blur-md",
                  scrolled
                    ? "h-8 w-8 sm:h-9 sm:w-9 border-0 bg-white/20 dark:bg-white/10 text-[var(--fg)] hover:bg-white/30 dark:hover:bg-white/20"
                    : "h-9 w-9 border-0 bg-[var(--bg-card)]/80 text-[var(--fg-muted)] hover:text-[var(--fg)]"
                )}
              >
                <Bell size={14} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FF007A] ring-2 ring-[var(--bg-card)] animate-pulse" />
              </button>

              {/* Notification Toast */}
              {showNotificationToast && (
                <div className="absolute top-12 right-0 w-64 rounded-3xl bg-[var(--bg-card)] p-4 shadow-2xl backdrop-blur-2xl text-xs space-y-2 z-50 text-[var(--fg)] border border-[var(--border)] animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                    <span className="font-space font-bold text-xs flex items-center gap-1.5 text-[var(--accent)]">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      Live Mirror Sentinel
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">100% OK</span>
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">
                    All global CDN streaming mirrors are active with zero malware redirects.
                  </p>
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Country Selector */}
            <div className="hidden sm:flex items-center">
              <CountrySelect />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label="Toggle Navigation Menu"
              className="grid h-9 w-9 place-items-center rounded-full border-0 bg-[var(--bg-card)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] md:hidden shadow-xs"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="mx-4 mt-2 rounded-3xl bg-[var(--bg-card)] p-4 shadow-2xl backdrop-blur-2xl md:hidden border border-[var(--border)] space-y-3">
          <ul className="space-y-1">
            {NAV.map((n) => {
              const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-2xl px-4 py-2.5 text-xs font-semibold font-space transition-colors",
                      active
                        ? "bg-[var(--accent)] text-white font-bold"
                        : "text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
                    )}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs font-space text-[var(--fg-muted)] font-medium">Select Catalog:</span>
            <CountrySelect />
          </div>
        </div>
      )}
    </header>
  );
}
