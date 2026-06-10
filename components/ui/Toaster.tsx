"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/store/useToastStore";
import { cn } from "@/lib/utils";

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-won" />,
  error: <XCircle size={18} className="text-lost" />,
  info: <Info size={18} className="text-primary" />,
  warning: <AlertTriangle size={18} className="text-open" />,
};

const accents: Record<ToastVariant, string> = {
  success: "border-l-won",
  error: "border-l-lost",
  info: "border-l-primary",
  warning: "border-l-open",
};

export function Toaster() {
  const [mounted, setMounted] = React.useState(false);
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex animate-toast-in items-start gap-3 rounded-2xl border-l-4 glass-strong p-4 shadow-card",
            accents[t.variant]
          )}
        >
          <div className="mt-0.5 shrink-0">{icons[t.variant]}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Sluiten"
            className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
