"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Target, Pencil, Trophy } from "lucide-react";
import type { ResolvedMatch } from "@/lib/tournament/types";
import { PHASE_LABELS } from "@/lib/tournament/types";
import { betsForMatch } from "@/lib/tournament/coupling";
import { useBetStore } from "@/store/useBetStore";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Countdown } from "./Countdown";

interface Props {
  match: ResolvedMatch;
  onRecord?: (m: ResolvedMatch) => void;
  onShowBets?: (m: ResolvedMatch) => void;
}

export function MatchCard({ match, onRecord, onShowBets }: Props) {
  const bets = useBetStore((s) => s.bets);
  const coupled = React.useMemo(
    () => betsForMatch(bets, match.home, match.away),
    [bets, match.home, match.away]
  );

  const finished = match.status === "finished";
  const r = match.result;

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl glass p-4 shadow-card transition-colors",
        finished ? "hover:border-won/40" : "hover:border-primary/40"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80",
          finished ? "from-won to-emerald-400" : "from-primary via-gold to-primary"
        )}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="rounded-md bg-surface/70 px-1.5 py-0.5 font-semibold text-foreground/80">
            {match.group ? `Groep ${match.group}` : PHASE_LABELS[match.phase]}
          </span>
          <span>
            {formatDate(match.date)}
            {formatTime(match.date) && ` · ${formatTime(match.date)}`}
          </span>
        </span>
        {finished ? (
          <span className="rounded-full bg-won/15 px-2 py-0.5 text-xs font-bold text-won">
            Afgerond
          </span>
        ) : (
          <Countdown date={match.date} />
        )}
      </div>

      {/* Teams */}
      <div className="mt-3 space-y-1.5">
        <TeamRow
          flag={match.home?.flag}
          name={match.home?.name}
          goals={r?.homeGoals}
          finished={finished}
          winner={finished && match.winner?.id === match.home?.id}
        />
        <TeamRow
          flag={match.away?.flag}
          name={match.away?.name}
          goals={r?.awayGoals}
          finished={finished}
          winner={finished && match.winner?.id === match.away?.id}
        />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <span className="flex min-w-0 items-center gap-1 truncate text-[11px] text-muted-foreground">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">
            {match.stadium}
            {match.city ? `, ${match.city}` : ""}
          </span>
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          {coupled.length > 0 && (
            <button
              onClick={() => onShowBets?.(match)}
              className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-xs font-bold text-gold transition-transform hover:scale-105"
              title="Mijn bets op deze wedstrijd"
            >
              <Target size={12} /> {coupled.length}
            </button>
          )}
          {onRecord && (
            <button
              onClick={() => onRecord(match)}
              disabled={!match.home || !match.away}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface/60 px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-40"
              title="Uitslag invoeren"
            >
              {finished ? <Pencil size={12} /> : <Trophy size={12} />}
              {finished ? "Wijzig" : "Uitslag"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TeamRow({
  flag,
  name,
  goals,
  finished,
  winner,
}: {
  flag?: string;
  name?: string;
  goals?: number;
  finished: boolean;
  winner?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl px-2 py-1.5",
        winner && "bg-won/10"
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="text-xl">{flag ?? "⚽"}</span>
        <span
          className={cn(
            "truncate font-display text-sm font-bold",
            !name && "text-muted-foreground",
            winner && "text-won"
          )}
        >
          {name ?? "Nog te bepalen"}
        </span>
      </span>
      {finished && (
        <span
          className={cn(
            "font-display text-lg font-extrabold tabular-nums",
            winner ? "text-won" : "text-muted-foreground"
          )}
        >
          {goals}
        </span>
      )}
    </div>
  );
}
