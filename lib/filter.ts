import type { Bet, FilterState } from "./types";
import { betProfit } from "./calculations";

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "all",
  category: "all",
  phase: "all",
  team: "",
  sort: "date",
  sortDir: "asc",
};

export function applyFilters(bets: Bet[], f: FilterState): Bet[] {
  const q = f.search.trim().toLowerCase();
  const team = f.team.trim().toLowerCase();

  const filtered = bets.filter((b) => {
    if (f.status !== "all" && b.status !== f.status) return false;
    if (f.category !== "all" && b.category !== f.category) return false;
    if (f.phase !== "all" && b.phase !== f.phase) return false;

    if (team) {
      const haystackTeam = `${b.selection} ${b.matchLabel ?? ""} ${
        b.legs?.map((l) => `${l.selection} ${l.matchLabel ?? ""}`).join(" ") ?? ""
      }`.toLowerCase();
      if (!haystackTeam.includes(team)) return false;
    }

    if (q) {
      const haystack = `${b.selection} ${b.market} ${b.event ?? ""} ${
        b.matchLabel ?? ""
      } ${b.category} ${b.phase} ${
        b.legs?.map((l) => `${l.selection} ${l.matchLabel ?? ""}`).join(" ") ?? ""
      }`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const dir = f.sortDir === "asc" ? 1 : -1;
  const statusRank: Record<Bet["status"], number> = { open: 0, won: 1, lost: 2 };

  filtered.sort((a, b) => {
    switch (f.sort) {
      case "stake":
        return (a.stake - b.stake) * dir;
      case "odds":
        return (a.odds - b.odds) * dir;
      case "potential":
        return (betProfit(a) - betProfit(b)) * dir;
      case "status":
        return (statusRank[a.status] - statusRank[b.status]) * dir;
      case "created":
        return a.createdAt.localeCompare(b.createdAt) * dir;
      case "date":
      default: {
        const da = a.date ? new Date(a.date).getTime() : Infinity;
        const db = b.date ? new Date(b.date).getTime() : Infinity;
        return (da - db) * dir;
      }
    }
  });

  return filtered;
}

/** Unique team-ish tokens for the team filter dropdown. */
export function collectTeams(bets: Bet[]): string[] {
  const set = new Set<string>();
  const looksLikeMatchup = (v: string) => /\sv\s|\svs\s|\s\/\s/i.test(v);
  for (const b of bets) {
    if (looksLikeMatchup(b.selection))
      splitTeams(b.selection).forEach((t) => set.add(t));
    if (b.matchLabel) splitTeams(b.matchLabel).forEach((t) => set.add(t));
    b.legs?.forEach((l) => {
      if (l.matchLabel) splitTeams(l.matchLabel).forEach((t) => set.add(t));
    });
  }
  return Array.from(set)
    .filter((t) => t.length > 1 && t.length < 24)
    .sort((a, b) => a.localeCompare(b, "nl"));
}

function splitTeams(value: string): string[] {
  return value
    .split(/ v | vs | \/ |, /i)
    .map((s) => s.trim())
    .filter(Boolean);
}
