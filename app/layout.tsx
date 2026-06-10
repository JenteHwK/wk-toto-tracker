import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "WK Toto Tracker — Beheer je WK 2026 weddenschappen",
  description:
    "Persoonlijke WK 2026 Toto Tracker: volg je bets, winst/verlies, ROI en analytics in een strak dashboard.",
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen scrollbar-thin antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
              {children}
            </main>
            <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
              WK Toto Tracker · Lokale opslag · {new Date().getFullYear()}
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
