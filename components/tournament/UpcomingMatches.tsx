"use client";

import * as React from "react";
import type { ResolvedMatch } from "@/lib/tournament/types";
import { upcomingMatches } from "@/lib/tournament/engine";
import { MatchCard } from "./MatchCard";

export function UpcomingMatches({
  matches,
  onRecord,
  onShowBets,
}: {
  matches: ResolvedMatch[];
  onRecord: (m: ResolvedMatch) => void;
  onShowBets: (m: ResolvedMatch) => void;
}) {
  const upcoming = React.useMemo(() => upcomingMatches(matches, 24), [matches]);

  if (upcoming.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border glass py-12 text-center text-sm text-muted-foreground">
        Geen openstaande wedstrijden meer — het toernooi is afgelopen! 🏆
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {upcoming.map((m) => (
        <MatchCard
          key={m.id}
          match={m}
          onRecord={onRecord}
          onShowBets={onShowBets}
        />
      ))}
    </div>
  );
}
