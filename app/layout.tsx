import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  themeInitScript,
} from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WK Toto Tracker — Beheer je WK 2026 weddenschappen",
  description:
    "Een premium WK 2026 Toto Tracker: volg je bets, winst/verlies, ROI en analytics in een strak, sportief dashboard.",
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning className={`${inter.variable} ${sora.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen scrollbar-thin">
        {/* Ambient background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden noise">
          <div className="absolute left-1/2 top-[-10%] h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-primary/12 blur-[140px]" />
          <div className="animate-blob absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-gold/8 blur-[120px]" />
          <div className="animate-blob absolute bottom-[-10%] left-[-5%] h-96 w-96 rounded-full bg-primary/8 blur-[130px] [animation-delay:6s]" />
        </div>

        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:py-8 md:pb-8">
              {children}
            </main>
            <footer className="hidden border-t border-border py-6 text-center text-xs text-muted-foreground md:block">
              WK Toto Tracker · Lokale opslag · Wed met mate · {new Date().getFullYear()}
            </footer>
          </div>
          <BottomNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
