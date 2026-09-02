"use client";

import { useState } from "react";
import { Plus, X, Send, CheckCircle2 } from "lucide-react";
import { useRegions } from "@/components/region-context";
import { CATEGORY_META } from "@/lib/constants";

interface TargetRow {
  id: number;
  region: string;
  category: string;
}

const SUBMIT_URL = "/api/site-requests";

export function RequestForm() {
  const { regions } = useRegions();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [targets, setTargets] = useState<TargetRow[]>([{ id: 1, region: "", category: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTarget() {
    setTargets((t) => [...t, { id: Date.now(), region: "", category: "" }]);
  }
  function removeTarget(id: number) {
    setTargets((t) => (t.length > 1 ? t.filter((r) => r.id !== id) : t));
  }
  function updateTarget(id: number, key: "region" | "category", value: string) {
    setTargets((t) => t.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const valid = targets.filter((t) => t.region && t.category).map((t) => ({ region: t.region, categoryId: t.category }));
    if (!valid.length) {
      setError("Please choose at least one valid region and category channel.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteUrl: url,
          siteName: name,
          siteFeature: why,
          targets: valid,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Submission failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="porcelain-card p-10 text-center rounded-3xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-lg font-bold text-[var(--fg)] font-space">Request Submitted</h3>
        <p className="mt-1 text-xs text-[var(--fg-muted)] max-w-md mx-auto leading-relaxed">
          Thank you. Our moderators will test the domain for health, video bitrate, and safety before indexing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Streaming Domain URL">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example-streaming.com"
          className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2.5 text-xs font-semibold outline-none focus:border-[var(--accent)] rounded-xl placeholder:font-normal placeholder:text-[var(--fg-muted)]"
        />
      </Field>

      <Field label="Site Title / Display Name">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. CinemaHD, AnimeFlix"
          className="w-full bg-[var(--bg)] border border-[var(--border)] px-4 py-2.5 text-xs font-semibold outline-none focus:border-[var(--accent)] rounded-xl placeholder:font-normal placeholder:text-[var(--fg-muted)]"
        />
      </Field>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--fg)] font-space">
          Placement Target(s)
        </label>
        <div className="space-y-2">
          {targets.map((row) => (
            <div key={row.id} className="flex flex-col gap-2 sm:flex-row">
              <select
                required
                value={row.region}
                onChange={(e) => updateTarget(row.id, "region", e.target.value)}
                className="min-w-0 flex-1 bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-xs font-semibold outline-none focus:border-[var(--accent)] rounded-xl cursor-pointer"
              >
                <option value="">Select Region</option>
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
                ))}
              </select>
              <div className="flex gap-2 min-w-0 flex-1">
                <select
                  required
                  value={row.category}
                  onChange={(e) => updateTarget(row.id, "category", e.target.value)}
                  className="min-w-0 flex-1 bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-xs font-semibold outline-none focus:border-[var(--accent)] rounded-xl cursor-pointer"
                >
                  <option value="">Select Channel</option>
                  {Object.entries(CATEGORY_META).map(([id, m]) => (
                    <option key={id} value={id}>{m.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="Remove target"
                  disabled={targets.length <= 1}
                  onClick={() => removeTarget(row.id)}
                  className="porcelain-pill px-3 disabled:opacity-30 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTarget}
          className="porcelain-pill mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
        >
          <Plus size={12} className="text-[var(--accent)]" /> Add another channel
        </button>
      </div>

      <Field label="Why should this site be indexed?">
        <textarea
          required
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={3}
          placeholder="Details on library size, streaming speed, ad density..."
          className="w-full resize-y bg-[var(--bg)] border border-[var(--border)] px-4 py-2.5 text-xs font-medium outline-none focus:border-[var(--accent)] rounded-xl placeholder:font-normal placeholder:text-[var(--fg-muted)]"
        />
      </Field>

      {error && (
        <div className="rounded-xl border border-[var(--danger)] bg-rose-50 px-4 py-2.5 text-xs font-semibold text-[var(--danger)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:opacity-90 disabled:opacity-50 sm:w-auto cursor-pointer font-space"
        style={{
          background: "var(--accent)",
        }}
      >
        <Send size={13} /> {submitting ? "Submitting..." : "Submit Platform"}
      </button>
    </form>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--fg)] font-space">
        {label}
      </label>
      {children}
    </div>
  );
}
