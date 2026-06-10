"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { GroupRow, ResolvedMatch } from "@/lib/tournament/types";
import { cn } from "@/lib/utils";
import { MatchCard } from "./MatchCard";

interface Props {
  standings: Record<string, GroupRow[]>;
  matches: ResolvedMatch[];
  onRecord: (m: ResolvedMatch) => void;
  onShowBets: (m: ResolvedMatch) => void;
}

export function GroupStage({ standings, matches, onRecord, onShowBets }: Props) {
  const groups = Object.keys(standings).sort();
  const byGroup = React.useMemo(() => {
    const map: Record<string, ResolvedMatch[]> = {};
    for (const m of matches) {
      if (m.phase !== "group" || !m.group) continue;
      (map[m.group] ??= []).push(m);
    }
    return map;
  }, [matches]);

  const visibleGroups = groups.filter((g) => (byGroup[g]?.length ?? 0) > 0);

  if (visibleGroups.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border glass py-12 text-center text-sm text-muted-foreground">
        Geen groepswedstrijden voor deze filters.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {visibleGroups.map((g) => (
        <GroupPanel
          key={g}
          group={g}
          rows={standings[g]}
          matches={byGroup[g] ?? []}
          onRecord={onRecord}
          onShowBets={onShowBets}
        />
      ))}
    </div>
  );
}

function GroupPanel({
  group,
  rows,
  matches,
  onRecord,
  onShowBets,
}: {
  group: string;
  rows: GroupRow[];
  matches: ResolvedMatch[];
  onRecord: (m: ResolvedMatch) => void;
  onShowBets: (m: ResolvedMatch) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const anyPlayed = rows.some((r) => r.played > 0);

  return (
    <div className="overflow-hidden rounded-3xl glass shadow-card">
      <div className="flex items-center justify-between border-b border-border/60 bg-surface/40 px-4 py-3">
        <h3 className="font-display text-base font-extrabold">
          Groep <span className="text-gradient-orange">{group}</span>
        </h3>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {anyPlayed ? "Stand" : "Nog niet gestart"}
        </span>
      </div>

      {/* Standings */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-1.5 font-medium">#</th>
            <th className="py-1.5 font-medium">Team</th>
            <th className="py-1.5 text-center font-medium">G</th>
            <th className="py-1.5 text-center font-medium">DV</th>
            <th className="px-4 py-1.5 text-right font-medium">Ptn</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.team.id}
              className={cn(
                "border-t border-border/40",
                i < 2 && "bg-won/5",
                i === 2 && "bg-gold/5"
              )}
            >
              <td className="px-4 py-2">
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold",
                    i < 2
                      ? "bg-won/20 text-won"
                      : i === 2
                        ? "bg-gold/20 text-gold"
                        : "bg-surface text-muted-foreground"
                  )}
                >
                  {i + 1}
                </span>
              </td>
              <td className="py-2">
                <span className="flex items-center gap-2">
                  <span className="text-base">{row.team.flag}</span>
                  <span className="font-semibold">{row.team.name}</span>
                </span>
              </td>
              <td className="py-2 text-center tabular-nums text-muted-foreground">
                {row.played}
              </td>
              <td className="py-2 text-center tabular-nums text-muted-foreground">
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </td>
              <td className="px-4 py-2 text-right font-display font-bold tabular-nums">
                {row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Matches toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-border/60 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? "Verberg" : "Toon"} wedstrijden ({matches.length})
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 p-4">
              {matches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onRecord={onRecord}
                  onShowBets={onShowBets}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
