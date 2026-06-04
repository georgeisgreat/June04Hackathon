"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import type { ToastState } from "@/lib/types";

type ToastProps = {
  toast: ToastState | null;
  onDismiss: () => void;
};

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  const Icon = toast.tone === "warning" ? TriangleAlert : toast.tone === "success" ? CheckCircle2 : Info;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-line bg-[#161b22] px-4 py-3 text-sm text-[#e6edf3] shadow-glow">
      <Icon className="h-4 w-4 text-[#3fb950]" />
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss toast"
        onClick={onDismiss}
        className="rounded-md p-1 text-[#8b949e] transition hover:bg-[#21262d] hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
