"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "obsidian";

  return (
    <button
      type="button"
      aria-label="Toggle Theme"
      onClick={() => setTheme(isDark ? "porcelain" : "obsidian")}
      className="porcelain-pill inline-flex h-9 w-9 items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer transition-transform hover:scale-105"
      title={isDark ? "Switch to Porcelain Light" : "Switch to Obsidian Dark"}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
