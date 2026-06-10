"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { Trophy, Flame, Target, TrendingUp, Sparkles } from "lucide-react";
import type { BetStats } from "@/lib/types";
import { formatEuro, formatPercent } from "@/lib/format";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

function getRank(stats: BetStats): {
  label: string;
  emoji: string;
  tone: string;
} {
  if (stats.total === 0)
    return { label: "Rookie", emoji: "🎟️", tone: "text-muted-foreground" };
  if (stats.net > 50) return { label: "Legende", emoji: "🏆", tone: "text-gold" };
  if (stats.net > 0) return { label: "In de plus", emoji: "📈", tone: "text-won" };
  if (stats.net === 0 && stats.open > 0)
    return { label: "In afwachting", emoji: "⏳", tone: "text-open" };
  return { label: "De jacht is open", emoji: "🎯", tone: "text-primary" };
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: EASE },
  }),
};

export function Hero({ stats }: { stats: BetStats }) {
  const rank = getRank(stats);
  const netPositive = stats.net >= 0;

  return (
    <section className="relative overflow-hidden rounded-3xl glass noise shadow-card">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-24 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-[100px]" />
        <div className="animate-blob absolute -right-16 top-0 h-72 w-72 rounded-full bg-gold/20 blur-[90px] [animation-delay:4s]" />
        <div className="absolute inset-x-0 -bottom-40 h-72 bg-gradient-to-t from-primary/10 to-transparent blur-2xl" />
      </div>

      <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        {/* Left: identity */}
        <div>
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          >
            <Sparkles size={13} /> WK 2026 · Toto Tracker
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 text-4xl font-extrabold leading-[0.95] sm:text-5xl lg:text-6xl"
          >
            <span className="text-gradient-orange">Jouw WK</span>
            <br />
            weddenschappen.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base"
          >
            Eén overzicht voor al je bets, je vorm en je rendement — live
            bijgewerkt terwijl het toernooi zich ontvouwt.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-sm font-bold",
                rank.tone
              )}
            >
              <span className="text-base">{rank.emoji}</span> {rank.label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-sm text-muted-foreground">
              <Target size={15} className="text-primary" />
              {stats.open} open · {formatEuro(stats.openStake)} in spel
            </span>
          </motion.div>
        </div>

        {/* Right: hero profit card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
          className={cn(
            "relative overflow-hidden rounded-3xl border p-6",
            netPositive
              ? "border-gold/25 bg-gradient-to-br from-gold/10 via-card to-card glow-gold"
              : "border-lost/25 bg-gradient-to-br from-lost/10 via-card to-card"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Netto resultaat
            </span>
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                netPositive ? "gradient-gold text-black" : "gradient-lost text-white"
              )}
            >
              {netPositive ? <Trophy size={16} /> : <Target size={16} />}
            </span>
          </div>

          <div
            className={cn(
              "mt-3 font-display text-5xl font-extrabold tabular-nums sm:text-6xl",
              netPositive ? "text-gold" : "text-lost"
            )}
          >
            <AnimatedCounter
              value={stats.net}
              format={(n) => `${n >= 0 ? "+" : "−"}${formatEuro(Math.abs(n))}`}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame size={12} className="text-won" /> Gewonnen
              </p>
              <p className="mt-0.5 text-xl font-bold text-won tabular-nums">
                <AnimatedCounter value={stats.won} />
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp size={12} className="text-primary" /> ROI
              </p>
              <p
                className={cn(
                  "mt-0.5 text-xl font-bold tabular-nums",
                  stats.roi >= 0 ? "text-won" : "text-lost"
                )}
              >
                <AnimatedCounter
                  value={stats.roi}
                  format={(n) => formatPercent(n)}
                />
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
