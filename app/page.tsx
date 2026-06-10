"use client";

import * as React from "react";
import { Plus, ClipboardCheck, ListChecks } from "lucide-react";
import { useBetStore } from "@/store/useBetStore";
import { useToastStore } from "@/store/useToastStore";
import { computeStats } from "@/lib/calculations";
import { applyFilters, DEFAULT_FILTERS } from "@/lib/filter";
import type { Bet, FilterState } from "@/lib/types";
import { Hero } from "@/components/dashboard/Hero";
import { BentoStats } from "@/components/dashboard/BentoStats";
import { DashboardSkeleton, BetCardSkeleton } from "@/components/ui/Skeleton";
import { BetFilters } from "@/components/bets/BetFilters";
import { BetList } from "@/components/bets/BetList";
import { BetForm } from "@/components/bets/BetForm";
import { MatchResultWizard } from "@/components/match/MatchResultWizard";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const bets = useBetStore((s) => s.bets);
  const hasHydrated = useBetStore((s) => s.hasHydrated);
  const addBet = useBetStore((s) => s.addBet);
  const updateBet = useBetStore((s) => s.updateBet);
  const deleteBet = useBetStore((s) => s.deleteBet);
  const toast = useToastStore((s) => s.toast);

  const [filters, setFilters] = React.useState<FilterState>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = React.useState(false);
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Bet | null>(null);
  const [deleting, setDeleting] = React.useState<Bet | null>(null);

  const stats = React.useMemo(() => computeStats(bets), [bets]);
  const visible = React.useMemo(
    () => applyFilters(bets, filters),
    [bets, filters]
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (bet: Bet) => {
    setEditing(bet);
    setFormOpen(true);
  };

  const handleSubmit = (bet: Omit<Bet, "createdAt"> & { createdAt?: string }) => {
    if (editing) {
      updateBet(editing.id, bet);
      toast({ title: "Bet bijgewerkt", description: bet.selection, variant: "success" });
    } else {
      addBet(bet);
      toast({ title: "Bet toegevoegd", description: bet.selection, variant: "success" });
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      {hasHydrated ? (
        <Hero stats={stats} />
      ) : (
        <div className="h-72 animate-pulse rounded-3xl glass" />
      )}

      {/* Action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Overzicht & statistieken
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setWizardOpen(true)}>
            <ClipboardCheck size={17} /> Uitslag invoeren
          </Button>
          <Button onClick={openAdd}>
            <Plus size={17} /> Nieuwe bet
          </Button>
        </div>
      </div>

      {/* Stats */}
      {hasHydrated ? <BentoStats stats={stats} /> : <DashboardSkeleton />}

      {/* Bets */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ListChecks size={16} />
          </span>
          <h2 className="font-display text-xl font-bold tracking-tight">
            Wedstrijdschema &amp; bets
          </h2>
        </div>
        <BetFilters
          bets={bets}
          filters={filters}
          onChange={setFilters}
          resultCount={visible.length}
        />
        {hasHydrated ? (
          <BetList bets={visible} onEdit={openEdit} onDelete={setDeleting} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <BetCardSkeleton key={i} />
            ))}
          </div>
        )}
      </section>

      {/* Add / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Bet bewerken" : "Nieuwe bet toevoegen"}
        description={
          editing ? editing.id : "Vul de gegevens van je weddenschap in."
        }
        className="max-w-2xl"
      >
        <BetForm
          key={editing?.id ?? "new"}
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      {/* Match result wizard */}
      <Modal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Wedstrijduitslag invoeren"
        description="De app zoekt welke openstaande bets bij deze wedstrijd horen en stelt het resultaat voor."
        className="max-w-xl"
      >
        <MatchResultWizard onClose={() => setWizardOpen(false)} />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Bet verwijderen?"
        description={
          deleting
            ? `"${deleting.selection}" wordt permanent verwijderd.`
            : undefined
        }
        confirmLabel="Verwijderen"
        onConfirm={() => {
          if (deleting) {
            deleteBet(deleting.id);
            toast({
              title: "Bet verwijderd",
              description: deleting.selection,
              variant: "warning",
            });
          }
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
