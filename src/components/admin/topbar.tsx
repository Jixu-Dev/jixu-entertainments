"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Film,
  Globe2,
  Inbox,
  Wrench,
  Scale,
  Sparkles,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

interface AdminTopbarProps {
  user: SessionUser | null;
  isOwner?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  isOwnerOnly?: boolean;
}

const TABS: NavItem[] = [
  { href: "/admin-panel", label: "Dashboard", icon: <LayoutDashboard size={14} />, exact: true },
  { href: "/admin-panel/sites", label: "Sites", icon: <Film size={14} /> },
  { href: "/admin-panel/regions", label: "Regions", icon: <Globe2 size={14} /> },
  { href: "/admin-panel/requests", label: "Submissions", icon: <Inbox size={14} /> },
  { href: "/admin-panel/tools", label: "Tools", icon: <Wrench size={14} /> },
];

export function AdminTopbar({ user, isOwner = false }: AdminTopbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const navItems: NavItem[] = [
    ...TABS,
    ...(isOwner
      ? [
          {
            href: "/admin-panel/dmca",
            label: "DMCA Inbox",
            icon: <Scale size={14} />,
            isOwnerOnly: true,
          },
        ]
      : []),
  ];

  // Find currently active item
  const currentTab =
    navItems.find((tab) =>
      tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href)
    ) ?? navItems[0];

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <header className="sticky top-3 z-40 w-full px-4 sm:px-8 lg:px-12 2xl:px-16">
      {/* Floating Capsule Bar (Handshake AI Style) */}
      <nav className="mx-auto flex w-full max-w-[1920px] items-center justify-between rounded-full border border-[var(--border)] bg-[var(--bg-card)]/90 px-4 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-300">
        {/* Left: Brand + Studio Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin-panel"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <BrandLogo size={38} />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] border border-[var(--accent)]/20">
            Studio
          </span>
        </div>

        {/* Center: Dynamic Interactive Morphing Pill Dock */}
        {user && (
          <div
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative hidden lg:block"
          >
            {/* Collapsed Active State Button */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold transition-all duration-300 font-space cursor-pointer shadow-xs",
                isOpen
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-md scale-[1.02]"
                  : currentTab?.isOwnerOnly
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                  : "border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--bg-elev)]"
              )}
            >
              <span className={cn(isOpen ? "text-white" : currentTab?.isOwnerOnly ? "text-rose-500" : "text-[var(--accent)]")}>
                {currentTab?.icon}
              </span>
              <span className="text-sm font-space">{currentTab?.label}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-300 opacity-70",
                  isOpen ? "rotate-180 text-white" : "group-hover:text-[var(--accent)]"
                )}
              />
            </button>

            {/* Hover / Click Dynamic Island Dropdown Menu */}
            {isOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)]/95 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-[var(--fg-muted)] font-bold">
                  Switch Module
                </div>
                <div className="space-y-1">
                  {navItems.map((tab) => {
                    const active = tab.exact
                      ? pathname === tab.href
                      : pathname?.startsWith(tab.href);

                    return (
                      <Link
                        key={tab.href}
                        href={tab.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 font-space cursor-pointer",
                          active
                            ? "bg-[var(--accent)] text-white font-bold shadow-xs"
                            : tab.isOwnerOnly
                            ? "text-rose-500 hover:bg-rose-500/10 font-bold"
                            : "text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={active ? "text-white" : tab.isOwnerOnly ? "text-rose-500" : "text-[var(--accent)]"}>
                            {tab.icon}
                          </span>
                          <span className="text-xs">{tab.label}</span>
                        </div>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        )}
                        {tab.isOwnerOnly && !active && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Owner
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right: Actions, Theme Toggle, Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            className="hidden sm:inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elev)] transition-colors font-space"
          >
            ← View site
          </Link>

          <ThemeSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              {/* Profile Capsule */}
              <div className="flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 shadow-xs">
                <Image
                  src={user.avatarUrl}
                  alt={user.githubLogin}
                  width={22}
                  height={22}
                  className="h-5.5 w-5.5 rounded-full ring-1 ring-[var(--accent)]/30"
                  unoptimized
                />
                <span className="text-xs font-medium font-mono text-[var(--fg)] hidden sm:inline">
                  {user.githubLogin}
                </span>
                <span className="rounded-full px-1.5 py-0.2 text-[8px] font-mono font-bold uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                  {user.permission}
                </span>
              </div>

              {/* Logout Button */}
              <a
                href="/api/auth/github/logout"
                title="Sign out of admin studio"
                className="porcelain-pill inline-flex h-9 w-9 items-center justify-center text-[var(--fg-muted)] hover:text-rose-500 hover:border-rose-500/30 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </a>
            </div>
          ) : null}

          {/* Mobile Menu Button */}
          {user && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="porcelain-pill inline-flex h-9 w-9 items-center justify-center lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && user && (
        <div className="mx-auto mt-2 max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)]/95 p-3 shadow-2xl backdrop-blur-2xl lg:hidden animate-in fade-in duration-200 space-y-1">
          {navItems.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname?.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all font-space",
                  active
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : tab.isOwnerOnly
                    ? "text-rose-500 hover:bg-rose-500/10 font-bold"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                {tab.isOwnerOnly && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    Owner
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[var(--border)]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-2xl px-4 py-2 text-xs font-semibold text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
            >
              ← Return to public website
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
