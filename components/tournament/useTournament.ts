"use client";

import * as React from "react";
import { useTournamentStore } from "@/store/useTournamentStore";
import { WK2026 } from "@/lib/tournament/data";
import {
  computeProgression,
  resolveTournament,
} from "@/lib/tournament/engine";

/** Realtime-resolved tournament derived from stored results. */
export function useTournament() {
  const results = useTournamentStore((s) => s.results);
  const hasHydrated = useTournamentStore((s) => s.hasHydrated);

  const data = React.useMemo(() => {
    const { matches, standings, champion } = resolveTournament(WK2026, results);
    const progression = computeProgression(matches);
    return { config: WK2026, matches, standings, champion, progression };
  }, [results]);

  return { ...data, hasHydrated };
}
