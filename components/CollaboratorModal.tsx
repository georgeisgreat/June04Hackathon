"use client";

import { Copy, Plus, Search, X } from "lucide-react";

type CollaboratorModalProps = {
  open: boolean;
  inviteLink: string;
  userName: string;
  collaboratorName: string;
  onClose: () => void;
  onStart: () => void;
  onCopyInvite: () => void;
};

export function CollaboratorModal({
  open,
  inviteLink,
  userName,
  collaboratorName,
  onClose,
  onStart,
  onCopyInvite,
}: CollaboratorModalProps) {
  if (!open) return null;

  const collaboratorInitial = collaboratorName.charAt(0).toUpperCase();
  const collaboratorEmail =
    collaboratorName.toLowerCase() === "emily" ? "emily@team.com" : "shreyas@team.com";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#30363d] bg-[#161b22] p-5 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Open shared context</h2>
            <p className="mt-1 text-sm text-[#8b949e]">
              Join the room's shared context branch with {collaboratorName}.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close collaborator modal"
            onClick={onClose}
            className="rounded-md p-1 text-[#8b949e] transition hover:bg-[#21262d] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#8b949e]">
          <Search className="h-4 w-4" />
          <input
            className="w-full bg-transparent text-[#e6edf3] outline-none placeholder:text-[#6e7681]"
            placeholder="Search by username or email"
          />
        </label>

        <div className="mt-4 rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#a371f7] text-sm font-bold text-white">
              {collaboratorInitial}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0d1117] bg-[#3fb950]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white">{collaboratorName}</div>
              <div className="text-xs text-[#8b949e]">{collaboratorEmail}</div>
            </div>
            <button
              type="button"
              aria-label={`Select ${collaboratorName}`}
              className="rounded-md border border-[#30363d] p-2 text-[#c9d1d9] transition hover:border-[#3fb950] hover:bg-[#1a2e1a] hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-5 w-full rounded-lg bg-[#238636] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
        >
          Open shared context branch
        </button>

        {inviteLink ? (
          <div className="mt-4 rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
            <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#6e7681]">
              Room link for {userName.toLowerCase() === "emily" ? "Shreyas" : "Emily"}
            </div>
            <div className="mt-2 break-all text-xs text-[#8b949e]">{inviteLink}</div>
            <button
              type="button"
              onClick={onCopyInvite}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#30363d] px-3 py-1.5 text-xs text-[#c9d1d9] transition hover:bg-[#21262d] hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy room invite link
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
