"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Bet, BetCategory, BetLeg, TournamentPhase } from "@/lib/types";
import { CATEGORY_LABELS, TOURNAMENT_PHASES } from "@/lib/types";
import { betProfit, betReturn } from "@/lib/calculations";
import { formatEuro, toIso, toLocalInput } from "@/lib/format";
import { uid } from "@/lib/utils";
import { Input, Select, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface BetFormProps {
  initial?: Bet;
  onSubmit: (bet: Omit<Bet, "createdAt"> & { createdAt?: string }) => void;
  onCancel: () => void;
}

type LegDraft = BetLeg & { dateLocal: string };

const CATEGORIES = Object.keys(CATEGORY_LABELS) as BetCategory[];

export function BetForm({ initial, onSubmit, onCancel }: BetFormProps) {
  const [selection, setSelection] = React.useState(initial?.selection ?? "");
  const [market, setMarket] = React.useState(initial?.market ?? "");
  const [event, setEvent] = React.useState(initial?.event ?? "");
  const [matchLabel, setMatchLabel] = React.useState(initial?.matchLabel ?? "");
  const [category, setCategory] = React.useState<BetCategory>(
    initial?.category ?? "winner"
  );
  const [phase, setPhase] = React.useState<TournamentPhase>(
    initial?.phase ?? "Toernooi-breed"
  );
  const [type, setType] = React.useState<"single" | "combi">(
    initial?.type ?? "single"
  );
  const [isBoost, setIsBoost] = React.useState(initial?.isBoost ?? false);
  const [status, setStatus] = React.useState<Bet["status"]>(
    initial?.status ?? "open"
  );
  const [odds, setOdds] = React.useState(String(initial?.odds ?? ""));
  const [stake, setStake] = React.useState(String(initial?.stake ?? ""));
  const [dateLocal, setDateLocal] = React.useState(
    toLocalInput(initial?.date)
  );
  const [cashout, setCashout] = React.useState(
    initial?.cashout != null ? String(initial.cashout) : ""
  );
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [id, setId] = React.useState(initial?.id ?? "");

  const [legs, setLegs] = React.useState<LegDraft[]>(
    (initial?.legs ?? []).map((l) => ({ ...l, dateLocal: toLocalInput(l.date) }))
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Derived total odds for combi = product of leg odds
  const combiOdds = React.useMemo(
    () => legs.reduce((acc, l) => acc * (Number(l.odds) || 0), legs.length ? 1 : 0),
    [legs]
  );

  const effectiveOdds = type === "combi" && legs.length ? combiOdds : Number(odds);
  const stakeNum = Number(stake) || 0;
  const previewBet = {
    odds: effectiveOdds || 0,
    stake: stakeNum,
  } as Bet;

  const addLeg = () =>
    setLegs((prev) => [
      ...prev,
      {
        id: uid("leg"),
        selection: "",
        market: "Resultaat",
        matchLabel: "",
        odds: 0,
        dateLocal: "",
      },
    ]);

  const updateLeg = (legId: string, patch: Partial<LegDraft>) =>
    setLegs((prev) =>
      prev.map((l) => (l.id === legId ? { ...l, ...patch } : l))
    );

  const removeLeg = (legId: string) =>
    setLegs((prev) => prev.filter((l) => l.id !== legId));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!selection.trim()) e.selection = "Voorspelling is verplicht";
    if (!market.trim()) e.market = "Markt is verplicht";
    if (stakeNum <= 0) e.stake = "Inzet moet groter dan 0 zijn";
    if (type === "single") {
      if (!odds || Number(odds) < 1)
        e.odds = "Odds moeten minimaal 1.00 zijn";
    } else {
      if (legs.length < 2) e.legs = "Een combi heeft minstens 2 selecties";
      if (legs.some((l) => !l.selection.trim() || Number(l.odds) < 1))
        e.legs = "Elke selectie heeft een naam en geldige odds (≥ 1.00)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const cleanedLegs: BetLeg[] | undefined =
      type === "combi"
        ? legs.map((l) => ({
            id: l.id,
            selection: l.selection.trim(),
            market: l.market.trim() || "Resultaat",
            matchLabel: l.matchLabel?.trim() || undefined,
            odds: Number(l.odds),
            date: toIso(l.dateLocal),
          }))
        : undefined;

    onSubmit({
      id: id.trim() || uid("O/1260637/manual"),
      selection: selection.trim(),
      market: market.trim(),
      event: event.trim() || undefined,
      matchLabel: matchLabel.trim() || undefined,
      category,
      phase,
      type,
      isBoost,
      status,
      odds: effectiveOdds,
      stake: stakeNum,
      date: toIso(dateLocal),
      cashout: cashout ? Number(cashout) : undefined,
      notes: notes.trim() || undefined,
      legs: cleanedLegs,
      createdAt: initial?.createdAt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Voorspelling / selectie" error={errors.selection} full>
          <Input
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            placeholder="bijv. Nederland wint"
          />
        </Field>
        <Field label="Markt" error={errors.market} full>
          <Input
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="bijv. WK 2026 — Winnaar"
          />
        </Field>

        <Field label="Categorie">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as BetCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Toernooi fase">
          <Select
            value={phase}
            onChange={(e) => setPhase(e.target.value as TournamentPhase)}
          >
            {TOURNAMENT_PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Type weddenschap">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as "single" | "combi")}
          >
            <option value="single">Single</option>
            <option value="combi">Combi (meerdere legs)</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as Bet["status"])}
          >
            <option value="open">Open</option>
            <option value="won">Gewonnen</option>
            <option value="lost">Verloren</option>
          </Select>
        </Field>

        {type === "single" && (
          <Field label="Odds" error={errors.odds}>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
              placeholder="2.40"
            />
          </Field>
        )}
        <Field label="Inzet (€)" error={errors.stake}>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            placeholder="5.00"
          />
        </Field>

        <Field label="Datum & tijd">
          <Input
            type="datetime-local"
            value={dateLocal}
            onChange={(e) => setDateLocal(e.target.value)}
          />
        </Field>
        <Field label="Cashout-waarde (€, optioneel)">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={cashout}
            onChange={(e) => setCashout(e.target.value)}
            placeholder="—"
          />
        </Field>

        <Field label="Wedstrijd-label (optioneel)">
          <Input
            value={matchLabel}
            onChange={(e) => setMatchLabel(e.target.value)}
            placeholder="bijv. Nederland v Brazilië"
          />
        </Field>
        <Field label="Evenement / periode (optioneel)">
          <Input
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            placeholder="bijv. Eerste 24 wedstrijden"
          />
        </Field>

        <Field label="Bet ID (optioneel)" full>
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="O/1260637/0000000"
            disabled={!!initial}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={isBoost}
            onChange={(e) => setIsBoost(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[hsl(var(--open))]"
          />
          Dit is een boost / special-markt
        </label>

        <Field label="Notities (optioneel)" full>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Eigen aantekeningen…"
          />
        </Field>
      </div>

      {/* Combi legs editor */}
      {type === "combi" && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Selecties (legs)</p>
              <p className="text-xs text-muted-foreground">
                Totale odds (product): {combiOdds ? combiOdds.toFixed(2) : "—"}
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addLeg}>
              <Plus size={14} /> Selectie
            </Button>
          </div>
          {errors.legs && (
            <p className="mb-2 text-xs text-lost">{errors.legs}</p>
          )}
          <div className="space-y-2">
            {legs.map((leg) => (
              <div
                key={leg.id}
                className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-2.5 sm:grid-cols-[1fr_1fr_90px_auto]"
              >
                <Input
                  value={leg.selection}
                  onChange={(e) =>
                    updateLeg(leg.id, { selection: e.target.value })
                  }
                  placeholder="Selectie"
                  className="h-9"
                />
                <Input
                  value={leg.matchLabel ?? ""}
                  onChange={(e) =>
                    updateLeg(leg.id, { matchLabel: e.target.value })
                  }
                  placeholder="Wedstrijd"
                  className="h-9"
                />
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={leg.odds || ""}
                  onChange={(e) =>
                    updateLeg(leg.id, { odds: Number(e.target.value) })
                  }
                  placeholder="Odds"
                  className="h-9"
                />
                <button
                  type="button"
                  onClick={() => removeLeg(leg.id)}
                  aria-label="Verwijder selectie"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-lost/10 hover:text-lost"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {legs.length === 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Nog geen selecties — voeg er minstens 2 toe.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Live preview */}
      {stakeNum > 0 && effectiveOdds >= 1 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Mogelijke uitbetaling:{" "}
            <span className="font-semibold text-foreground">
              {formatEuro(betReturn(previewBet))}
            </span>
          </span>
          <span className="text-muted-foreground">
            Mogelijke winst:{" "}
            <span className="font-semibold text-won">
              {formatEuro(betProfit(previewBet))}
            </span>
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
        <Button type="submit">
          {initial ? "Wijzigingen opslaan" : "Bet toevoegen"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-lost">{error}</p>}
    </div>
  );
}
