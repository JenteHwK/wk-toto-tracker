import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { BetStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const STATUS_META: Record<
  BetStatus,
  { label: string; dot: string; chip: string; text: string }
> = {
  open: {
    label: "Open",
    dot: "bg-open",
    chip: "bg-open/15 text-open border-open/30",
    text: "text-open",
  },
  won: {
    label: "Gewonnen",
    dot: "bg-won",
    chip: "bg-won/15 text-won border-won/30",
    text: "text-won",
  },
  lost: {
    label: "Verloren",
    dot: "bg-lost",
    chip: "bg-lost/15 text-lost border-lost/30",
    text: "text-lost",
  },
};

const icons = {
  open: Clock,
  won: CheckCircle2,
  lost: XCircle,
};

export function StatusBadge({
  status,
  className,
}: {
  status: BetStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = icons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.chip,
        className
      )}
    >
      <Icon size={13} />
      {meta.label}
    </span>
  );
}
