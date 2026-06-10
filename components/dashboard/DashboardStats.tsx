"use client";

import {
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  TrendingUp,
  TrendingDown,
  Scale,
  Percent,
  Wallet,
} from "lucide-react";
import type { BetStats } from "@/lib/types";
import {
  formatEuro,
  formatEuroSigned,
  formatPercent,
} from "@/lib/format";
import { StatCard } from "./StatCard";
import { cn } from "@/lib/utils";

export function DashboardStats({ stats }: { stats: BetStats }) {
  const netAccent = stats.net > 0 ? "won" : stats.net < 0 ? "lost" : "neutral";
  const netColor =
    stats.net > 0 ? "text-won" : stats.net < 0 ? "text-lost" : "";

  return (
    <div className="space-y-4">
      {/* Count row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Totaal bets"
          value={String(stats.total)}
          icon={<Ticket size={18} />}
          accent="primary"
          hint={`${formatEuro(stats.totalStake)} totaal ingezet`}
        />
        <StatCard
          label="Gewonnen"
          value={String(stats.won)}
          icon={<CheckCircle2 size={18} />}
          accent="won"
          hint={`${formatEuro(stats.totalProfit)} winst`}
        />
        <StatCard
          label="Verloren"
          value={String(stats.lost)}
          icon={<XCircle size={18} />}
          accent="lost"
          hint={`${formatEuro(stats.totalLoss)} verlies`}
        />
        <StatCard
          label="Openstaand"
          value={String(stats.open)}
          icon={<Clock size={18} />}
          accent="open"
          hint={`${formatEuro(stats.openStake)} in spel`}
        />
      </div>

      {/* Money row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Totale inzet"
          value={formatEuro(stats.totalStake)}
          icon={<Coins size={18} />}
          accent="primary"
        />
        <StatCard
          label="Totale winst"
          value={formatEuro(stats.totalProfit)}
          icon={<TrendingUp size={18} />}
          accent="won"
          valueClassName="text-won"
        />
        <StatCard
          label="Totaal verlies"
          value={formatEuro(stats.totalLoss)}
          icon={<TrendingDown size={18} />}
          accent="lost"
          valueClassName="text-lost"
        />
        <StatCard
          label="Netto resultaat"
          value={formatEuroSigned(stats.net)}
          icon={<Scale size={18} />}
          accent={netAccent}
          valueClassName={netColor}
        />
        <StatCard
          label="ROI"
          value={formatPercent(stats.roi)}
          icon={<Percent size={18} />}
          accent={netAccent}
          valueClassName={netColor}
          hint="Rendement op inzet"
        />
        <StatCard
          label="Winstpercentage"
          value={formatPercent(stats.winRate)}
          icon={<Wallet size={18} />}
          accent="primary"
          hint={`${stats.won}/${stats.won + stats.lost} beslist`}
        />
      </div>

      {/* Potential banner */}
      {stats.open > 0 && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-open/30 bg-open/5 px-5 py-4"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-open/15 text-open">
              <Clock size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold">
                Nog {stats.open} openstaande bets
              </p>
              <p className="text-xs text-muted-foreground">
                {formatEuro(stats.openStake)} ingezet en in afwachting
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Mogelijke extra winst
            </p>
            <p className="text-xl font-bold text-won">
              {formatEuroSigned(stats.potentialOpenProfit)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
