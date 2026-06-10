"use client";

import * as React from "react";
import {
  CalendarDays,
  Coins,
  TrendingUp,
  Layers,
  Pencil,
  Trash2,
  Wallet,
  Sparkles,
} from "lucide-react";
import type { Bet } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { betProfit, betReturn, betResult } from "@/lib/calculations";
import {
  formatDate,
  formatTime,
  formatEuro,
  formatEuroSigned,
  formatOdds,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useBetStore } from "@/store/useBetStore";
import { useToastStore } from "@/store/useToastStore";
import { StatusBadge, STATUS_META } from "./StatusBadge";
import { Badge } from "@/components/ui/Badge";

const accentByStatus: Record<Bet["status"], string> = {
  open: "before:bg-open",
  won: "before:bg-won",
  lost: "before:bg-lost",
};

interface BetCardProps {
  bet: Bet;
  onEdit?: (bet: Bet) => void;
  onDelete?: (bet: Bet) => void;
}

export function BetCard({ bet, onEdit, onDelete }: BetCardProps) {
  const setStatus = useBetStore((s) => s.setStatus);
  const toast = useToastStore((s) => s.toast);

  const profit = betProfit(bet);
  const payout = betReturn(bet);
  const result = betResult(bet);

  const handleStatus = (status: Bet["status"]) => {
    if (status === bet.status) return;
    setStatus(bet.id, status);
    toast({
      title: `Status: ${STATUS_META[status].label}`,
      description: `${bet.selection} — ${
        status === "won"
          ? formatEuroSigned(profit)
          : status === "lost"
            ? formatEuroSigned(-bet.stake)
            : "terug naar open"
      }`,
      variant:
        status === "won" ? "success" : status === "lost" ? "error" : "info",
    });
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 hover:border-primary/30",
        "before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:content-['']",
        accentByStatus[bet.status]
      )}
    >
      <div className="pl-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                {bet.type === "combi" ? (
                  <Layers size={12} />
                ) : bet.isBoost ? (
                  <Sparkles size={12} />
                ) : null}
                {CATEGORY_LABELS[bet.category]}
              </Badge>
              <Badge className="text-muted-foreground">{bet.phase}</Badge>
              {bet.isBoost && (
                <Badge className="border-open/30 bg-open/10 text-open">
                  Boost
                </Badge>
              )}
            </div>
            <h3 className="truncate text-base font-semibold leading-tight">
              {bet.selection}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {bet.market}
            </p>
            {bet.matchLabel && bet.type !== "combi" && (
              <p className="mt-0.5 text-xs font-medium text-foreground/70">
                {bet.matchLabel}
              </p>
            )}
          </div>
          <StatusBadge status={bet.status} />
        </div>

        {/* Combi legs */}
        {bet.type === "combi" && bet.legs && bet.legs.length > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl border border-dashed border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {bet.legs.length}-voudige combi · alle selecties moeten winnen
            </p>
            {bet.legs.map((leg) => (
              <div
                key={leg.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium">{leg.selection}</span>
                  {leg.matchLabel && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {leg.matchLabel}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {formatOdds(leg.odds)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Figures */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <Figure
            icon={<TrendingUp size={14} />}
            label="Odds"
            value={formatOdds(bet.odds)}
          />
          <Figure
            icon={<Coins size={14} />}
            label="Inzet"
            value={formatEuro(bet.stake)}
          />
          <Figure
            icon={<Wallet size={14} />}
            label="Mog. uitbetaling"
            value={formatEuro(payout)}
          />
          <Figure
            icon={<TrendingUp size={14} />}
            label={bet.status === "open" ? "Mog. winst" : "Resultaat"}
            value={
              bet.status === "open"
                ? formatEuroSigned(profit)
                : formatEuroSigned(result)
            }
            valueClassName={
              bet.status === "won"
                ? "text-won"
                : bet.status === "lost"
                  ? "text-lost"
                  : "text-open"
            }
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} />
              {formatDate(bet.date)}
              {formatTime(bet.date) && ` · ${formatTime(bet.date)}`}
            </span>
            {bet.cashout != null && bet.status === "open" && (
              <span className="hidden items-center gap-1 sm:flex">
                · Cashout {formatEuro(bet.cashout)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick status toggles */}
            <div className="flex overflow-hidden rounded-lg border border-border">
              {(["open", "won", "lost"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  title={STATUS_META[s].label}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    bet.status === s
                      ? cn(STATUS_META[s].chip, "border-0")
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
    </div>
  );
}

function Figure({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={cn("mt-0.5 font-semibold tabular-nums", valueClassName)}>
        {value}
      </p>
    </div>
  );
}
