import type { Bet } from "@/lib/types";
import type { ResolvedMatch } from "./types";
import { betsForMatch } from "./coupling";
import type {
  MatchStatusFilter,
  TournamentFilterState,
} from "@/components/tournament/TournamentFilters";

export function applyMatchFilters(
  matches: ResolvedMatch[],
  filters: TournamentFilterState,
  bets: Bet[]
): ResolvedMatch[] {
  const q = filters.search.trim().toLowerCase();

  return matches.filter((m) => {
    if (filters.phase !== "all" && m.phase !== filters.phase) return false;

    if (filters.team) {
      if (m.home?.id !== filters.team && m.away?.id !== filters.team)
        return false;
    }

    if (filters.status !== "all") {
      if (!matchesStatus(m, filters.status, bets)) return false;
    }

    if (q) {
      const hay = `${m.home?.name ?? ""} ${m.away?.name ?? ""} ${
        m.stadium ?? ""
      } ${m.city ?? ""} ${m.group ? `groep ${m.group}` : ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

function matchesStatus(
  m: ResolvedMatch,
  status: MatchStatusFilter,
  bets: Bet[]
): boolean {
  switch (status) {
    case "scheduled":
      return m.status !== "finished";
    case "finished":
      return m.status === "finished";
    case "open-bets":
      return betsForMatch(bets, m.home, m.away).some((b) => b.status === "open");
    case "won-bets":
      return betsForMatch(bets, m.home, m.away).some((b) => b.status === "won");
    case "lost-bets":
      return betsForMatch(bets, m.home, m.away).some((b) => b.status === "lost");
    default:
      return true;
  }
}
