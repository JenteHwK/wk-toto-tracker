"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, CalendarClock } from "lucide-react";
import type { ResolvedMatch, TournamentTeam } from "@/lib/tournament/types";
import { PHASE_LABELS } from "@/lib/tournament/types";
import { buildTeamTracker, type FollowedTeam } from "@/lib/tournament/coupling";
import { useBetStore } from "@/store/useBetStore";
import { formatEuro, formatEuroSigned, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SortKey = "net" | "bets" | "name";

export function TeamTracker({
  teams,
  matches,
}: {
  teams: TournamentTeam[];
  matches: ResolvedMatch[];
}) {
  const bets = useBetStore((s) => s.bets);
  const [sort, setSort] = React.useState<SortKey>("net");

  const followed = React.useMemo(() => {
    const list = buildTeamTracker(bets, teams, matches);
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "name") return a.team.name.localeCompare(b.team.name, "nl");
      if (sort === "bets") return b.betCount - a.betCount;
      return b.netResult - a.netResult;
    });
    return sorted;
  }, [bets, teams, matches, sort]);

  if (followed.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border glass py-12 text-center text-sm text-muted-foreground">
        Nog geen teams gevolgd — plaats een bet op een team om het hier te zien.
      </p>
    );
  }

  const sortLabels: Record<SortKey, string> = {
    net: "Resultaat",
    bets: "Aantal bets",
    name: "Naam",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sorteer op:</span>
        {(Object.keys(sortLabels) as SortKey[]).map((k) => (
          <Button
            key={k}
            size="sm"
            variant={sort === k ? "default" : "outline"}
            onClick={() => setSort(k)}
          >
            <ArrowUpDown size={12} /> {sortLabels[k]}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {followed.map((f, i) => (
          <TeamCard key={f.team.id} data={f} index={i} />
        ))}
      </div>
    </div>
  );
}

function TeamCard({ data, index }: { data: FollowedTeam; index: number }) {
  const { team, betCount, totalStake, netResult, nextMatch } = data;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="rounded-3xl glass p-4 shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface/70 text-2xl">
          {team.flag}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-extrabold">
            {team.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {betCount} bet{betCount !== 1 ? "s" : ""} · Groep {team.group}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Inzet
          </p>
          <p className="font-display font-bold tabular-nums">
            {formatEuro(totalStake)}
          </p>
        </div>
        <div className="rounded-xl bg-surface/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Resultaat
          </p>
          <p
            className={cn(
              "font-display font-bold tabular-nums",
              netResult > 0 ? "text-won" : netResult < 0 ? "text-lost" : ""
            )}
          >
            {formatEuroSigned(netResult)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
        <CalendarClock size={13} className="text-primary" />
        {nextMatch ? (
          <span className="truncate">
            {PHASE_LABELS[nextMatch.phase]} · {formatDate(nextMatch.date)}
            {nextMatch.home && nextMatch.away
              ? ` · ${nextMatch.home.flag} v ${nextMatch.away.flag}`
              : ""}
          </span>
        ) : (
          <span>Geen geplande wedstrijd</span>
        )}
      </div>
    </motion.div>
  );
}
