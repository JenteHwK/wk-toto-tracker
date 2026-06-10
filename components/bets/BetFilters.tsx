"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import type { Bet, BetCategory, FilterState, SortKey } from "@/lib/types";
import { CATEGORY_LABELS, TOURNAMENT_PHASES } from "@/lib/types";
import { collectTeams, DEFAULT_FILTERS } from "@/lib/filter";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { STATUS_META } from "./StatusBadge";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<SortKey, string> = {
  date: "Datum",
  stake: "Inzet",
  odds: "Odds",
  potential: "Mog. winst",
  status: "Status",
  created: "Toegevoegd",
};

interface BetFiltersProps {
  bets: Bet[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export function BetFilters({
  bets,
  filters,
  onChange,
  resultCount,
}: BetFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const teams = React.useMemo(() => collectTeams(bets), [bets]);
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const statusTabs: Array<{ key: FilterState["status"]; label: string }> = [
    { key: "all", label: "Alle" },
    { key: "open", label: STATUS_META.open.label },
    { key: "won", label: STATUS_META.won.label },
    { key: "lost", label: STATUS_META.lost.label },
  ];

  const isDirty =
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      {/* Search + status tabs */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Zoek op team, wedstrijd of bet type…"
            className="pl-9"
          />
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => set({ status: tab.key })}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                filters.status === tab.key
                  ? tab.key === "all"
                    ? "bg-primary text-primary-foreground"
                    : cn(STATUS_META[tab.key as Bet["status"]].chip, "border-0")
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={() => setShowAdvanced((v) => !v)}
          className={cn(showAdvanced && "border-primary/40 text-primary")}
        >
          <SlidersHorizontal size={15} />
          Filters
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid animate-fade-in gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Categorie
            </p>
            <Select
              value={filters.category}
              onChange={(e) =>
                set({ category: e.target.value as BetCategory | "all" })
              }
            >
              <option value="all">Alle categorieën</option>
              {(Object.keys(CATEGORY_LABELS) as BetCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Toernooi fase
            </p>
            <Select
              value={filters.phase}
              onChange={(e) =>
                set({ phase: e.target.value as FilterState["phase"] })
              }
            >
              <option value="all">Alle fases</option>
              {TOURNAMENT_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Team
            </p>
            <Select
              value={filters.team}
              onChange={(e) => set({ team: e.target.value })}
            >
              <option value="">Alle teams</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Sorteren
            </p>
            <div className="flex gap-2">
              <Select
                value={filters.sort}
                onChange={(e) => set({ sort: e.target.value as SortKey })}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                size="icon"
                aria-label="Sorteerrichting"
                onClick={() =>
                  set({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })
                }
              >
                <ArrowUpDown size={15} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {resultCount} {resultCount === 1 ? "bet" : "bets"} gevonden
        </span>
        {isDirty && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <X size={13} /> Filters wissen
          </button>
        )}
      </div>
    </div>
  );
}
