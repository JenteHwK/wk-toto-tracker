"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Bevestigen",
  cancelLabel = "Annuleren",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} className="max-w-md">
      <div className="flex gap-4">
        <div
          className={
            destructive
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lost/15 text-lost"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
          }
        >
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "destructive" : "default"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
