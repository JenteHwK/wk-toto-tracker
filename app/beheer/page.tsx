"use client";

import * as React from "react";
import { Plus, Settings, Pencil, Trash2, Database } from "lucide-react";
import { useBetStore } from "@/store/useBetStore";
import { useToastStore } from "@/store/useToastStore";
import type { Bet, BetStatus } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { betProfit } from "@/lib/calculations";
import { formatEuro, formatOdds, formatDate } from "@/lib/format";
import { applyFilters } from "@/lib/filter";
import type { FilterState } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BetForm } from "@/components/bets/BetForm";
import { DataActions } from "@/components/data/DataActions";
import { STATUS_META } from "@/components/bets/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function BeheerPage() {
  const bets = useBetStore((s) => s.bets);
  const hasHydrated = useBetStore((s) => s.hasHydrated);
  const addBet = useBetStore((s) => s.addBet);
  const updateBet = useBetStore((s) => s.updateBet);
  const deleteBet = useBetStore((s) => s.deleteBet);
  const setStatus = useBetStore((s) => s.setStatus);
  const toast = useToastStore((s) => s.toast);

  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Bet | null>(null);
  const [deleting, setDeleting] = React.useState<Bet | null>(null);

  const filters: FilterState = {
    search,
    status: "all",
    category: "all",
    phase: "all",
    team: "",
    sort: "created",
    sortDir: "desc",
  };
  const visible = React.useMemo(
    () => applyFilters(bets, filters),
    [bets, search] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const openAdd = () => {
    setEditing(null);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary">
            <Settings size={16} /> Beheer
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Bets beheren
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Voeg bets toe, bewerk gegevens, pas status en inzet aan of verwijder.
          </p>
        </div>
        <Button size="lg" onClick={openAdd}>
          <Plus size={18} /> Nieuwe bet
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Alle bets ({bets.length})</CardTitle>
          <div className="sm:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoeken…"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!hasHydrated ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Geen bets gevonden.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Selectie</th>
                    <th className="pb-2 pr-3 font-medium">Categorie</th>
                    <th className="pb-2 pr-3 text-right font-medium">Odds</th>
                    <th className="pb-2 pr-3 text-right font-medium">Inzet</th>
                    <th className="pb-2 pr-3 text-right font-medium">Mog. winst</th>
                    <th className="pb-2 pr-3 font-medium">Datum</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((bet) => (
                    <tr
                      key={bet.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2.5 pr-3">
                        <p className="font-medium">{bet.selection}</p>
                        <p className="text-xs text-muted-foreground">
                          {bet.market}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">
                        {CATEGORY_LABELS[bet.category]}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {formatOdds(bet.odds)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">
                        {formatEuro(bet.stake)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-won">
                        {formatEuro(betProfit(bet))}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">
                        {formatDate(bet.date)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Select
                          value={bet.status}
                          onChange={(e) =>
                            setStatus(bet.id, e.target.value as BetStatus)
                          }
                          className={cn(
                            "h-8 w-32 text-xs font-semibold",
                            STATUS_META[bet.status].text
                          )}
                        >
                          <option value="open">Open</option>
                          <option value="won">Gewonnen</option>
                          <option value="lost">Verloren</option>
                        </Select>
                      </td>
                      <td className="py-2.5">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditing(bet);
                              setFormOpen(true);
                            }}
                            aria-label="Bewerken"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleting(bet)}
                            aria-label="Verwijderen"
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-lost/10 hover:text-lost"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Database size={18} className="text-primary" />
          <CardTitle>Data & back-up</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Je data staat lokaal in je browser (localStorage). Exporteer
            regelmatig naar JSON als veilige back-up.
          </p>
          <DataActions />
        </CardContent>
      </Card>

      {/* Add / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Bet bewerken" : "Nieuwe bet toevoegen"}
        description={editing ? editing.id : "Vul de gegevens van je weddenschap in."}
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

      <ConfirmDialog
        open={!!deleting}
        title="Bet verwijderen?"
        description={
          deleting ? `"${deleting.selection}" wordt permanent verwijderd.` : undefined
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
