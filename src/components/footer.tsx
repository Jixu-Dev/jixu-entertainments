import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-6 px-4 py-10 text-xs text-[var(--fg-muted)] md:flex-row sm:px-8 lg:px-12 2xl:px-16">
        {/* Left: Brand Identity */}
        <div className="flex flex-col items-center gap-1.5 md:items-start">
          <BrandLogo size={46} />
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">
            Curated directory for free streaming media, anime, and live sports.
          </p>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold font-space">
          <Link href="/" className="transition-colors hover:text-[var(--fg)]">
            Explore
          </Link>
          <Link href="/about" className="transition-colors hover:text-[var(--fg)]">
            About
          </Link>
          <Link href="/request" className="transition-colors hover:text-[var(--fg)]">
            Submit Site
          </Link>
          <Link href="/dmca" className="transition-colors hover:text-[var(--fg)]">
            DMCA
          </Link>
        </div>

        {/* Right: Copyright */}
        <div className="flex flex-col items-center gap-0.5 text-center md:items-end md:text-right text-[11px] font-mono">
          <div className="text-[var(--fg)] font-medium">Decentralized & Zero-Tracker</div>
          <div className="text-[var(--fg-subtle)] opacity-70">
            © {new Date().getFullYear()} Jixu Entertainments
          </div>
        </div>
      </div>
    </footer>
  );
}
