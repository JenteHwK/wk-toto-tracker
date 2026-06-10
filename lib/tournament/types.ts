// ---------------------------------------------------------------------------
// Modular tournament model — works for any cup-format tournament (WK, EK, CL).
// A new tournament = a new data module exporting `TournamentConfig`.
// ---------------------------------------------------------------------------

export type MatchPhase = "group" | "r32" | "r16" | "qf" | "sf" | "final";

export const PHASE_ORDER: MatchPhase[] = ["group", "r32", "r16", "qf", "sf", "final"];

export const PHASE_LABELS: Record<MatchPhase, string> = {
  group: "Groepsfase",
  r32: "1/16 Finale",
  r16: "Achtste Finale",
  qf: "Kwartfinale",
  sf: "Halve Finale",
  final: "Finale",
};

export const PHASE_SHORT: Record<MatchPhase, string> = {
  group: "Groepen",
  r32: "1/16",
  r16: "1/8",
  qf: "KF",
  sf: "HF",
  final: "Finale",
};

export interface TournamentTeam {
  id: string; // "NED"
  name: string; // "Nederland"
  flag: string; // 🇳🇱
  group?: string; // "F"
}

/** Where a knockout slot's team comes from (resolved by the engine). */
export type SlotSource =
  | { kind: "team"; teamId: string }
  | { kind: "groupWinner"; group: string }
  | { kind: "groupRunnerUp"; group: string }
  | { kind: "bestThird"; index: number }
  | { kind: "winner"; matchId: string };

export interface TournamentMatch {
  id: string;
  phase: MatchPhase;
  number: number; // global match number
  group?: string;
  date?: string; // ISO
  stadium?: string;
  city?: string;
  homeSource: SlotSource;
  awaySource: SlotSource;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
}

export interface TournamentConfig {
  id: string;
  name: string;
  season: string;
  startDate: string;
  endDate: string;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
}

// ---- Resolved (runtime) shapes ----

export interface ResolvedMatch extends TournamentMatch {
  home?: TournamentTeam;
  away?: TournamentTeam;
  result?: MatchResult;
  status: "scheduled" | "finished";
  winner?: TournamentTeam;
}

export interface GroupRow {
  team: TournamentTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  rank: number;
}

export interface ProgressionStats {
  totalMatches: number;
  playedMatches: number;
  remainingMatches: number;
  currentPhase: MatchPhase;
  champion?: TournamentTeam;
}
