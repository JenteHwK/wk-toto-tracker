"use client";

import * as React from "react";
import { LineChart, PieChart, BarChart3, Layers3 } from "lucide-react";
import { useBetStore } from "@/store/useBetStore";
import { computeStats, betResult } from "@/lib/calculations";
import { CATEGORY_LABELS, type BetCategory } from "@/lib/types";
import { formatEuro, formatEuroSigned, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProfitChart, ResultPie, StakeBar } from "@/components/analytics/Charts";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const bets = useBetStore((s) => s.bets);
  const hasHydrated = useBetStore((s) => s.hasHydrated);
  const stats = React.useMemo(() => computeStats(bets), [bets]);

  const byCategory = React.useMemo(() => {
    const map = new Map<
      BetCategory,
      { staked: number; net: number; count: number }
    >();
    for (const b of bets) {
      const e = map.get(b.category) ?? { staked: 0, net: 0, count: 0 };
      e.staked += b.stake;
      e.net += betResult(b);
      e.count += 1;
      map.set(b.category, e);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].staked - a[1].staked);
  }, [bets]);

  if (!hasHydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary">
          <BarChart3 size={16} /> Analytics
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Inzichten & grafieken
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Volg je winstontwikkeling, resultaatverdeling en inzetgedrag.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <LineChart size={18} className="text-primary" />
            <CardTitle>Winstontwikkeling (netto, cumulatief)</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitChart bets={bets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <PieChart size={18} className="text-primary" />
            <CardTitle>Resultaten</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultPie won={stats.won} lost={stats.lost} open={stats.open} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            <CardTitle>Inzet per dag</CardTitle>
          </CardHeader>
          <CardContent>
            <StakeBar bets={bets} />
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Layers3 size={18} className="text-primary" />
          <CardTitle>Per categorie</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Categorie</th>
                <th className="pb-2 pr-4 text-right font-medium">Aantal</th>
                <th className="pb-2 pr-4 text-right font-medium">Ingezet</th>
                <th className="pb-2 text-right font-medium">Netto</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map(([cat, e]) => (
                <tr key={cat} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 font-medium">
                    {CATEGORY_LABELS[cat]}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {e.count}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">
                    {formatEuro(e.staked)}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 text-right font-semibold tabular-nums",
                      e.net > 0 ? "text-won" : e.net < 0 ? "text-lost" : ""
                    )}
                  >
                    {formatEuroSigned(e.net)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="pt-3 pr-4">Totaal</td>
                <td className="pt-3 pr-4 text-right tabular-nums">
                  {stats.total}
                </td>
                <td className="pt-3 pr-4 text-right tabular-nums">
                  {formatEuro(stats.totalStake)}
                </td>
                <td
                  className={cn(
                    "pt-3 text-right tabular-nums",
                    stats.net > 0 ? "text-won" : stats.net < 0 ? "text-lost" : ""
                  )}
                >
                  {formatEuroSigned(stats.net)}
                </td>
              </tr>
            </tfoot>
          </table>
          <p className="mt-4 text-xs text-muted-foreground">
            ROI: {formatPercent(stats.roi)} · Winstpercentage:{" "}
            {formatPercent(stats.winRate)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
