"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Trash2,
  Mail,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DmcaRecord {
  id: number;
  claimantName: string;
  organization: string | null;
  email: string;
  infringingUrl: string;
  originalWorkDescription: string;
  digitalSignature: string;
  status: "pending" | "resolved" | "dismissed";
  submittedAt: number;
  submitterIp: string;
  userAgent: string;
  resolvedAt: number | null;
  resolutionNotes: string | null;
}

export function DmcaInboxClient() {
  const [items, setItems] = useState<DmcaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("all");
  const [selected, setSelected] = useState<DmcaRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dmca");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("failed to load dmca items", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;

  async function updateStatus(id: number, status: "resolved" | "dismissed") {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/dmca", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, resolutionNotes }),
      });
      if (res.ok) {
        await loadData();
        setSelected(null);
        setResolutionNotes("");
      }
    } catch (e) {
      console.error("failed to update status", e);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteRecord(id: number) {
    if (!confirm("Are you sure you want to permanently delete this DMCA record?")) return;
    try {
      const res = await fetch(`/api/admin/dmca?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch (e) {
      console.error("failed to delete record", e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Metrics & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(["all", "pending", "resolved", "dismissed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                filter === f
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-white/80 dark:bg-[#1A1B2E] text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--border)]"
              )}
            >
              <span>{f}</span>
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="porcelain-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw size={13} className={cn(loading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* List / Table */}
      {loading ? (
        <div className="porcelain-card p-12 text-center text-xs text-[var(--fg-muted)]">
          Loading DMCA notices...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="porcelain-card p-12 text-center rounded-3xl">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-3">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-[var(--fg)] font-space">No Notices Found</h3>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            {filter === "pending"
              ? "All clear! There are no pending takedown requests."
              : "No DMCA submissions match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "porcelain-card p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                item.status === "pending" && "border-rose-500/30 bg-rose-500/[0.02]"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider",
                      item.status === "pending"
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : item.status === "resolved"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                    )}
                  >
                    {item.status === "pending" && <Clock size={10} />}
                    {item.status === "resolved" && <CheckCircle2 size={10} />}
                    {item.status === "dismissed" && <XCircle size={10} />}
                    <span>{item.status}</span>
                  </span>

                  <span className="text-xs font-mono text-[var(--fg-muted)]">
                    Ticket #{item.id} • {new Date(item.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="font-space font-bold text-sm text-[var(--fg)]">
                  {item.claimantName} {item.organization ? `(${item.organization})` : ""}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--fg-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Mail size={12} className="text-[var(--accent)]" />
                    <a href={`mailto:${item.email}`} className="hover:underline text-[var(--fg)]">
                      {item.email}
                    </a>
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <ExternalLink size={12} className="text-rose-500" />
                    <a
                      href={item.infringingUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:underline text-rose-500 font-mono"
                    >
                      {item.infringingUrl}
                    </a>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(item);
                    setResolutionNotes(item.resolutionNotes || "");
                  }}
                  className="porcelain-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  <MessageSquare size={13} />
                  <span>Inspect Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteRecord(item.id)}
                  title="Delete Record"
                  className="grid h-8 w-8 place-items-center rounded-xl text-[var(--fg-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Inspector */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="porcelain-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#161726] shadow-2xl border border-[var(--border)] space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-500 mb-1">
                  <ShieldAlert size={14} />
                  <span>DMCA Takedown Notice Ticket #{selected.id}</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--fg)] font-space">
                  {selected.claimantName} {selected.organization ? `(${selected.organization})` : ""}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--border)]">
                <div className="text-[10px] font-mono uppercase text-[var(--fg-muted)] mb-1">Claimant Email</div>
                <div className="font-mono font-bold text-[var(--fg)] select-all">{selected.email}</div>
              </div>

              <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--border)]">
                <div className="text-[10px] font-mono uppercase text-[var(--fg-muted)] mb-1">Digital Signature</div>
                <div className="font-mono font-bold text-[var(--accent)]">{selected.digitalSignature}</div>
              </div>
            </div>

            {/* Infringing URL */}
            <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--border)] space-y-1">
              <div className="text-[10px] font-mono uppercase text-[var(--fg-muted)]">Claimed Infringing Link</div>
              <a
                href={selected.infringingUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-xs font-bold text-rose-500 hover:underline break-all inline-flex items-center gap-1"
              >
                <span>{selected.infringingUrl}</span>
                <ArrowUpRight size={12} />
              </a>
            </div>

            {/* Description of Original Work */}
            <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--border)] space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[var(--fg-muted)]">Description & Proof of Rights</div>
              <p className="text-xs text-[var(--fg)] leading-relaxed whitespace-pre-wrap">
                {selected.originalWorkDescription}
              </p>
            </div>

            {/* Delist Quick Action */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertCircle size={16} className="shrink-0" />
                <span>Need to remove this site from catalog? Open the Sites Manager to disable or delete it.</span>
              </div>
              <Link
                href="/admin-panel/sites"
                className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
              >
                Go to Sites
              </Link>
            </div>

            {/* Resolution Form */}
            <div className="space-y-3 pt-4 border-t border-[var(--border)]">
              <label className="block text-xs font-bold text-[var(--fg)] font-space">
                Resolution Notes / Action Taken
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Delisted link from movies index; notified claimant via email."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-muted)]/50 focus:border-[var(--accent)] focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--fg-muted)] hover:bg-[var(--bg)] cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => updateStatus(selected.id, "dismissed")}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Dismiss Notice
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => updateStatus(selected.id, "resolved")}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                >
                  Mark as Resolved & Delisted
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
