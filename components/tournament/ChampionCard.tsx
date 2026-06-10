"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import type { TournamentTeam } from "@/lib/tournament/types";
import { fireWinConfetti } from "@/lib/confetti";
import { EASE } from "@/lib/motion";

export function ChampionCard({ champion }: { champion?: TournamentTeam }) {
  const fired = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (champion && fired.current !== champion.id) {
      fired.current = champion.id;
      fireWinConfetti();
    }
  }, [champion]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative overflow-hidden rounded-3xl border border-gold/30 p-8 text-center shadow-card"
      style={{
        background:
          "radial-gradient(120% 120% at 50% 0%, hsl(43 96% 56% / 0.18), hsl(var(--card)) 60%)",
      }}
    >
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl" />
      </div>

      <div className="relative">
        <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.3em] text-gold">
          <Sparkles size={13} /> Wereldkampioen <Sparkles size={13} />
        </p>

        {champion ? (
          <>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-7xl drop-shadow-lg sm:text-8xl"
            >
              {champion.flag}
            </motion.div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-gold sm:text-4xl">
              {champion.name}
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full gradient-gold px-4 py-1.5 text-sm font-bold text-black shadow-lg shadow-gold/30">
              <Trophy size={16} /> WK 2026 Winnaar
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 flex justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/30 bg-gold/10 text-4xl text-gold/70">
                <Trophy size={36} />
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-muted-foreground">
              Nog te bepalen
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Voltooi de finale om de wereldkampioen te kronen 🎉
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
