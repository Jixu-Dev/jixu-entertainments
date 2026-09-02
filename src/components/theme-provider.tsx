"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export const THEMES = [
  { id: "porcelain", label: "Porcelain Light", swatch: "#F4F4F8", accentSwatch: "#5B3DF5" },
  { id: "obsidian", label: "Obsidian Dark", swatch: "#0B0B12", accentSwatch: "#7053FF" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="porcelain"
      themes={THEMES.map((t) => t.id)}
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    />
  );
}
