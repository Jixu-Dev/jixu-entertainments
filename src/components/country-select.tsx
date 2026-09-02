"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useRegions } from "./region-context";
import { DEFAULT_REGION_CLIENT } from "@/lib/constants";
import { FlagIcon } from "./flag-icon";

export function CountrySelect() {
  const router = useRouter();
  const pathname = usePathname();
  const { regions } = useRegions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = useMemo(() => {
    const seg = (pathname ?? "/").split("/").filter(Boolean)[0]?.toUpperCase();
    if (!seg) return DEFAULT_REGION_CLIENT;
    const match = regions.find((r) => r.code === seg);
    return match ? match.code : DEFAULT_REGION_CLIENT;
  }, [pathname, regions]);

  const currentRegion = regions.find((r) => r.code === current);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  const handleSelect = (code: string) => {
    setOpen(false);
    router.push(code === DEFAULT_REGION_CLIENT ? "/" : `/${code.toLowerCase()}`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Select region"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="porcelain-pill flex h-9 cursor-pointer items-center gap-2 pl-3 pr-2 text-xs font-semibold"
      >
        {currentRegion ? (
          <FlagIcon code={currentRegion.flag} size={15} />
        ) : (
          <Globe size={14} className="text-[var(--accent)]" />
        )}
        <span className="text-[var(--fg)] font-space">{currentRegion?.name ?? "Region"}</span>
        <ChevronDown
          size={12}
          className={`text-[var(--fg-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[100] mt-2 max-h-80 w-52 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
        >
          <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)] border-b border-[var(--border)] mb-1">
            Choose Catalog
          </div>
          <div className="space-y-0.5 pt-0.5">
            {regions.map((r) => {
              const isSel = r.code === current;
              return (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => handleSelect(r.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-all cursor-pointer ${
                    isSel
                      ? "bg-[var(--accent)] text-white font-bold shadow-xs"
                      : "text-[var(--fg-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--fg)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlagIcon code={r.flag} size={16} />
                    <span className="font-space font-medium">{r.name}</span>
                  </div>
                  <span className="font-mono text-[10px] opacity-75">{r.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
