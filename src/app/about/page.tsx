import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Zap, Sparkles, Heart, HelpCircle, Layers, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the mission, philosophy, and safety standards behind Jixu Entertainments.",
};

const STATS = [
  { label: "Indexed Platforms", value: "250+" },
  { label: "Active Regions", value: "8" },
  { label: "Update Frequency", value: "Daily" },
  { label: "Ad Tracker Footprint", value: "0" },
];

const VALUES = [
  {
    icon: <Zap className="text-[var(--accent)]" size={22} />,
    title: "Instant Direct Access",
    desc: "No landing page bloat, fake download triggers, or forced registration paywalls. You click, you watch.",
  },
  {
    icon: <ShieldCheck className="text-emerald-500" size={22} />,
    title: "Rigorous Safety Curation",
    desc: "Every domain is manually tested for safety, responsive playback, SSL certificate health, and minimal adware intrusion.",
  },
  {
    icon: <Layers className="text-purple-500" size={22} />,
    title: "Regional Intelligence",
    desc: "Content is cataloged with localized mirror rankings, ensuring fast CDN resolution across the Americas, Europe, and Asia.",
  },
  {
    icon: <Sparkles className="text-amber-500" size={22} />,
    title: "Community Driven",
    desc: "Open submission pipes let users submit new mirrors, suggest corrections, and report broken endpoints.",
  },
];

const SAFETY_TIPS = [
  "Always browse streaming sites with a modern content blocker (such as uBlock Origin or Brave browser).",
  "Never download executable files (.exe, .dmg, .apk) masquerading as video players or video codecs.",
  "Never enter personal credit card numbers or passwords on third-party video hosts.",
  "Use a reliable VPN if your internet provider throttles video streams or restricts domain lookups.",
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-12 sm:px-8 lg:px-12 2xl:px-16 md:py-16">
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="flex justify-center mb-3">
          <span className="font-signature text-3xl sm:text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FF007A] via-[#8B5CF6] to-[#5B3DF5] filter drop-shadow-[0_0_12px_rgba(255,0,122,0.35)]">
            Jixu Entertainments
          </span>
        </div>
        <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
          Directory Mission
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[var(--fg)] font-space">
          Built for the Modern Streamer
        </h1>
        <p className="mt-3 text-sm text-[var(--fg-muted)] max-w-xl mx-auto leading-relaxed">
          Jixu Entertainments provides an organized, verified index of free streaming media, eliminating malware redirects and broken links.
        </p>
      </header>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Philosophy Panel */}
        <section className="porcelain-card p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-[var(--fg)] mb-3 font-space">Our Philosophy</h2>
          <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
            Finding reliable streaming websites shouldn&apos;t require navigating mazes of deceptive popups and suspicious redirects. Jixu Entertainments was designed to curate the cleanest, highest-quality streaming sources on the web and organize them into an intuitive, responsive directory.
          </p>
          <p className="text-sm leading-relaxed text-[var(--fg-muted)] mt-4">
            We do not host or upload video files. We provide a curated, community-verified index of publicly available platforms across Movies, TV Series, Anime, Manga, and Live Sports.
          </p>
        </section>

        {/* Numbers Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className="porcelain-card p-6 text-center rounded-3xl">
              <div className="text-2xl sm:text-3xl font-bold text-[var(--fg)] font-space tracking-tight">{s.value}</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-muted)] mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pillars Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--fg)] font-space">Core Principles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <div key={i} className="porcelain-card p-6 rounded-3xl space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-[var(--bg-elev)] border border-[var(--border)] flex items-center justify-center shadow-xs">
                  {v.icon}
                </div>
                <h3 className="font-bold text-sm font-space text-[var(--fg)]">{v.title}</h3>
                <p className="text-xs leading-relaxed text-[var(--fg-muted)]">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Streamer Safety Guide */}
        <section className="porcelain-card p-8 rounded-3xl border border-amber-500/20 bg-amber-500/[0.02] space-y-4">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-bold font-space">
            <HelpCircle size={18} />
            <span>Essential Streamer Safety Rules</span>
          </div>
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
            While we rigorously review all cataloged links, third-party video hosts frequently rotate advertisements. We strongly advise following these basic browsing precautions:
          </p>
          <ul className="grid gap-2.5 text-xs text-[var(--fg-muted)] sm:grid-cols-2">
            {SAFETY_TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-3">
                <span className="text-[var(--accent)] font-bold shrink-0 font-mono">0{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Call to Action */}
        <section className="porcelain-card p-8 text-center rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-[var(--fg)] font-space">Know a site we missed?</h2>
          <p className="text-xs text-[var(--fg-muted)] max-w-md mx-auto">
            Help expand the directory by submitting high-quality streaming platforms or reporting offline mirrors.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/request"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold font-space shadow-xs hover:opacity-90 transition-opacity"
            >
              <span>Submit a Site</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="porcelain-pill inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
            >
              <span>Explore Directory</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
