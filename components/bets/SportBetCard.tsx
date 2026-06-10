"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Pencil,
  Trash2,
  Layers,
  Sparkles,
  Trophy,
  Crown,
  Target,
  Goal,
  Wallet,
} from "lucide-react";
import type { Bet, BetStatus, BetCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { betProfit, betReturn, betResult } from "@/lib/calculations";
import {
  formatDate,
  formatTime,
  formatEuro,
  formatEuroSigned,
  formatOdds,
} from "@/lib/format";
import { getFlag, splitMatchup } from "@/lib/teams";
import { cn } from "@/lib/utils";
import { useBetStore } from "@/store/useBetStore";
import { useToastStore } from "@/store/useToastStore";
import { fireWinConfetti } from "@/lib/confetti";
import { EASE } from "@/lib/motion";
import { StatusBadge, STATUS_META } from "./StatusBadge";

const CATEGORY_ICON: Record<BetCategory, React.ReactNode> = {
  winner: <Crown size={13} />,
  topscorer: <Goal size={13} />,
  group: <Target size={13} />,
  exact: <Trophy size={13} />,
  special: <Sparkles size={13} />,
  match: <Goal size={13} />,
  combi: <Layers size={13} />,
};

const accentBar: Record<BetStatus, string> = {
  open: "from-primary via-gold to-primary",
  won: "from-won to-emerald-400",
  lost: "from-lost to-rose-400",
};

interface Props {
  bet: Bet;
  onEdit?: (bet: Bet) => void;
  onDelete?: (bet: Bet) => void;
}

export function SportBetCard({ bet, onEdit, onDelete }: Props) {
  const setStatus = useBetStore((s) => s.setStatus);
  const toast = useToastStore((s) => s.toast);

  const profit = betProfit(bet);
  const payout = betReturn(bet);
  const result = betResult(bet);

  const matchup =
    splitMatchup(bet.matchLabel) ??
    (bet.category === "group" || bet.category === "exact"
      ? splitMatchup(bet.selection)
      : null);
  const singleFlag = !matchup ? getFlag(bet.selection) : null;

  const handleStatus = (status: BetStatus) => {
    if (status === bet.status) return;
    setStatus(bet.id, status);
    if (status === "won") fireWinConfetti();
    toast({
      title: `${STATUS_META[status].label}`,
      description: `${bet.selection} — ${
        status === "won"
          ? formatEuroSigned(profit)
          : status === "lost"
            ? formatEuroSigned(-bet.stake)
            : "terug naar open"
      }`,
      variant: status === "won" ? "success" : status === "lost" ? "error" : "info",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-3xl glass shadow-card transition-colors duration-300 hover:border-primary/40"
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80",
          accentBar[bet.status]
        )}
      />
      {/* Hover glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {CATEGORY_ICON[bet.category]}
              {CATEGORY_LABELS[bet.category]}
            </span>
            <span className="rounded-full border border-border bg-surface/60 px-2.5 py-0.5 text-xs text-muted-foreground">
              {bet.phase}
            </span>
            {bet.isBoost && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
                <Sparkles size={11} /> Boost
              </span>
            )}
          </div>
          <StatusBadge status={bet.status} variant="solid" />
        </div>

        {/* Match / selection display */}
        {matchup ? (
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TeamBlock name={matchup[0]} align="left" />
            <div className="flex flex-col items-center px-1">
              <span className="font-display text-xs font-black text-muted-foreground">
                VS
              </span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {bet.category === "group" ? "Top-2" : "Uitslag"}
              </span>
            </div>
            <TeamBlock name={matchup[1]} align="right" />
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            {singleFlag ? (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface/70 text-2xl">
                {singleFlag}
              </span>
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-orange text-white">
                {CATEGORY_ICON[bet.category]}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-bold leading-tight">
                {bet.selection}
              </h3>
              <p className="truncate text-sm text-muted-foreground">{bet.market}</p>
            </div>
          </div>
        )}

        {matchup && (
          <p className="mt-3 rounded-xl border border-border bg-surface/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Voorspelling: </span>
            <span className="font-semibold">{bet.market}</span>
          </p>
        )}

        {/* Combi legs ticket */}
        {bet.type === "combi" && bet.legs && bet.legs.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-border bg-surface/40">
            <div className="flex items-center justify-between border-b border-border/60 bg-gold/5 px-3 py-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gold">
                <Layers size={12} /> {bet.legs.length}-voudige combi
              </span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                alle legs moeten winnen
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {bet.legs.map((leg) => {
                const lm = splitMatchup(leg.matchLabel);
                return (
                  <div
                    key={leg.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-base">
                        {getFlag(leg.selection) ?? "⚽"}
                      </span>
                      <span className="min-w-0">
                        <span className="font-medium">{leg.selection}</span>
                        {lm && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {lm[0]} v {lm[1]}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-md bg-surface/80 px-2 py-0.5 font-mono text-xs font-semibold">
                      {formatOdds(leg.odds)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Figures */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Figure label="Odds" value={formatOdds(bet.odds)} accent />
          <Figure label="Inzet" value={formatEuro(bet.stake)} />
          <Figure label="Uitbetaling" value={formatEuro(payout)} />
          <Figure
            label={bet.status === "open" ? "Mog. winst" : "Resultaat"}
            value={
              bet.status === "open"
                ? formatEuroSigned(profit)
                : formatEuroSigned(result)
            }
            valueClassName={STATUS_META[bet.status].text}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays size={13} />
            {formatDate(bet.date)}
            {formatTime(bet.date) && ` · ${formatTime(bet.date)}`}
            {bet.cashout != null && bet.status === "open" && (
              <span className="ml-1 hidden items-center gap-1 text-gold sm:inline-flex">
                · <Wallet size={11} /> {formatEuro(bet.cashout)}
              </span>
            )}
          </span>

          <div className="flex items-center gap-1.5">
            <div className="flex overflow-hidden rounded-xl border border-border">
              {(["open", "won", "lost"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  title={STATUS_META[s].label}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-bold transition-all",
                    bet.status === s
                      ? cn(STATUS_META[s].gradient, "scale-105")
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>

            {onEdit && (
              <button
                onClick={() => onEdit(bet)}
                aria-label="Bewerken"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil size={15} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(bet)}
                aria-label="Verwijderen"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-lost/10 hover:text-lost"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TeamBlock({ name, align }: { name: string; align: "left" | "right" }) {
  const flag = getFlag(name);
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right"
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface/70 text-2xl shadow-inner">
        {flag ?? "⚽"}
      </span>
      <span className="min-w-0 font-display text-sm font-bold leading-tight">
        {name}
      </span>
    </div>
  );
}

function Figure({
  label,
  value,
  accent,
  valueClassName,
}: {
  label: string;
  value: string;
  accent?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface/40 px-3 py-2",
        accent && "border-primary/20 bg-primary/5"
      )}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 font-display font-bold tabular-nums", valueClassName)}>
        {value}
      </p>
    </div>
  );
}
