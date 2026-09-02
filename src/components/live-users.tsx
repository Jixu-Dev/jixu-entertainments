"use client";

import { useEffect, useState } from "react";

const PING_INTERVAL_MS = 5_000;

interface PingResponse {
  online: number;
  totalVisits: number;
  serverTime: number;
}

export function LiveUsers({ fullText = false }: { fullText?: boolean }) {
  const [totalVisits, setTotalVisits] = useState<number>(1);
  const [online, setOnline] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function ping() {
      try {
        const res = await fetch("/api/ping", { method: "POST", cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as PingResponse;
        if (!cancelled) {
          if (typeof data.totalVisits === "number") setTotalVisits(data.totalVisits);
          if (typeof data.online === "number") setOnline(data.online);
        }
      } catch {
        // Fallback
      } finally {
        if (!cancelled) timer = setTimeout(ping, PING_INTERVAL_MS);
      }
    }

    ping();

    function onVisibility() {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        ping();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      className="porcelain-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
      title={`${online} active online • ${totalVisits} total visits`}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span
          className="absolute inline-block h-2 w-2 animate-ping rounded-full"
          style={{ background: "var(--success)", opacity: 0.75 }}
        />
        <span
          className="relative inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--success)" }}
        />
      </span>
      <span className="font-mono font-bold text-[var(--fg)] tabular-nums">{online}</span>
      <span className="text-[var(--fg-muted)]">Live</span>
      <span className="text-[var(--border)] opacity-60">•</span>
      <span className="font-mono font-bold text-[var(--accent)] tabular-nums">{totalVisits}</span>
      <span className="text-[var(--fg-muted)]">
        {fullText ? "People Visited Jixu Entertainments" : "Visited"}
      </span>
    </div>
  );
}
