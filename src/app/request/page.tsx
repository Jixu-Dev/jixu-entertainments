import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { RequestForm } from "./request-form";

export const metadata: Metadata = {
  title: "Submit a Streaming Site",
  description: "Request or submit a verified streaming site to be added to the Jixu Entertainments directory.",
};

const LOOK_FOR = [
  "Active, buffer-free streaming servers",
  "High definition (1080p/4K) quality",
  "Extensive libraries for movies, anime, or sports",
  "Mobile and TV browser compatibility",
  "Minimal intrusive ads",
];

const AVOID = [
  "Broken or offline domain endpoints",
  "Excessive intrusive popups or malware",
  "Phishing or credential-stealing portals",
  "Forced paid paywalls",
];

export default function RequestPage() {
  return (
    <main className="mx-auto w-full max-w-[1920px] px-4 py-10 sm:px-8 lg:px-12 2xl:px-16 md:py-16">
      <header className="mb-10 text-center">
        <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
          Community Submissions
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[var(--fg)] font-space">
          Submit a Platform
        </h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)] max-w-lg mx-auto">
          Help expand our verified media catalog with high-quality streaming hubs.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="porcelain-card p-6 sm:p-8 rounded-3xl">
          <h2 className="mb-5 text-base font-bold text-[var(--fg)] font-space">
            Platform Details
          </h2>
          <RequestForm />
        </section>

        <section className="space-y-4">
          <div className="porcelain-card p-6 rounded-3xl">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">
              <CheckCircle2 size={15} /> What We Index
            </h3>
            <ul className="space-y-2 text-xs text-[var(--fg-muted)]">
              {LOOK_FOR.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="porcelain-card p-6 rounded-3xl">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider font-mono">
              <XCircle size={15} /> What We Avoid
            </h3>
            <ul className="space-y-2 text-xs text-[var(--fg-muted)]">
              {AVOID.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
