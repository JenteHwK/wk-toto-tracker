"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v ? `hsl(${v})` : fallback;
}

export interface ChartTheme {
  text: string;
  grid: string;
  won: string;
  lost: string;
  open: string;
  primary: string;
}

/** Reads palette from CSS variables and refreshes when the theme flips. */
export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  return React.useMemo<ChartTheme>(
    () => ({
      text: cssVar("--muted-foreground", "#94a3b8"),
      grid: cssVar("--border", "#1e293b"),
      won: cssVar("--won", "#22c55e"),
      lost: cssVar("--lost", "#ef4444"),
      open: cssVar("--open", "#f59e0b"),
      primary: cssVar("--primary", "#0ea5e9"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );
}

export function withAlpha(hsl: string, alpha: number): string {
  // hsl("hsl(150 70% 45%)") -> "hsl(150 70% 45% / a)"
  return hsl.replace(/^hsl\((.+)\)$/, `hsl($1 / ${alpha})`);
}
