// ---------------------------------------------------------------------------
// Domain types for the WK Toto Tracker
// ---------------------------------------------------------------------------

export type BetStatus = "open" | "won" | "lost";

/**
 * Categories let us group the (mostly tournament-wide) outright bets in a
 * sensible way, while still supporting classic "match" bets.
 */
export type BetCategory =
  | "winner" // Tournament / group winner
  | "topscorer" // Golden boot, most assists, ...
  | "group" // Group stage standings
  | "exact" // Exact final / scoreline predictions
  | "special" // Boosts & specials (goal totals, regional, ...)
  | "match" // Classic Team A vs Team B result
  | "combi"; // Multi-leg combination (Treble, Double, ...)

export const CATEGORY_LABELS: Record<BetCategory, string> = {
  winner: "Winnaar",
  topscorer: "Topscorer / Awards",
  group: "Groepsfase",
  exact: "Exacte uitslag",
  special: "Specials / Boosts",
  match: "Wedstrijd",
  combi: "Combi",
};

export const TOURNAMENT_PHASES = [
  "Groepsfase",
  "Achtste finale",
  "Kwartfinale",
  "Halve finale",
  "Finale",
  "Toernooi-breed",
] as const;

export type TournamentPhase = (typeof TOURNAMENT_PHASES)[number];

/** A single selection inside a combination bet. */
export interface BetLeg {
  id: string;
  selection: string; // e.g. "Nederland"
  market: string; // e.g. "Resultaat"
  matchLabel?: string; // e.g. "Nederland v Japan"
  odds: number;
  date?: string; // ISO datetime of the leg's kickoff
}

export interface Bet {
  id: string; // bookmaker bet id, e.g. O/1260637/0000052
  selection: string; // the prediction / pick
  market: string; // market name, e.g. "WK 2026 - Winnaar"
  event?: string; // optional event / period grouping
  category: BetCategory;
  phase: TournamentPhase;
  isBoost: boolean; // bookmaker "boost" markets
  type: "single" | "combi";
  odds: number; // total odds
  stake: number; // amount staked (€)
  status: BetStatus;
  date?: string; // ISO datetime the bet settles / kicks off
  matchLabel?: string; // optional "Team A v Team B" context
  legs?: BetLeg[]; // present for combi bets
  cashout?: number; // current cash-out value offered (€)
  notes?: string;
  createdAt: string; // ISO — when added to the tracker
}

export interface BetStats {
  total: number;
  won: number;
  lost: number;
  open: number;
  totalStake: number;
  totalProfit: number; // net profit from won bets
  totalLoss: number; // staked amount lost
  net: number; // totalProfit - totalLoss
  roi: number; // (net / totalStake) * 100
  winRate: number; // won / (won + lost) * 100
  openStake: number; // money still in play
  potentialOpenProfit: number; // net profit if all open bets win
}

export type SortKey =
  | "date"
  | "stake"
  | "odds"
  | "potential"
  | "status"
  | "created";

export interface FilterState {
  search: string;
  status: BetStatus | "all";
  category: BetCategory | "all";
  phase: TournamentPhase | "all";
  team: string;
  sort: SortKey;
  sortDir: "asc" | "desc";
}
