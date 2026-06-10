"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { MatchPhase } from "@/lib/tournament/types";
import { PHASE_ORDER, PHASE_SHORT } from "@/lib/tournament/types";
import { cn } from "@/lib/utils";

const STEPS: { phase: MatchPhase | "champion"; label: string }[] = [
  ...PHASE_ORDER.map((p) => ({ phase: p, label: PHASE_SHORT[p] })),
  { phase: "champion", label: "Kampioen" },
];

export function PhaseTimeline({
  current,
  hasChampion,
}: {
  current: MatchPhase;
  hasChampion: boolean;
}) {
  const currentIdx = hasChampion
    ? STEPS.length - 1
    : PHASE_ORDER.indexOf(current);

  return (
    <div className="rounded-3xl glass p-4 shadow-card">
      <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const isChampion = step.phase === "champion";
          return (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <motion.span
                  initial={false}
                  animate={{ scale: active ? 1.12 : 1 }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold transition-colors",
                    active &&
                      (isChampion
                        ? "gradient-gold text-black shadow-lg shadow-gold/40"
                        : "gradient-orange text-white shadow-lg shadow-primary/40"),
                    done && "bg-won/20 text-won",
                    !active && !done && "bg-surface/70 text-muted-foreground"
                  )}
                >
                  {done ? <Check size={15} /> : isChampion ? "🏆" : i + 1}
                </motion.span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "mx-1 mb-5 h-0.5 flex-1 rounded-full",
                    i < currentIdx ? "bg-won/40" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
