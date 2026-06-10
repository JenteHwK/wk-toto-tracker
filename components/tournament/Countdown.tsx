"use client";

import * as React from "react";
import { Clock, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  date?: string;
  className?: string;
}

function diffParts(target: number, now: number) {
  let ms = target - now;
  const past = ms < 0;
  ms = Math.abs(ms);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { past, d, h, m, s };
}

export function Countdown({ date, className }: CountdownProps) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!date) return null;
  const target = new Date(date).getTime();

  if (now === null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        <Clock size={12} className="mr-1 inline" />…
      </span>
    );
  }

  const { past, d, h, m, s } = diffParts(target, now);

  // "Live" window: kicked off within the last ~2 hours.
  if (past && target > now - 2 * 3600000) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-lost/15 px-2 py-0.5 text-xs font-bold text-lost",
          className
        )}
      >
        <Radio size={11} className="animate-pulse" /> LIVE
      </span>
    );
  }

  if (past) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Afgelopen
      </span>
    );
  }

  const label =
    d > 0 ? `${d}d ${h}u ${m}m` : h > 0 ? `${h}u ${m}m ${s}s` : `${m}m ${s}s`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums",
        d === 0 && h < 6 ? "text-open" : "text-muted-foreground",
        className
      )}
    >
      <Clock size={12} /> Nog {label}
    </span>
  );
}
