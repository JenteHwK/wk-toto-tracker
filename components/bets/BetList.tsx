"use client";

import { Inbox } from "lucide-react";
import type { Bet } from "@/lib/types";
import { BetCard } from "./BetCard";

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Inbox size={22} />
        </span>
        <p className="font-semibold">{emptyTitle}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {bets.map((bet, i) => (
        <div
          key={bet.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
        >
          <BetCard bet={bet} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
