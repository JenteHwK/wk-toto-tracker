import type { Bet, BetStatus } from "./types";

export interface MatchInput {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

export type SuggestedOutcome = "won" | "lost" | "unknown";

export interface BetSuggestion {
  bet: Bet;
  suggestion: SuggestedOutcome;
  reason: string;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function includesTeam(haystack: string, team: string): boolean {
  return normalize(haystack).includes(normalize(team));
}

function betMentionsTeam(bet: Bet, team: string): boolean {
  if (includesTeam(bet.selection, team)) return true;
  if (bet.matchLabel && includesTeam(bet.matchLabel, team)) return true;
  if (bet.market && includesTeam(bet.market, team)) return true;
  if (bet.legs?.some((l) => includesTeam(l.selection, team) || includesTeam(l.matchLabel ?? "", team))) return true;
  return false;
}

function betMentionsMatch(bet: Bet, home: string, away: string): boolean {
  return betMentionsTeam(bet, home) || betMentionsTeam(bet, away);
}

/** Try to derive a suggested outcome for a single bet based on the match result. */
function deriveSuggestion(
  bet: Bet,
  { homeTeam, awayTeam, homeGoals, awayGoals }: MatchInput
): { suggestion: SuggestedOutcome; reason: string } {
  const sel = normalize(bet.selection);
  const totalGoals = homeGoals + awayGoals;
  const winner = homeGoals > awayGoals ? homeTeam : awayGoals > homeGoals ? awayTeam : null;
  const isDraw = homeGoals === awayGoals;

  // "Team wint" / "Team wins"
  if (sel.includes("wint") || sel.includes("wins")) {
    for (const team of [homeTeam, awayTeam]) {
      if (includesTeam(sel, team)) {
        if (winner && normalize(winner) === normalize(team)) {
          return { suggestion: "won", reason: `${team} heeft gewonnen (${homeGoals}–${awayGoals})` };
        }
        return { suggestion: "lost", reason: `${team} heeft niet gewonnen (${homeGoals}–${awayGoals})` };
      }
    }
  }

  // Gelijkspel
  if (sel.includes("gelijkspel") || sel.includes("draw") || sel.includes("x")) {
    return isDraw
      ? { suggestion: "won", reason: `Gelijkspel (${homeGoals}–${awayGoals})` }
      : { suggestion: "lost", reason: `Geen gelijkspel (${homeGoals}–${awayGoals})` };
  }

  // Over/Under doelpunten (bijv. "meer dan 2.5 doelpunten" / "over 2.5")
  const overMatch = sel.match(/(?:meer dan|over)\s+([\d.]+)\s*(?:doelpunten|goals?)?/);
  if (overMatch) {
    const threshold = parseFloat(overMatch[1]);
    return totalGoals > threshold
      ? { suggestion: "won", reason: `${totalGoals} doelpunten > ${threshold}` }
      : { suggestion: "lost", reason: `${totalGoals} doelpunten ≤ ${threshold}` };
  }
  const underMatch = sel.match(/(?:minder dan|under)\s+([\d.]+)\s*(?:doelpunten|goals?)?/);
  if (underMatch) {
    const threshold = parseFloat(underMatch[1]);
    return totalGoals < threshold
      ? { suggestion: "won", reason: `${totalGoals} doelpunten < ${threshold}` }
      : { suggestion: "lost", reason: `${totalGoals} doelpunten ≥ ${threshold}` };
  }

  // Beide teams scoren (BTTS)
  if (sel.includes("beide teams scoren") || sel.includes("btts") || sel.includes("both teams")) {
    const btts = homeGoals > 0 && awayGoals > 0;
    return btts
      ? { suggestion: "won", reason: `Beide teams scoorden (${homeGoals}–${awayGoals})` }
      : { suggestion: "lost", reason: `Niet beide teams scoorden (${homeGoals}–${awayGoals})` };
  }

  // Leg matching (combi)
  if (bet.type === "combi" && bet.legs) {
    const leg = bet.legs.find(
      (l) =>
        (l.matchLabel && (includesTeam(l.matchLabel, homeTeam) || includesTeam(l.matchLabel, awayTeam)))
    );
    if (leg) {
      const legSel = normalize(leg.selection);
      if (legSel.includes("wint") || legSel === normalize(homeTeam) || legSel === normalize(awayTeam)) {
        for (const team of [homeTeam, awayTeam]) {
          if (normalize(leg.selection) === normalize(team) || includesTeam(legSel, team)) {
            if (winner && normalize(winner) === normalize(team)) {
              return { suggestion: "won", reason: `Leg '${leg.selection}' klopt (${homeGoals}–${awayGoals})` };
            }
            return { suggestion: "lost", reason: `Leg '${leg.selection}' klopt niet (${homeGoals}–${awayGoals})` };
          }
        }
      }
    }
    return { suggestion: "unknown", reason: "Controleer de legs handmatig" };
  }

  return { suggestion: "unknown", reason: "Kan niet automatisch bepalen — stel handmatig in" };
}

/**
 * Finds all open bets that reference the given teams, and derives a suggested
 * won/lost outcome where possible.
 */
export function findAffectedBets(bets: Bet[], input: MatchInput): BetSuggestion[] {
  const open = bets.filter((b) => b.status === "open");
  const matched = open.filter((b) =>
    betMentionsMatch(b, input.homeTeam, input.awayTeam)
  );

  return matched.map((bet) => {
    const { suggestion, reason } = deriveSuggestion(bet, input);
    return { bet, suggestion, reason };
  });
}
