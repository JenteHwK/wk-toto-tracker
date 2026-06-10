"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id"> & { duration?: number }) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toast: ({ duration = 3500, ...rest }) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, ...rest }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helper for non-component callers. */
export const toast = (args: Parameters<ToastState["toast"]>[0]) =>
  useToastStore.getState().toast(args);
