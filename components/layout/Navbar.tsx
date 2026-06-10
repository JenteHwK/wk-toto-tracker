"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/beheer", label: "Beheer", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl gradient-orange text-white shadow-lg shadow-primary/40">
            <span className="text-base">⚽</span>
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            WK <span className="text-gradient-orange">Toto</span>
          </span>
        </Link>

        {/* Desktop pill nav */}
        <nav className="hidden items-center gap-1 rounded-2xl border border-border bg-surface/50 p-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-xl gradient-orange shadow-md shadow-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={16}
                  className={cn(
                    "relative z-10",
                    active ? "text-white" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "relative z-10",
                    active ? "text-white" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleTheme}
          aria-label="Wissel thema"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/50 text-muted-foreground transition-colors hover:text-foreground"
        >
          {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
