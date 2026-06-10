"use client";

import * as React from "react";
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  DatabaseBackup,
  ShieldCheck,
} from "lucide-react";
import { useBetStore } from "@/store/useBetStore";
import { useToastStore } from "@/store/useToastStore";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Bet } from "@/lib/types";

const BACKUP_KEY = "wk-toto-backup";

export function DataActions() {
  const bets = useBetStore((s) => s.bets);
  const exportPayload = useBetStore((s) => s.exportPayload);
  const importBets = useBetStore((s) => s.importBets);
  const resetToSeed = useBetStore((s) => s.resetToSeed);
  const clearAll = useBetStore((s) => s.clearAll);
  const toast = useToastStore((s) => s.toast);

  const fileRef = React.useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = React.useState<null | "reset" | "clear">(null);
  const [lastBackup, setLastBackup] = React.useState<string | null>(null);

  // Automatic backup to localStorage whenever bets change.
  React.useEffect(() => {
    const payload = JSON.stringify({
      savedAt: new Date().toISOString(),
      bets,
    });
    localStorage.setItem(BACKUP_KEY, payload);
    setLastBackup(new Date().toLocaleString("nl-NL"));
  }, [bets]);

  const download = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    download(exportPayload(), `wk-toto-bets-${stamp}.json`);
    toast({
      title: "Geëxporteerd",
      description: `${bets.length} bets opgeslagen als JSON.`,
      variant: "success",
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incoming: Bet[] = Array.isArray(parsed)
          ? parsed
          : parsed?.bets;
        if (!Array.isArray(incoming)) throw new Error("Geen geldige bets-array");
        const count = importBets(incoming, "merge");
        toast({
          title: "Geïmporteerd",
          description: `${count} bets samengevoegd met je huidige data.`,
          variant: "success",
        });
      } catch (err) {
        toast({
          title: "Import mislukt",
          description:
            err instanceof Error ? err.message : "Onbekend JSON-formaat.",
          variant: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleBackupDownload = () => {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return;
    download(JSON.parse(raw), `wk-toto-backup-${Date.now()}.json`);
    toast({ title: "Back-up gedownload", variant: "info" });
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={handleExport} className="justify-start">
          <Download size={16} /> Exporteer naar JSON
        </Button>
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          className="justify-start"
        >
          <Upload size={16} /> Importeer uit JSON
        </Button>
        <Button
          variant="outline"
          onClick={handleBackupDownload}
          className="justify-start"
        >
          <DatabaseBackup size={16} /> Download laatste back-up
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirm("reset")}
          className="justify-start"
        >
          <RotateCcw size={16} /> Herstel voorbeelddata
        </Button>
        <Button
          variant="destructive"
          onClick={() => setConfirm("clear")}
          className="justify-start sm:col-span-2"
        >
          <Trash2 size={16} /> Wis alle bets
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck size={13} className="text-won" />
        Automatische back-up actief
        {lastBackup && ` · laatst: ${lastBackup}`}
      </p>

      <ConfirmDialog
        open={confirm === "reset"}
        title="Voorbeelddata herstellen?"
        description="Dit vervangt je huidige bets door de oorspronkelijke WK-data. Maak eerst een export als je je data wilt bewaren."
        confirmLabel="Herstellen"
        destructive={false}
        onConfirm={() => {
          resetToSeed();
          setConfirm(null);
          toast({ title: "Voorbeelddata hersteld", variant: "info" });
        }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "clear"}
        title="Alle bets wissen?"
        description="Al je bets worden permanent verwijderd. Deze actie kan niet ongedaan worden gemaakt."
        confirmLabel="Alles wissen"
        onConfirm={() => {
          clearAll();
          setConfirm(null);
          toast({ title: "Alle bets gewist", variant: "warning" });
        }}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
