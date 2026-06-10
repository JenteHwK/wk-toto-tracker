"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bet, BetStatus } from "@/lib/types";
import { SEED_BETS } from "@/lib/seed";
import { uid } from "@/lib/utils";

interface ExportPayload {
  app: "wk-toto-tracker";
  version: 1;
  exportedAt: string;
  bets: Bet[];
}

interface BetState {
  bets: Bet[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  addBet: (bet: Omit<Bet, "id" | "createdAt"> & { id?: string }) => Bet;
  updateBet: (id: string, patch: Partial<Bet>) => void;
  deleteBet: (id: string) => void;
  setStatus: (id: string, status: BetStatus) => void;
  cycleStatus: (id: string) => void;

  resetToSeed: () => void;
  clearAll: () => void;
  importBets: (bets: Bet[], mode: "replace" | "merge") => number;
  exportPayload: () => ExportPayload;
}

const STATUS_ORDER: BetStatus[] = ["open", "won", "lost"];

export const useBetStore = create<BetState>()(
  persist(
    (set, get) => ({
      bets: SEED_BETS,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addBet: (input) => {
        const bet: Bet = {
          ...input,
          id: input.id?.trim() || uid("O/1260637/manual"),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bets: [bet, ...state.bets] }));
        return bet;
      },

      updateBet: (id, patch) =>
        set((state) => ({
          bets: state.bets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),

      deleteBet: (id) =>
        set((state) => ({ bets: state.bets.filter((b) => b.id !== id) })),

      setStatus: (id, status) =>
        set((state) => ({
          bets: state.bets.map((b) => (b.id === id ? { ...b, status } : b)),
        })),

      cycleStatus: (id) =>
        set((state) => ({
          bets: state.bets.map((b) => {
            if (b.id !== id) return b;
            const next =
              STATUS_ORDER[(STATUS_ORDER.indexOf(b.status) + 1) % STATUS_ORDER.length];
            return { ...b, status: next };
          }),
        })),

      resetToSeed: () => set({ bets: SEED_BETS }),
      clearAll: () => set({ bets: [] }),

      importBets: (incoming, mode) => {
        if (!Array.isArray(incoming)) return 0;
        const valid = incoming.filter(isValidBet);
        if (mode === "replace") {
          set({ bets: valid });
          return valid.length;
        }
        const existing = new Map(get().bets.map((b) => [b.id, b]));
        for (const bet of valid) existing.set(bet.id, bet);
        set({ bets: Array.from(existing.values()) });
        return valid.length;
      },

      exportPayload: () => ({
        app: "wk-toto-tracker",
        version: 1,
        exportedAt: new Date().toISOString(),
        bets: get().bets,
      }),
    }),
    {
      name: "wk-toto-bets",
      version: 1,
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      partialize: (state) => ({ bets: state.bets }),
    }
  )
);

function isValidBet(value: unknown): value is Bet {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    typeof b.selection === "string" &&
    typeof b.odds === "number" &&
    typeof b.stake === "number" &&
    (b.status === "open" || b.status === "won" || b.status === "lost")
  );
}
