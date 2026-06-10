import type { Bet } from "./types";
import { betResult, round2 } from "./calculations";
import { formatDateKey } from "./format";

export interface TimePoint {
  date: string; // YYYY-MM-DD
  value: number;
}

/** Cumulative net result over time, ordered by settlement date. */
export function cumulativeProfit(bets: Bet[]): TimePoint[] {
  const settled = bets
    .filter((b) => b.status !== "open" && b.date)
    .sort(
      (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
    );

  const points: TimePoint[] = [];
  let running = 0;
  // Group by day so multiple settlements on one date collapse to one point.
  const byDay = new Map<string, number>();
  for (const bet of settled) {
    const key = formatDateKey(bet.date);
    byDay.set(key, (byDay.get(key) ?? 0) + betResult(bet));
  }
  for (const [date, delta] of Array.from(byDay.entries()).sort()) {
    running = round2(running + delta);
    points.push({ date, value: running });
  }
  return points;
}

/** Total stake placed per day (by bet date). */
export function stakePerDay(bets: Bet[]): TimePoint[] {
  const byDay = new Map<string, number>();
  for (const bet of bets) {
    if (!bet.date) continue;
    const key = formatDateKey(bet.date);
    byDay.set(key, round2((byDay.get(key) ?? 0) + bet.stake));
  }
  return Array.from(byDay.entries())
    .sort()
    .map(([date, value]) => ({ date, value }));
}

export interface CategoryBreakdown {
  category: string;
  staked: number;
  net: number;
  count: number;
}
