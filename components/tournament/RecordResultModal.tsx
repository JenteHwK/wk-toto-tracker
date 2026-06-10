"use client";

import * as React from "react";
import { Trophy, Trash2, Zap } from "lucide-react";
import type { ResolvedMatch } from "@/lib/tournament/types";
import { PHASE_LABELS } from "@/lib/tournament/types";
import { useTournamentStore } from "@/store/useTournamentStore";
import { useBetStore } from "@/store/useBetStore";
import { useToastStore } from "@/store/useToastStore";
import { findAffectedBets } from "@/lib/matchResult";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RecordResultModal({
  match,
  onClose,
}: {
  match: ResolvedMatch | null;
  onClose: () => void;
}) {
  const recordResult = useTournamentStore((s) => s.recordResult);
  const clearResult = useTournamentStore((s) => s.clearResult);
  const bets = useBetStore((s) => s.bets);
  const setStatus = useBetStore((s) => s.setStatus);
  const toast = useToastStore((s) => s.toast);

  const [home, setHome] = React.useState("");
  const [away, setAway] = React.useState("");

  React.useEffect(() => {
    setHome(match?.result ? String(match.result.homeGoals) : "");
    setAway(match?.result ? String(match.result.awayGoals) : "");
  }, [match]);

  if (!match) return null;
  const open = !!match;

  const submit = () => {
    const hg = parseInt(home);
    const ag = parseInt(away);
    if (isNaN(hg) || isNaN(ag) || hg < 0 || ag < 0) {
      toast({ title: "Vul een geldige uitslag in", variant: "error" });
      return;
    }
    if (match.phase !== "group" && hg === ag) {
      toast({
        title: "Geen gelijkspel in knockout",
        description: "Voer de beslissende uitslag in (na verlenging/penalty's).",
        variant: "warning",
      });
      return;
    }

    recordResult(match.id, { homeGoals: hg, awayGoals: ag });

    // Auto-settle coupled single bets (combi's blijven handmatig).
    let settled = 0;
    if (match.home && match.away) {
      const affected = findAffectedBets(bets, {
        homeTeam: match.home.name,
        awayTeam: match.away.name,
        homeGoals: hg,
        awayGoals: ag,
      });
      for (const a of affected) {
        if (a.suggestion !== "unknown" && a.bet.type !== "combi") {
          setStatus(a.bet.id, a.suggestion);
          settled++;
        }
      }
    }

    const winner =
      hg > ag ? match.home?.name : ag > hg ? match.away?.name : "Gelijkspel";

    toast({
      title: "Uitslag opgeslagen",
      description: `${match.home?.name} ${hg}–${ag} ${match.away?.name}${
        settled ? ` · ${settled} bet(s) automatisch bijgewerkt` : ""
      }${match.phase !== "group" && winner ? ` · ${winner} door` : ""}`,
      variant: "success",
    });
    onClose();
  };

  const remove = () => {
    clearResult(match.id);
    toast({ title: "Uitslag gewist", variant: "info" });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Uitslag invoeren"
      description={match.group ? `Groep ${match.group}` : PHASE_LABELS[match.phase]}
      className="max-w-md"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamSide flag={match.home?.flag} name={match.home?.name} />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              className="h-14 w-16 text-center font-display text-2xl font-bold"
              placeholder="0"
            />
            <span className="text-xl font-bold text-muted-foreground">–</span>
            <Input
              type="number"
              min="0"
              value={away}
              onChange={(e) => setAway(e.target.value)}
              className="h-14 w-16 text-center font-display text-2xl font-bold"
              placeholder="0"
            />
          </div>
          <TeamSide flag={match.away?.flag} name={match.away?.name} align="right" />
        </div>

        {match.phase !== "group" && (
          <p className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <Zap size={13} className="text-primary" />
            De winnaar schuift automatisch door naar de volgende ronde.
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          {match.result ? (
            <Button variant="ghost" onClick={remove} className="text-lost">
              <Trash2 size={15} /> Wissen
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button onClick={submit}>
              <Trophy size={16} /> Opslaan
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TeamSide({
  flag,
  name,
  align = "left",
}: {
  flag?: string;
  name?: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={
        align === "right" ? "text-right" : "text-left"
      }
    >
      <div className="text-3xl">{flag ?? "⚽"}</div>
      <div className="mt-1 font-display text-sm font-bold leading-tight">
        {name ?? "TBD"}
      </div>
    </div>
  );
}
