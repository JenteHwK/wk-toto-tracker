"use client";

import { Search, X } from "lucide-react";
import type { MatchPhase, TournamentTeam } from "@/lib/tournament/types";
import { PHASE_LABELS, PHASE_ORDER } from "@/lib/tournament/types";
import { Input, Select } from "@/components/ui/Input";

export type MatchStatusFilter =
  | "all"
  | "scheduled"
  | "finished"
  | "open-bets"
  | "won-bets"
  | "lost-bets";

export interface TournamentFilterState {
  search: string;
  phase: MatchPhase | "all";
  team: string;
  status: MatchStatusFilter;
}

export const DEFAULT_TOURNAMENT_FILTERS: TournamentFilterState = {
  search: "",
  phase: "all",
  team: "",
  status: "all",
};

const STATUS_LABELS: Record<MatchStatusFilter, string> = {
  all: "Alle wedstrijden",
  scheduled: "Te spelen",
  finished: "Afgerond",
  "open-bets": "Met open bets",
  "won-bets": "Met gewonnen bets",
  "lost-bets": "Met verloren bets",
};

export function TournamentFilters({
  teams,
  value,
  onChange,
}: {
  teams: TournamentTeam[];
  value: TournamentFilterState;
  onChange: (v: TournamentFilterState) => void;
}) {
  const set = (patch: Partial<TournamentFilterState>) =>
    onChange({ ...value, ...patch });
  const dirty =
    JSON.stringify(value) !== JSON.stringify(DEFAULT_TOURNAMENT_FILTERS);

  return (
    <div className="grid gap-3 rounded-3xl glass p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Team, wedstrijd of stadion…"
          className="pl-9"
        />
      </div>

      <Select
        value={value.phase}
        onChange={(e) => set({ phase: e.target.value as MatchPhase | "all" })}
      >
        <option value="all">Alle fases</option>
        {PHASE_ORDER.map((p) => (
          <option key={p} value={p}>
            {PHASE_LABELS[p]}
          </option>
        ))}
      </Select>

      <Select value={value.team} onChange={(e) => set({ team: e.target.value })}>
        <option value="">Alle teams</option>
        {teams
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, "nl"))
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.flag} {t.name}
            </option>
          ))}
      </Select>

      <div className="flex gap-2">
        <Select
          value={value.status}
          onChange={(e) =>
            set({ status: e.target.value as MatchStatusFilter })
          }
        >
          {(Object.keys(STATUS_LABELS) as MatchStatusFilter[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        {dirty && (
          <button
            onClick={() => onChange(DEFAULT_TOURNAMENT_FILTERS)}
            aria-label="Wis filters"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
