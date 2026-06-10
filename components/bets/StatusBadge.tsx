import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { BetStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const STATUS_META: Record<
  BetStatus,
  {
    label: string;
    dot: string;
    chip: string;
    text: string;
    gradient: string;
    glow: string;
  }
> = {
  open: {
    label: "Open",
    dot: "bg-open",
    chip: "bg-open/12 text-open border-open/30",
    text: "text-open",
    gradient: "gradient-orange text-white",
    glow: "shadow-lg shadow-open/30",
  },
  won: {
    label: "Gewonnen",
    dot: "bg-won",
    chip: "bg-won/12 text-won border-won/30",
    text: "text-won",
    gradient: "gradient-won text-white",
    glow: "shadow-lg shadow-won/30",
  },
  lost: {
    label: "Verloren",
    dot: "bg-lost",
    chip: "bg-lost/12 text-lost border-lost/30",
    text: "text-lost",
    gradient: "gradient-lost text-white",
    glow: "shadow-lg shadow-lost/30",
  },
};

const icons = { open: Clock, won: CheckCircle2, lost: XCircle };

export function StatusBadge({
  status,
  variant = "soft",
  className,
}: {
  status: BetStatus;
  variant?: "soft" | "solid";
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = icons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        variant === "solid"
          ? cn(meta.gradient, meta.glow)
          : cn("border", meta.chip),
        className
      )}
    >
      <Icon size={13} />
      {meta.label}
    </span>
  );
}
