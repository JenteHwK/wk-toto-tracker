"use client";

import * as React from "react";
import { Target } from "lucide-react";
import type { ResolvedMatch } from "@/lib/tournament/types";
import { betsForMatch } from "@/lib/tournament/coupling";
import { useBetStore } from "@/store/useBetStore";
import { betProfit, betResult } from "@/lib/calculations";
import { formatEuro, formatEuroSigned, formatOdds } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/bets/StatusBadge";

export function MatchBetsModal({
  match,
  onClose,
}: {
  match: ResolvedMatch | null;
  onClose: () => void;
}) {
  const bets = useBetStore((s) => s.bets);
  const coupled = React.useMemo(
    () => (match ? betsForMatch(bets, match.home, match.away) : []),
    [bets, match]
  );

  if (!match) return null;

  return (
    <Modal
      open={!!match}
      onClose={onClose}
      title={`${match.home?.name ?? "?"} v ${match.away?.name ?? "?"}`}
      description={`${coupled.length} gekoppelde bet${coupled.length !== 1 ? "s" : ""}`}
      className="max-w-lg"
    >
      <div className="space-y-2">
        {coupled.map((bet) => {
          const open = bet.status === "open";
          return (
            <div
              key={bet.id}
              className="rounded-2xl border border-border bg-surface/40 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-display text-sm font-bold">
                    <Target size={13} className="text-gold" />
                    {bet.selection}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {bet.market}
                  </p>
                </div>
                <StatusBadge status={bet.status} variant="solid" />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <Cell label="Odds" value={formatOdds(bet.odds)} />
                <Cell label="Inzet" value={formatEuro(bet.stake)} />
                <Cell label="Mog. winst" value={formatEuro(betProfit(bet))} />
                <Cell
                  label={open ? "Status" : "Resultaat"}
                  value={open ? "Open" : formatEuroSigned(betResult(bet))}
                  tone={
                    bet.status === "won"
                      ? "text-won"
                      : bet.status === "lost"
                        ? "text-lost"
                        : "text-open"
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl bg-background/40 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-bold tabular-nums ${tone ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
