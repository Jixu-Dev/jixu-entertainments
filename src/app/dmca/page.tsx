"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, Send, FileText, Lock, ChevronDown, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "1. Nature of the Service",
    content:
      "Jixu Entertainments is an informational directory and search index. We do not host, upload, store, or stream any media files, video streams, torrents, or copyrighted audiovisual content on our servers. All links and site names indexed on this platform point to external, publicly accessible third-party services operated by independent entities.",
  },
  {
    title: "2. Non-Hosting Disclaimer",
    content:
      "Jixu Entertainments has no control over the content, availability, data practices, or policies of external websites linked in our directory. Inclusion of a link does not constitute endorsement, partnership, or affiliation with any third-party provider.",
  },
  {
    title: "3. Takedown & Link Removal Requests",
    content:
      "If you are a copyright owner or authorized representative and believe that a link indexed on Jixu Entertainments directs users to content that infringes upon your copyright, you may submit a formal takedown notification using the form below. Upon receiving a valid notice with identifiable URLs, our legal compliance officer will promptly review and delist the referenced link from our index.",
  },
];

export default function DmcaPage() {
  const [formData, setFormData] = useState({
    claimantName: "",
    organization: "",
    email: "",
    infringingUrl: "",
    originalWorkDescription: "",
    digitalSignature: "",
    goodFaithCheck: false,
    accuracyCheck: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedPolicy, setExpandedPolicy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.goodFaithCheck || !formData.accuracyCheck) {
      setErrorMsg("Please accept both good-faith and perjury legal statements to proceed.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dmca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit DMCA request.");
      }

      setReferenceId(data.id);
      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="flex justify-center mb-3">
          <span className="font-signature text-3xl sm:text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FF007A] via-[#8B5CF6] to-[#5B3DF5] filter drop-shadow-[0_0_12px_rgba(255,0,122,0.35)]">
            Jixu Entertainments
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500 mb-2 border border-rose-500/20">
          <ShieldAlert size={12} />
          <span>Legal & Compliance Office</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-[var(--fg)] font-space">
          DMCA Notice & Takedown
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-[var(--fg-muted)] max-w-xl mx-auto leading-relaxed">
          Submit an official copyright takedown notice. Valid requests are reviewed directly by the Jixu Entertainments compliance administrator.
        </p>
      </header>

      {/* Policy Accordion Toggle */}
      <div className="porcelain-card p-5 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => setExpandedPolicy(!expandedPolicy)}
          className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-bold text-[var(--fg)] font-space cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[var(--accent)]" />
            <span>Review Copyright & Non-Hosting Policy</span>
          </div>
          <ChevronDown
            size={16}
            className={cn("text-[var(--fg-muted)] transition-transform duration-200", expandedPolicy && "rotate-180")}
          />
        </button>

        {expandedPolicy && (
          <div className="mt-4 space-y-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--fg-muted)] leading-relaxed animate-fadeIn">
            {SECTIONS.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <h3 className="font-semibold text-[var(--fg)]">{sec.title}</h3>
                <p>{sec.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Success State */}
      {submitted ? (
        <div className="porcelain-card p-8 sm:p-10 rounded-3xl text-center animate-fadeIn border-emerald-500/30">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--fg)] font-space">Notice Received Successfully</h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--fg-muted)] max-w-md mx-auto leading-relaxed">
            Your notice has been securely queued in the Owner Legal Inbox. Our administrator will examine the referenced links and take appropriate delisting action.
          </p>

          {referenceId && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--bg)] px-4 py-2 text-xs font-mono text-[var(--fg)] border border-[var(--border)]">
              <span className="text-[var(--fg-muted)]">Reference Ticket ID:</span>
              <strong className="text-[var(--accent)]">#{referenceId}</strong>
            </div>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  claimantName: "",
                  organization: "",
                  email: "",
                  infringingUrl: "",
                  originalWorkDescription: "",
                  digitalSignature: "",
                  goodFaithCheck: false,
                  accuracyCheck: false,
                });
              }}
              className="porcelain-pill inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <span>Submit Another Request</span>
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Legal Form */
        <form onSubmit={handleSubmit} className="porcelain-card p-6 sm:p-9 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border)]">
            <Lock size={16} className="text-[var(--accent)]" />
            <h2 className="text-base font-bold text-[var(--fg)] font-space">Official Takedown Request Form</h2>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-rose-500/10 p-4 text-xs font-medium text-rose-600 border border-rose-500/20">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Claimant Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 font-space">
                Copyright Owner / Authorized Agent Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={formData.claimantName}
                onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 font-space">
                Company / Organization Name
              </label>
              <input
                type="text"
                placeholder="e.g. Studio Productions LLC (Optional)"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 font-space">
              Official Contact Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. legal@yourcompany.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
          </div>

          {/* Infringing Link on Jixu */}
          <div>
            <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 font-space">
              URL on Jixu Entertainments to be Delisted *
            </label>
            <input
              type="url"
              required
              placeholder="e.g. https://1shows.org or link indexed in catalog"
              value={formData.infringingUrl}
              onChange={(e) => setFormData({ ...formData, infringingUrl: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
            <p className="mt-1 text-[11px] text-[var(--fg-muted)]">
              Specify the exact site URL or indexed mirror link that directs to infringing content.
            </p>
          </div>

          {/* Description of Original Work */}
          <div>
            <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 font-space">
              Description of Copyrighted Work & Evidence of Rights *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a clear description of the copyrighted movie, TV series, or artistic work claimed to be infringed, including copyright registration or proof of ownership."
              value={formData.originalWorkDescription}
              onChange={(e) => setFormData({ ...formData, originalWorkDescription: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Good-Faith Statements */}
          <div className="rounded-2xl bg-[var(--bg)] p-4 sm:p-5 border border-[var(--border)] space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={formData.goodFaithCheck}
                onChange={(e) => setFormData({ ...formData, goodFaithCheck: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded accent-[var(--accent)] cursor-pointer"
              />
              <span className="text-xs text-[var(--fg-muted)] leading-relaxed">
                I have a good-faith belief that the use of the copyrighted material identified above is not authorized by the copyright owner, its agent, or the law.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={formData.accuracyCheck}
                onChange={(e) => setFormData({ ...formData, accuracyCheck: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded accent-[var(--accent)] cursor-pointer"
              />
              <span className="text-xs text-[var(--fg-muted)] leading-relaxed">
                I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner.
              </span>
            </label>
          </div>

          {/* Digital Signature */}
          <div>
            <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 font-space">
              Digital Signature (Type Full Legal Name) *
            </label>
            <input
              type="text"
              required
              placeholder="/s/ John Doe"
              value={formData.digitalSignature}
              onChange={(e) => setFormData({ ...formData, digitalSignature: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-mono text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-xs font-bold text-white shadow-sm transition-all duration-200 cursor-pointer font-space",
                loading ? "opacity-75 cursor-not-allowed" : "hover:opacity-95 hover:shadow-md"
              )}
              style={{
                background: "linear-gradient(135deg, #5B3DF5 0%, #3B82F6 100%)",
              }}
            >
              {loading ? (
                <span>Submitting Legal Notice...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>Transmit DMCA Takedown Notice</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
