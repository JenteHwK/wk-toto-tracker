"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MatchResult } from "@/lib/tournament/types";

interface TournamentState {
  results: Record<string, MatchResult>;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  recordResult: (matchId: string, result: MatchResult) => void;
  clearResult: (matchId: string) => void;
  resetTournament: () => void;
}

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set) => ({
      results: {},
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      recordResult: (matchId, result) =>
        set((state) => ({
          results: { ...state.results, [matchId]: result },
        })),

      clearResult: (matchId) =>
        set((state) => {
          const next = { ...state.results };
          delete next[matchId];
          return { results: next };
        }),

      resetTournament: () => set({ results: {} }),
    }),
    {
      name: "wk-toto-tournament",
      version: 1,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      partialize: (s) => ({ results: s.results }),
    }
  )
);
