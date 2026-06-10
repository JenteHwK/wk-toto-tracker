"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CalendarClock,
  ListChecks,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Scale,
} from "lucide-react";
import type { ProgressionStats as Progression } from "@/lib/tournament/types";
import type { BetStats } from "@/lib/types";
import { formatEuro, formatEuroSigned } from "@/lib/format";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export function ProgressionStats({
  progression,
  betStats,
}: {
  progression: Progression;
  betStats: BetStats;
}) {
  const tiles: {
    label: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    tone: string;
  }[] = [
    {
      label: "Wedstrijden",
      value: <AnimatedCounter value={progression.totalMatches} />,
      icon: <ListChecks size={16} />,
      tone: "text-primary",
    },
    {
      label: "Gespeeld",
      value: <AnimatedCounter value={progression.playedMatches} />,
      icon: <CalendarCheck size={16} />,
      tone: "text-won",
    },
    {
      label: "Te spelen",
      value: <AnimatedCounter value={progression.remainingMatches} />,
      icon: <CalendarClock size={16} />,
      tone: "text-open",
    },
    {
      label: "Open bets",
      value: <AnimatedCounter value={betStats.open} />,
      icon: <Clock size={16} />,
      tone: "text-open",
    },
    {
      label: "Gewonnen",
      value: <AnimatedCounter value={betStats.won} />,
      icon: <CheckCircle2 size={16} />,
      tone: "text-won",
    },
    {
      label: "Verloren",
      value: <AnimatedCounter value={betStats.lost} />,
      icon: <XCircle size={16} />,
      tone: "text-lost",
    },
    {
      label: "Totale winst",
      value: <AnimatedCounter value={betStats.totalProfit} format={formatEuro} />,
      icon: <TrendingUp size={16} />,
      tone: "text-won",
    },
    {
      label: "Netto",
      value: (
        <AnimatedCounter value={betStats.net} format={formatEuroSigned} />
      ),
      icon: <Scale size={16} />,
      tone:
        betStats.net > 0 ? "text-won" : betStats.net < 0 ? "text-lost" : "",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {tiles.map((t) => (
        <motion.div
          key={t.label}
          variants={item}
          className="rounded-2xl glass p-4 shadow-card transition-transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-2">
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-surface/70", t.tone)}>
              {t.icon}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {t.label}
            </span>
          </div>
          <p className={cn("mt-2 font-display text-2xl font-extrabold tabular-nums", t.tone)}>
            {t.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
