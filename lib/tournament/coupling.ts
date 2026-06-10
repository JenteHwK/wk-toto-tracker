import type { Bet } from "@/lib/types";
import { betResult } from "@/lib/calculations";
import type { ResolvedMatch, TournamentTeam } from "./types";

function norm(s: string): string {
  return s.toLowerCase().trim();
}

function mentions(text: string | undefined, name: string): boolean {
  if (!text) return false;
  return norm(text).includes(norm(name));
}

function betLabels(bet: Bet): string[] {
  const labels = [bet.matchLabel, bet.selection];
  bet.legs?.forEach((l) => labels.push(l.matchLabel, l.selection));
  return labels.filter(Boolean) as string[];
}

/** Bets tied to a specific match (a label references both teams). */
export function betsForMatch(
  bets: Bet[],
  home?: TournamentTeam,
  away?: TournamentTeam
): Bet[] {
  if (!home || !away) return [];
  return bets.filter((bet) => {
    const labels = betLabels(bet);
    const hasMatchLabel =
      mentions(bet.matchLabel, home.name) && mentions(bet.matchLabel, away.name);
    const legHasBoth = bet.legs?.some(
      (l) => mentions(l.matchLabel, home.name) && mentions(l.matchLabel, away.name)
    );
    // A combined label that names both teams, or a leg naming both.
    return (
      hasMatchLabel ||
      legHasBoth ||
      labels.some((l) => mentions(l, home.name) && mentions(l, away.name))
    );
  });
}

export interface FollowedTeam {
  team: TournamentTeam;
  betCount: number;
  totalStake: number;
  netResult: number;
  nextMatch?: ResolvedMatch;
}

/** Teams the user has any bet on, with aggregated stats + next fixture. */
export function buildTeamTracker(
  bets: Bet[],
  teams: TournamentTeam[],
  matches: ResolvedMatch[]
): FollowedTeam[] {
  const followed: FollowedTeam[] = [];

  for (const team of teams) {
    const teamBets = bets.filter((bet) =>
      betLabels(bet).some((l) => mentions(l, team.name))
    );
    if (teamBets.length === 0) continue;

    const totalStake = teamBets.reduce((s, b) => s + b.stake, 0);
    const netResult = teamBets.reduce((s, b) => s + betResult(b), 0);

    const nextMatch = matches
      .filter(
        (m) =>
          m.status !== "finished" &&
          m.date &&
          (m.home?.id === team.id || m.away?.id === team.id)
      )
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0];

    followed.push({
      team,
      betCount: teamBets.length,
      totalStake,
      netResult,
      nextMatch,
    });
  }

  return followed;
}
