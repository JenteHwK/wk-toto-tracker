"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { EASE } from "@/lib/motion";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Percent,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { BetStats } from "@/lib/types";
import { formatEuro, formatEuroSigned, formatPercent } from "@/lib/format";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";

const tile =
  "relative overflow-hidden rounded-3xl glass p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";

function WinRateRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(value, 100) / 100) * c;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(43 96% 56%)" />
            <stop offset="100%" stopColor="hsl(29 100% 50%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold">
          <AnimatedCounter value={value} format={(n) => `${Math.round(n)}%`} />
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          win-rate
        </span>
      </div>
    </div>
  );
}

export function BentoStats({ stats }: { stats: BetStats }) {
  const netColor = stats.net > 0 ? "text-won" : stats.net < 0 ? "text-lost" : "";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.06 } },
      }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {/* Featured win-rate tile */}
      <Item className="col-span-2 row-span-2 flex flex-col justify-between !p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Vorm & balans
            </p>
            <p className="mt-1 font-display text-lg font-bold">
              {stats.won}–{stats.lost}
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                W–V
              </span>
            </p>
          </div>
          <WinRateRing value={stats.winRate} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniChip
            icon={<CheckCircle2 size={13} />}
            label="Gewonnen"
            value={stats.won}
            tone="text-won"
          />
          <MiniChip
            icon={<XCircle size={13} />}
            label="Verloren"
            value={stats.lost}
            tone="text-lost"
          />
          <MiniChip
            icon={<Clock size={13} />}
            label="Open"
            value={stats.open}
            tone="text-open"
            pulse={stats.open > 0}
          />
        </div>
      </Item>

      <Item>
        <TileHead icon={<TrendingUp size={16} />} label="Totale winst" tone="won" />
        <p className="mt-2 font-display text-2xl font-bold text-won tabular-nums">
          <AnimatedCounter value={stats.totalProfit} format={formatEuro} />
        </p>
      </Item>

      <Item>
        <TileHead icon={<TrendingDown size={16} />} label="Totaal verlies" tone="lost" />
        <p className="mt-2 font-display text-2xl font-bold text-lost tabular-nums">
          <AnimatedCounter value={stats.totalLoss} format={formatEuro} />
        </p>
      </Item>

      <Item className="border-gold/20">
        <TileHead icon={<Percent size={16} />} label="Netto resultaat" tone="gold" />
        <p className={cn("mt-2 font-display text-2xl font-bold tabular-nums", netColor)}>
          <AnimatedCounter value={stats.net} format={formatEuroSigned} />
        </p>
      </Item>

      <Item>
        <TileHead icon={<Coins size={16} />} label="Totale inzet" tone="primary" />
        <p className="mt-2 font-display text-2xl font-bold tabular-nums">
          <AnimatedCounter value={stats.totalStake} format={formatEuro} />
        </p>
      </Item>

      {/* Wide tile: total bets + ROI */}
      <Item className="col-span-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-orange text-white shadow-lg shadow-primary/30">
            <Ticket size={18} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Totaal bets
            </p>
            <p className="font-display text-2xl font-extrabold tabular-nums">
              <AnimatedCounter value={stats.total} />
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            ROI
          </p>
          <p className={cn("font-display text-2xl font-extrabold tabular-nums", netColor)}>
            <AnimatedCounter value={stats.roi} format={formatPercent} />
          </p>
        </div>
      </Item>

      {/* Open in play banner */}
      {stats.open > 0 && (
        <Item className="col-span-2 flex items-center justify-between border-open/25 bg-gradient-to-r from-open/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="pulse-ring flex h-11 w-11 items-center justify-center rounded-2xl bg-open/15 text-open">
              <Clock size={18} />
            </span>
            <div>
              <p className="text-sm font-bold">{stats.open} bets in afwachting</p>
              <p className="text-xs text-muted-foreground">
                {formatEuro(stats.openStake)} ingezet
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Mogelijke winst
            </p>
            <p className="font-display text-xl font-bold text-gold tabular-nums">
              {formatEuroSigned(stats.potentialOpenProfit)}
            </p>
          </div>
        </Item>
      )}
    </motion.div>
  );
}

function Item({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
  };
  return (
    <motion.div variants={variants} className={cn(tile, className)}>
      {children}
    </motion.div>
  );
}

function TileHead({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "won" | "lost" | "gold" | "primary";
}) {
  const toneMap = {
    won: "bg-won/12 text-won",
    lost: "bg-lost/12 text-lost",
    gold: "bg-gold/12 text-gold",
    primary: "bg-primary/12 text-primary",
  };
  return (
    <div className="flex items-center gap-2">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", toneMap[tone])}>
        {icon}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function MiniChip({
  icon,
  label,
  value,
  tone,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface/50 p-3 text-center",
        pulse && "border-open/30"
      )}
    >
      <span className={cn("mx-auto flex w-fit items-center gap-1 text-xs", tone)}>
        {icon}
      </span>
      <p className={cn("mt-1 font-display text-xl font-bold tabular-nums", tone)}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
