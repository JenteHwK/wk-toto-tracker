import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
  accent?: "primary" | "open" | "won" | "lost" | "neutral";
  valueClassName?: string;
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  open: "bg-open/10 text-open",
  won: "bg-won/10 text-won",
  lost: "bg-lost/10 text-lost",
  neutral: "bg-muted text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "primary",
  valueClassName,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tabular-nums tracking-tight",
              valueClassName
            )}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            accentMap[accent]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
