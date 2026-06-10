"use client";

import * as React from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  Swords,
} from "lucide-react";
import { useBetStore } from "@/store/useBetStore";
import { useToastStore } from "@/store/useToastStore";
import { findAffectedBets, type BetSuggestion, type MatchInput } from "@/lib/matchResult";
import type { BetStatus } from "@/lib/types";
import { betProfit } from "@/lib/calculations";
import { formatEuro, formatOdds } from "@/lib/format";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

type Step = "input" | "review";

type OutcomeMap = Record<string, BetStatus | "skip">;

const OUTCOME_ICONS = {
  won: <CheckCircle2 size={16} className="text-won" />,
  lost: <XCircle size={16} className="text-lost" />,
  skip: <HelpCircle size={16} className="text-muted-foreground" />,
};

const OUTCOME_LABELS: Record<string, string> = {
  won: "Gewonnen",
  lost: "Verloren",
  skip: "Overslaan",
};

export function MatchResultWizard({ onClose }: Props) {
  const bets = useBetStore((s) => s.bets);
  const setStatus = useBetStore((s) => s.setStatus);
  const toast = useToastStore((s) => s.toast);

  const [step, setStep] = React.useState<Step>("input");
  const [homeTeam, setHomeTeam] = React.useState("");
  const [awayTeam, setAwayTeam] = React.useState("");
  const [homeGoals, setHomeGoals] = React.useState("");
  const [awayGoals, setAwayGoals] = React.useState("");
  const [error, setError] = React.useState("");

  const [suggestions, setSuggestions] = React.useState<BetSuggestion[]>([]);
  const [outcomes, setOutcomes] = React.useState<OutcomeMap>({});

  const handleSearch = () => {
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError("Vul beide teamnamen in.");
      return;
    }
    const hg = parseInt(homeGoals);
    const ag = parseInt(awayGoals);
    if (isNaN(hg) || isNaN(ag) || hg < 0 || ag < 0) {
      setError("Vul een geldige score in (bijv. 2 en 1).");
      return;
    }
    setError("");

    const input: MatchInput = {
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      homeGoals: hg,
      awayGoals: ag,
    };
    const found = findAffectedBets(bets, input);

    if (found.length === 0) {
      setError(
        `Geen openstaande bets gevonden voor ${homeTeam} v ${awayTeam}. Controleer de spellingvan de teamnamen.`
      );
      return;
    }

    // Pre-fill outcomes with suggestions
    const initial: OutcomeMap = {};
    for (const s of found) {
      initial[s.bet.id] = s.suggestion === "unknown" ? "skip" : s.suggestion;
    }
    setSuggestions(found);
    setOutcomes(initial);
    setStep("review");
  };

  const setOutcome = (id: string, value: BetStatus | "skip") => {
    setOutcomes((prev) => ({ ...prev, [id]: value }));
  };

  const handleApply = () => {
    let applied = 0;
    for (const [id, outcome] of Object.entries(outcomes)) {
      if (outcome !== "skip") {
        setStatus(id, outcome as BetStatus);
        applied++;
      }
    }
    toast({
      title: `${applied} bet${applied !== 1 ? "s" : ""} bijgewerkt`,
      description: `${homeTeam} ${homeGoals}–${awayGoals} ${awayTeam}`,
      variant: "success",
    });
    onClose();
  };

  const wonCount = Object.values(outcomes).filter((v) => v === "won").length;
  const lostCount = Object.values(outcomes).filter((v) => v === "lost").length;
  const skipCount = Object.values(outcomes).filter((v) => v === "skip").length;

  return (
    <div className="space-y-5">
      {/* Step 1 — score input */}
      {step === "input" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <Swords size={18} className="shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Vul de eindstand in. De app zoekt welke openstaande bets bij deze
              wedstrijd horen en stelt gewonnen/verloren voor.
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <Label>Thuisteam</Label>
              <Input
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="bijv. Nederland"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <span className="mb-2 text-sm font-bold text-muted-foreground">vs</span>
            <div>
              <Label>Uitteam</Label>
              <Input
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="bijv. Japan"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div>
            <Label>Eindstand</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="99"
                value={homeGoals}
                onChange={(e) => setHomeGoals(e.target.value)}
                placeholder="0"
                className="w-20 text-center text-lg font-bold"
              />
              <span className="text-xl font-bold text-muted-foreground">–</span>
              <Input
                type="number"
                min="0"
                max="99"
                value={awayGoals}
                onChange={(e) => setAwayGoals(e.target.value)}
                placeholder="0"
                className="w-20 text-center text-lg font-bold"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-lost/10 px-3 py-2 text-sm text-lost">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Annuleren</Button>
            <Button onClick={handleSearch}>
              <Trophy size={16} /> Zoek bets
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — review & confirm */}
      {step === "review" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("input")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={16} /> Terug
            </button>
            <span className="rounded-full border border-border bg-muted/50 px-3 py-0.5 text-sm font-semibold">
              {homeTeam} {homeGoals}–{awayGoals} {awayTeam}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {suggestions.length} openstaande bet{suggestions.length !== 1 ? "s" : ""} gevonden.
            Pas aan waar nodig en klik op Toepassen.
          </p>

          <div className="space-y-2">
            {suggestions.map(({ bet, reason }) => {
              const current = outcomes[bet.id];
              return (
                <div
                  key={bet.id}
                  className={cn(
                    "rounded-xl border p-3.5 transition-colors",
                    current === "won" && "border-won/30 bg-won/5",
                    current === "lost" && "border-lost/30 bg-lost/5",
                    current === "skip" && "border-border bg-muted/20 opacity-70"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{bet.selection}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {bet.market}
                        {bet.matchLabel ? ` · ${bet.matchLabel}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Odds {formatOdds(bet.odds)} · Inzet {formatEuro(bet.stake)} · Mog. winst{" "}
                        <span className="text-won">{formatEuro(betProfit(bet))}</span>
                      </p>
                      <p className="mt-0.5 text-xs italic text-muted-foreground">
                        {reason}
                      </p>
                    </div>

                    {/* Outcome selector */}
                    <div className="flex shrink-0 overflow-hidden rounded-lg border border-border">
                      {(["won", "lost", "skip"] as const).map((o) => (
                        <button
                          key={o}
                          onClick={() => setOutcome(bet.id, o)}
                          title={OUTCOME_LABELS[o]}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-colors",
                            current === o
                              ? o === "won"
                                ? "bg-won/20 text-won"
                                : o === "lost"
                                  ? "bg-lost/20 text-lost"
                                  : "bg-muted text-muted-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {OUTCOME_ICONS[o]}
                          <span className="hidden sm:inline">{OUTCOME_LABELS[o]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 text-won">
              <CheckCircle2 size={14} /> {wonCount} gewonnen
            </span>
            <span className="flex items-center gap-1.5 text-lost">
              <XCircle size={14} /> {lostCount} verloren
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <HelpCircle size={14} /> {skipCount} overgeslagen
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Annuleren</Button>
            <Button
              onClick={handleApply}
              disabled={wonCount + lostCount === 0}
            >
              <Trophy size={16} /> Toepassen ({wonCount + lostCount})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
