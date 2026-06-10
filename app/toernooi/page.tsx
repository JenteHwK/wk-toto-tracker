"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  LayoutGrid,
  CalendarClock,
  GitFork,
  Users,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useTournament } from "@/components/tournament/useTournament";
import { useBetStore } from "@/store/useBetStore";
import { useTournamentStore } from "@/store/useTournamentStore";
import { useToastStore } from "@/store/useToastStore";
import { computeStats } from "@/lib/calculations";
import { applyMatchFilters } from "@/lib/tournament/filter";
import type { ResolvedMatch } from "@/lib/tournament/types";
import {
  DEFAULT_TOURNAMENT_FILTERS,
  TournamentFilters,
  type TournamentFilterState,
} from "@/components/tournament/TournamentFilters";
import { ProgressionStats } from "@/components/tournament/ProgressionStats";
import { PhaseTimeline } from "@/components/tournament/PhaseTimeline";
import { ChampionCard } from "@/components/tournament/ChampionCard";
import { GroupStage } from "@/components/tournament/GroupStage";
import { UpcomingMatches } from "@/components/tournament/UpcomingMatches";
import { Bracket } from "@/components/tournament/Bracket";
import { TeamTracker } from "@/components/tournament/TeamTracker";
import { MatchCard } from "@/components/tournament/MatchCard";
import { RecordResultModal } from "@/components/tournament/RecordResultModal";
import { MatchBetsModal } from "@/components/tournament/MatchBetsModal";
import { upcomingMatches } from "@/lib/tournament/engine";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

type Tab = "overview" | "groups" | "upcoming" | "bracket" | "teams";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overzicht", icon: <Sparkles size={15} /> },
  { id: "groups", label: "Groepen", icon: <LayoutGrid size={15} /> },
  { id: "upcoming", label: "Komende 24", icon: <CalendarClock size={15} /> },
  { id: "bracket", label: "Bracket", icon: <GitFork size={15} /> },
  { id: "teams", label: "Teams", icon: <Users size={15} /> },
];

export default function ToernooiPage() {
  const { config, matches, standings, champion, progression, hasHydrated } =
    useTournament();
  const bets = useBetStore((s) => s.bets);
  const betsHydrated = useBetStore((s) => s.hasHydrated);
  const resetTournament = useTournamentStore((s) => s.resetTournament);
  const toast = useToastStore((s) => s.toast);

  const [tab, setTab] = React.useState<Tab>("overview");
  const [filters, setFilters] = React.useState<TournamentFilterState>(
    DEFAULT_TOURNAMENT_FILTERS
  );
  const [recordMatch, setRecordMatch] = React.useState<ResolvedMatch | null>(null);
  const [betsMatch, setBetsMatch] = React.useState<ResolvedMatch | null>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);

  const betStats = React.useMemo(() => computeStats(bets), [bets]);
  const filtered = React.useMemo(
    () => applyMatchFilters(matches, filters, bets),
    [matches, filters, bets]
  );
  const nextUp = React.useMemo(() => upcomingMatches(matches, 3), [matches]);

  const ready = hasHydrated && betsHydrated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary">
            <Trophy size={16} /> {config.name} · Toernooi Centrum
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Het volledige <span className="text-gradient-orange">WK-schema</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Groepen, bracket en kampioen — automatisch gekoppeld aan jouw bets.
          </p>
        </div>
        <Button variant="outline" onClick={() => setConfirmReset(true)}>
          <RotateCcw size={16} /> Reset uitslagen
        </Button>
      </div>

      {/* Timeline */}
      {ready ? (
        <PhaseTimeline current={progression.currentPhase} hasChampion={!!champion} />
      ) : (
        <Skeleton className="h-24 rounded-3xl" />
      )}

      {/* Tabs */}
      <div className="scrollbar-thin flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            {tab === t.id && (
              <motion.span
                layoutId="tournament-tab"
                className="absolute inset-0 rounded-xl gradient-orange shadow-md shadow-primary/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className={cn("relative z-10", tab === t.id ? "text-white" : "text-muted-foreground")}>
              {t.icon}
            </span>
            <span className={cn("relative z-10", tab === t.id ? "text-white" : "text-muted-foreground")}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {!ready ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {tab === "overview" && (
            <>
              <SectionTitle icon={<Trophy size={16} />} title="WK Progressie" />
              <ProgressionStats progression={progression} betStats={betStats} />
              <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                <ChampionCard champion={champion} />
                <div className="space-y-3">
                  <SectionTitle
                    icon={<CalendarClock size={16} />}
                    title="Eerstvolgende wedstrijden"
                  />
                  <div className="grid gap-3">
                    {nextUp.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        onRecord={setRecordMatch}
                        onShowBets={setBetsMatch}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "groups" && (
            <>
              <TournamentFilters
                teams={config.teams}
                value={filters}
                onChange={setFilters}
              />
              <GroupStage
                standings={standings}
                matches={filtered}
                onRecord={setRecordMatch}
                onShowBets={setBetsMatch}
              />
            </>
          )}

          {tab === "upcoming" && (
            <>
              <SectionTitle
                icon={<CalendarClock size={16} />}
                title="Eerstvolgende 24 wedstrijden"
              />
              <UpcomingMatches
                matches={matches}
                onRecord={setRecordMatch}
                onShowBets={setBetsMatch}
              />
            </>
          )}

          {tab === "bracket" && (
            <>
              <SectionTitle
                icon={<GitFork size={16} />}
                title="Knockout bracket"
              />
              <p className="-mt-3 text-xs text-muted-foreground">
                Klik een wedstrijd om de uitslag in te voeren — winnaars schuiven
                automatisch door. 🎯 = gekoppelde bet.
              </p>
              <Bracket
                matches={matches}
                onRecord={setRecordMatch}
                onShowBets={setBetsMatch}
              />
            </>
          )}

          {tab === "teams" && (
            <>
              <SectionTitle
                icon={<Users size={16} />}
                title="Gevolgde teams"
              />
              <TeamTracker teams={config.teams} matches={matches} />
            </>
          )}
        </motion.div>
      )}

      <RecordResultModal match={recordMatch} onClose={() => setRecordMatch(null)} />
      <MatchBetsModal match={betsMatch} onClose={() => setBetsMatch(null)} />

      <ConfirmDialog
        open={confirmReset}
        title="Alle uitslagen wissen?"
        description="Hiermee verwijder je alle ingevoerde toernooi-uitslagen en wordt de bracket leeggemaakt. Je bets blijven ongewijzigd."
        confirmLabel="Reset"
        onConfirm={() => {
          resetTournament();
          setConfirmReset(false);
          toast({ title: "Toernooi gereset", variant: "info" });
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
