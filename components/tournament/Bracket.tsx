"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Target, Trophy } from "lucide-react";
import type {
  MatchPhase,
  ResolvedMatch,
  TournamentTeam,
} from "@/lib/tournament/types";
import { PHASE_LABELS } from "@/lib/tournament/types";
import { betsForMatch } from "@/lib/tournament/coupling";
import { useBetStore } from "@/store/useBetStore";
import { cn } from "@/lib/utils";

const KO_PHASES: MatchPhase[] = ["r32", "r16", "qf", "sf", "final"];

interface Props {
  matches: ResolvedMatch[];
  onRecord: (m: ResolvedMatch) => void;
  onShowBets: (m: ResolvedMatch) => void;
}

export function Bracket({ matches, onRecord, onShowBets }: Props) {
  const champion = matches.find((m) => m.phase === "final")?.winner;

  return (
    <div className="scrollbar-thin overflow-x-auto pb-4">
      <div className="flex min-w-max items-stretch gap-5">
        {KO_PHASES.map((phase) => {
          const phaseMatches = matches.filter((m) => m.phase === phase);
          return (
            <div key={phase} className="flex w-[210px] shrink-0 flex-col">
              <div className="sticky top-0 mb-3 text-center">
                <p className="font-display text-sm font-extrabold">
                  {PHASE_LABELS[phase]}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {phaseMatches.length}{" "}
                  {phaseMatches.length === 1 ? "wedstrijd" : "wedstrijden"}
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {phaseMatches.map((m) => (
                  <BracketMatch
                    key={m.id}
                    match={m}
                    onRecord={onRecord}
                    onShowBets={onShowBets}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Champion column */}
        <div className="flex w-[200px] shrink-0 flex-col">
          <div className="mb-3 text-center">
            <p className="font-display text-sm font-extrabold text-gold">
              Kampioen
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Wereldtitel
            </p>
          </div>
          <div className="flex flex-1 items-center">
            <div
              className={cn(
                "w-full rounded-3xl border p-5 text-center",
                champion
                  ? "border-gold/40 glow-gold"
                  : "border-dashed border-border"
              )}
              style={
                champion
                  ? {
                      background:
                        "radial-gradient(120% 120% at 50% 0%, hsl(43 96% 56% / 0.15), hsl(var(--card)))",
                    }
                  : undefined
              }
            >
              <Trophy
                size={28}
                className={cn(
                  "mx-auto",
                  champion ? "text-gold" : "text-muted-foreground/50"
                )}
              />
              {champion ? (
                <>
                  <div className="mt-2 text-4xl">{champion.flag}</div>
                  <p className="mt-1 font-display text-base font-extrabold text-gold">
                    {champion.name}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Nog te bepalen
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketMatch({
  match,
  onRecord,
  onShowBets,
}: {
  match: ResolvedMatch;
  onRecord: (m: ResolvedMatch) => void;
  onShowBets: (m: ResolvedMatch) => void;
}) {
  const bets = useBetStore((s) => s.bets);
  const coupled = betsForMatch(bets, match.home, match.away);
  const finished = match.status === "finished";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      onClick={() => onRecord(match)}
      className={cn(
        "relative cursor-pointer rounded-2xl border bg-card/80 p-2.5 backdrop-blur transition-shadow",
        finished
          ? "border-won/30 shadow-[0_0_18px_-6px_hsl(142_71%_45%/0.5)]"
          : "border-primary/25 shadow-[0_0_18px_-8px_hsl(29_100%_50%/0.5)] hover:border-primary/50"
      )}
    >
      {coupled.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowBets(match);
          }}
          className="absolute -right-1.5 -top-1.5 z-10 inline-flex items-center gap-0.5 rounded-full gradient-gold px-1.5 py-0.5 text-[10px] font-bold text-black shadow-md"
          title="Mijn bets"
        >
          <Target size={9} /> {coupled.length}
        </button>
      )}

      <BracketTeam
        team={match.home}
        goals={match.result?.homeGoals}
        finished={finished}
        winner={finished && match.winner?.id === match.home?.id}
      />
      <div className="my-1 h-px bg-border/60" />
      <BracketTeam
        team={match.away}
        goals={match.result?.awayGoals}
        finished={finished}
        winner={finished && match.winner?.id === match.away?.id}
      />
    </motion.div>
  );
}

function BracketTeam({
  team,
  goals,
  finished,
  winner,
}: {
  team?: TournamentTeam;
  goals?: number;
  finished: boolean;
  winner?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1.5 rounded-lg px-1 py-0.5",
        winner && "bg-won/10"
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="text-sm">{team?.flag ?? "⚽"}</span>
        <span
          className={cn(
            "truncate text-xs font-semibold",
            !team && "text-muted-foreground",
            winner ? "text-won" : ""
          )}
        >
          {team?.name ?? "TBD"}
        </span>
      </span>
      {finished && (
        <span
          className={cn(
            "shrink-0 font-display text-sm font-bold tabular-nums",
            winner ? "text-won" : "text-muted-foreground"
          )}
        >
          {goals}
        </span>
      )}
    </div>
  );
}
