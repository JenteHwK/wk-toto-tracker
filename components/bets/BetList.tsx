"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Inbox } from "lucide-react";
import type { Bet } from "@/lib/types";
import { SportBetCard } from "./SportBetCard";

interface BetListProps {
  bets: Bet[];
  onEdit?: (bet: Bet) => void;
  onDelete?: (bet: Bet) => void;
  emptyTitle?: string;
  emptyHint?: string;
}

export function BetList({
  bets,
  onEdit,
  onDelete,
  emptyTitle = "Geen bets gevonden",
  emptyHint = "Pas je filters aan of voeg een nieuwe bet toe.",
}: BetListProps) {
  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border glass py-16 text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Inbox size={24} />
        </span>
        <p className="font-display font-bold">{emptyTitle}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <motion.div layout className="grid gap-4 lg:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {bets.map((bet) => (
          <SportBetCard
            key={bet.id}
            bet={bet}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
