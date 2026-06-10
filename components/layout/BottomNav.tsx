"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, Settings, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/toernooi", label: "Toernooi", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/beheer", label: "Beheer", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <div className="mx-auto flex max-w-sm items-center justify-around rounded-2xl glass-strong p-1.5 shadow-card">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2"
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute inset-0 rounded-xl gradient-orange shadow-lg shadow-primary/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={cn(
                  "relative z-10 transition-colors",
                  active ? "text-white" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "relative z-10 text-[10px] font-semibold transition-colors",
                  active ? "text-white" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
