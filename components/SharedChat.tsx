"use client";

import { Bot, Check, Copy, Download, Radio, Send, Share2, Users, WifiOff, X } from "lucide-react";
import type { SharedMessage } from "@/lib/types";

type SharedChatProps = {
  room: string;
  userName: string;
  collaboratorName: string;
  messages: SharedMessage[];
  selectedIds: string[];
  inputValue: string;
  realtimeReady: boolean;
  inviteLink: string;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onToggleSelect: (messageId: string) => void;
  onPullSelected: () => void;
  onCopyInvite: () => void;
};

function kindLabel(kind: SharedMessage["kind"]) {
  if (kind === "summary") return "Summary";
  if (kind === "context") return "Context";
  if (kind === "ai") return "Shared AI";
  if (kind === "system") return "System";
  return "Message";
}

export function SharedChat({
  room,
  userName,
  collaboratorName,
  messages,
  selectedIds,
  inputValue,
  realtimeReady,
  inviteLink,
  onClose,
  onInputChange,
  onSend,
  onToggleSelect,
  onPullSelected,
  onCopyInvite,
}: SharedChatProps) {
  return (
    <section className="flex h-screen w-full min-w-0 flex-col bg-[#101620] lg:w-[42rem]">
      <header className="flex min-h-[76px] items-center gap-3 border-b border-[#21262d] px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f6feb]">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-white">Shared context branch</h2>
            <span className="rounded-full border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs text-[#c9d1d9]">
              {room}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8b949e]">{userName} and {collaboratorName}</p>
        </div>
        <button
          type="button"
          onClick={onPullSelected}
          disabled={selectedIds.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-[#c9d1d9] transition hover:text-white disabled:cursor-not-allowed disabled:text-[#6e7681]"
        >
          <Download className="h-4 w-4" />
          Pull
        </button>
        <button
          type="button"
          aria-label="Close shared chat"
          onClick={onClose}
          className="rounded-lg border border-[#30363d] bg-[#161b22] p-2 text-[#8b949e] transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="border-b border-[#21262d] px-4 py-3">
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            realtimeReady
              ? "border-[#238636] bg-[#1a2e1a] text-[#aff5b4]"
              : "border-[#9e6a03] bg-[#341a00] text-[#ffdf8b]"
          }`}
        >
          {realtimeReady ? <Radio className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {realtimeReady
            ? "Realtime is configured. Everyone in this room sees shared context live."
            : "Realtime is not configured. Using local-only shared chat until NEXT_PUBLIC_ABLY_KEY is set."}
        </div>
        {inviteLink ? (
          <button
            type="button"
            onClick={onCopyInvite}
            className="mt-2 inline-flex max-w-full items-center gap-2 rounded-md border border-[#30363d] px-2.5 py-1.5 text-xs text-[#8b949e] transition hover:text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="truncate">Copy Emily invite link</span>
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-3">
          {messages.map((message) => {
            const selected = selectedIds.includes(message.id);
            return (
              <article
                key={message.id}
                className={`rounded-xl border p-3 transition ${
                  selected ? "border-[#3fb950] bg-[#1a2e1a]/55" : "border-[#30363d] bg-[#161b22]"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#58a6ff] text-xs font-bold text-[#0d1117]">
                    {message.kind === "ai" ? <Bot className="h-4 w-4" /> : message.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">{message.author}</div>
                    <div className="text-[11px] text-[#6e7681]">{new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
                  </div>
                  <span className="rounded-full border border-[#30363d] px-2 py-1 text-[11px] text-[#8b949e]">
                    {kindLabel(message.kind)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleSelect(message.id)}
                    className={`rounded-md p-1.5 transition ${
                      selected ? "bg-[#238636] text-white" : "bg-[#0d1117] text-[#8b949e] hover:text-white"
                    }`}
                    aria-label="Select shared message"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-6 text-[#c9d1d9]">{message.content}</div>
                {message.source?.label ? (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#0d1117] px-2 py-1 text-[11px] text-[#8b949e]">
                    <Share2 className="h-3 w-3" />
                    {message.source.label}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#21262d] p-4">
        <div className="flex items-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] p-2">
          <input
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder="Add a shared context note..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-[#6e7681]"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!inputValue.trim()}
            className="rounded-lg bg-[#1f6feb] p-2 text-white transition hover:bg-[#388bfd] disabled:cursor-not-allowed disabled:bg-[#30363d] disabled:text-[#8b949e]"
            aria-label="Send shared message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
