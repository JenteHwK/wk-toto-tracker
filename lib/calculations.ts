import type { Bet, BetStats } from "./types";

/** Total payout if the bet wins (stake included). */
export function betReturn(bet: Bet): number {
  return round2(bet.stake * bet.odds);
}

/** Net profit if the bet wins (payout minus stake). */
export function betProfit(bet: Bet): number {
  return round2(bet.stake * bet.odds - bet.stake);
}

/** Realised profit/loss for a settled bet (0 while open). */
export function betResult(bet: Bet): number {
  if (bet.status === "won") return betProfit(bet);
  if (bet.status === "lost") return -bet.stake;
  return 0;
}

export function computeStats(bets: Bet[]): BetStats {
  const stats: BetStats = {
    total: bets.length,
    won: 0,
    lost: 0,
    open: 0,
    totalStake: 0,
    totalProfit: 0,
    totalLoss: 0,
    net: 0,
    roi: 0,
    winRate: 0,
    openStake: 0,
    potentialOpenProfit: 0,
  };

  for (const bet of bets) {
    stats.totalStake += bet.stake;
    switch (bet.status) {
      case "won":
        stats.won += 1;
        stats.totalProfit += betProfit(bet);
        break;
      case "lost":
        stats.lost += 1;
        stats.totalLoss += bet.stake;
        break;
      default:
        stats.open += 1;
        stats.openStake += bet.stake;
        stats.potentialOpenProfit += betProfit(bet);
    }
  }

  stats.totalStake = round2(stats.totalStake);
  stats.totalProfit = round2(stats.totalProfit);
  stats.totalLoss = round2(stats.totalLoss);
  stats.openStake = round2(stats.openStake);
  stats.potentialOpenProfit = round2(stats.potentialOpenProfit);
  stats.net = round2(stats.totalProfit - stats.totalLoss);

  const settled = stats.won + stats.lost;
  stats.winRate = settled > 0 ? round2((stats.won / settled) * 100) : 0;
  stats.roi =
    stats.totalStake > 0 ? round2((stats.net / stats.totalStake) * 100) : 0;

  return stats;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
