import type {
  GroupRow,
  MatchResult,
  ProgressionStats,
  ResolvedMatch,
  SlotSource,
  TournamentConfig,
  TournamentMatch,
  TournamentTeam,
} from "./types";
import { PHASE_ORDER } from "./types";

type Results = Record<string, MatchResult>;

function teamMap(config: TournamentConfig): Map<string, TournamentTeam> {
  return new Map(config.teams.map((t) => [t.id, t]));
}

// ---- Group standings -------------------------------------------------------

export function computeGroupRows(
  config: TournamentConfig,
  results: Results,
  group: string
): GroupRow[] {
  const rows = new Map<string, GroupRow>();
  for (const t of config.teams.filter((t) => t.group === group)) {
    rows.set(t.id, {
      team: t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      rank: 0,
    });
  }

  for (const m of config.matches) {
    if (m.phase !== "group" || m.group !== group) continue;
    const r = results[m.id];
    if (!r) continue;
    const homeId = (m.homeSource as { teamId: string }).teamId;
    const awayId = (m.awaySource as { teamId: string }).teamId;
    const h = rows.get(homeId);
    const a = rows.get(awayId);
    if (!h || !a) continue;
    h.played++; a.played++;
    h.gf += r.homeGoals; h.ga += r.awayGoals;
    a.gf += r.awayGoals; a.ga += r.homeGoals;
    if (r.homeGoals > r.awayGoals) { h.won++; a.lost++; h.points += 3; }
    else if (r.homeGoals < r.awayGoals) { a.won++; h.lost++; a.points += 3; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  }

  const sorted = Array.from(rows.values()).sort(rankCompare);
  sorted.forEach((row, i) => {
    row.gd = row.gf - row.ga;
    row.rank = i + 1;
  });
  return sorted.map((r) => ({ ...r, gd: r.gf - r.ga }));
}

function rankCompare(a: GroupRow, b: GroupRow): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gf - b.ga !== a.gf - a.ga) return b.gf - b.ga - (a.gf - a.ga);
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.team.name.localeCompare(b.team.name, "nl");
}

export function computeAllGroups(
  config: TournamentConfig,
  results: Results
): Record<string, GroupRow[]> {
  const groups = Array.from(
    new Set(config.teams.map((t) => t.group).filter(Boolean) as string[])
  );
  const out: Record<string, GroupRow[]> = {};
  for (const g of groups) out[g] = computeGroupRows(config, results, g);
  return out;
}

/** Ranked best third-placed teams across all groups (top 8 qualify). */
function bestThirds(standings: Record<string, GroupRow[]>): (TournamentTeam | undefined)[] {
  const thirds: GroupRow[] = [];
  for (const g of Object.keys(standings)) {
    const row = standings[g][2];
    // Only count a third place once that group has finished all 6 matches.
    if (row && row.played >= 3) thirds.push(row);
  }
  thirds.sort(rankCompare);
  return thirds.map((r) => r.team);
}

// ---- Bracket resolution ----------------------------------------------------

export function resolveTournament(
  config: TournamentConfig,
  results: Results
): {
  matches: ResolvedMatch[];
  standings: Record<string, GroupRow[]>;
  champion?: TournamentTeam;
} {
  const tm = teamMap(config);
  const standings = computeAllGroups(config, results);
  const thirds = bestThirds(standings);
  const resolved = new Map<string, ResolvedMatch>();

  const winnerOf = (matchId: string): TournamentTeam | undefined =>
    resolved.get(matchId)?.winner;

  const resolveSlot = (s: SlotSource): TournamentTeam | undefined => {
    switch (s.kind) {
      case "team":
        return tm.get(s.teamId);
      case "groupWinner": {
        const row = standings[s.group]?.[0];
        return row && row.played >= 3 ? row.team : undefined;
      }
      case "groupRunnerUp": {
        const row = standings[s.group]?.[1];
        return row && row.played >= 3 ? row.team : undefined;
      }
      case "bestThird":
        return thirds[s.index];
      case "winner":
        return winnerOf(s.matchId);
    }
  };

  // Resolve in phase order so winner() references are already available.
  const ordered = [...config.matches].sort(
    (a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase)
  );

  for (const m of ordered) {
    const home = resolveSlot(m.homeSource);
    const away = resolveSlot(m.awaySource);
    const result = results[m.id];
    const status: ResolvedMatch["status"] = result ? "finished" : "scheduled";
    let winner: TournamentTeam | undefined;
    if (result && home && away) {
      winner =
        result.homeGoals > result.awayGoals
          ? home
          : result.awayGoals > result.homeGoals
            ? away
            : undefined;
    }
    resolved.set(m.id, { ...m, home, away, result, status, winner });
  }

  const finalMatch = config.matches.find((m) => m.phase === "final");
  const champion = finalMatch ? winnerOf(finalMatch.id) : undefined;

  return {
    matches: config.matches.map((m) => resolved.get(m.id)!),
    standings,
    champion,
  };
}

// ---- Progression -----------------------------------------------------------

export function computeProgression(matches: ResolvedMatch[]): ProgressionStats {
  const total = matches.length;
  const played = matches.filter((m) => m.status === "finished").length;
  const champion = matches.find((m) => m.phase === "final")?.winner;

  // Current phase = earliest phase that still has unplayed matches.
  let currentPhase = matches[matches.length - 1]?.phase ?? "group";
  for (const phase of PHASE_ORDER) {
    const inPhase = matches.filter((m) => m.phase === phase);
    if (inPhase.length && inPhase.some((m) => m.status !== "finished")) {
      currentPhase = phase;
      break;
    }
  }

  return {
    totalMatches: total,
    playedMatches: played,
    remainingMatches: total - played,
    currentPhase,
    champion,
  };
}

// ---- Helpers ---------------------------------------------------------------

export function matchTeams(m: ResolvedMatch): [string, string] {
  return [m.home?.name ?? "?", m.away?.name ?? "?"];
}

export function upcomingMatches(
  matches: ResolvedMatch[],
  limit = 24
): ResolvedMatch[] {
  return matches
    .filter((m) => m.status !== "finished" && m.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, limit);
}
