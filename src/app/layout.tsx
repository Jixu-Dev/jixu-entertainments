import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CommandPaletteProvider } from "@/components/command-palette";
import { RegionContextProvider } from "@/components/region-context";
import { getRegions, buildSearchIndex, DEFAULT_REGION_CODE } from "@/lib/data";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jixu-entertainments.vercel.app"),
  title: {
    default: "Jixu Entertainments — Curated Streaming Index",
    template: "%s · Jixu Entertainments",
  },
  description:
    "A clean, verified directory of streaming sites across movies, TV shows, anime, manga, and live sports. Fast search with zero intrusive trackers.",
  applicationName: "Jixu Entertainments",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F4F8",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const regions = await getRegions();
  const searchIndex = await buildSearchIndex(DEFAULT_REGION_CODE);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrains.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen antialiased selection:bg-[var(--accent)] selection:text-white font-sans bg-[var(--bg)] text-[var(--fg)]">
        <ThemeProvider>
          <RegionContextProvider regions={regions} current={DEFAULT_REGION_CODE}>
            <CommandPaletteProvider initialIndex={searchIndex} regions={regions}>
              <div className="relative z-10 flex min-h-screen flex-col justify-between">
                <div>
                  <Navbar />
                  {children}
                </div>
                <Footer />
              </div>
            </CommandPaletteProvider>
          </RegionContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
