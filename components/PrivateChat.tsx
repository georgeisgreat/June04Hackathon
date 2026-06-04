"use client";

import { Bot, Check, Clock3, Lock, MessageSquareShare, MoreHorizontal, Send, Share2, Sparkles } from "lucide-react";
import type { PrivateMessage } from "@/lib/types";

type PrivateChatProps = {
  userName: string;
  collaboratorName: string;
  messages: PrivateMessage[];
  loading: boolean;
  selectedCount: number;
  pulledContext: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCollaborate: () => void;
  onToggleSelect: (messageId: string) => void;
  onPushOne: (messageId: string) => void;
  onSummarizeOne: (messageId: string) => void;
  onPushSelected: () => void;
  onSummarizeSelected: () => void;
};

function Bubble({ message }: { message: PrivateMessage }) {
  if (message.kind === "source-card") {
    const [title, subtitle] = message.content.split("\n");
    return (
      <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Sparkles className="h-4 w-4 text-[#58a6ff]" />
          {title}
        </div>
        <div className="mt-1 text-xs text-[#8b949e]">{subtitle}</div>
      </div>
    );
  }

  if (message.kind === "pulled-context") {
    return (
      <div className="rounded-lg border border-[#1f6feb] bg-[#0c2d6b]/35 p-3 text-sm leading-6 text-[#c9d1d9]">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#79c0ff]">Pulled context</div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  }

  return (
    <div
      className={
        message.role === "assistant"
          ? "rounded-xl rounded-tl-sm border border-[#30363d] bg-[#161b22] px-4 py-3 text-sm leading-6 text-[#e6edf3]"
          : "rounded-xl rounded-tr-sm border border-[#444c56] bg-[#2d333b] px-4 py-3 text-sm leading-6 text-[#f0f6fc]"
      }
    >
      <div className="whitespace-pre-wrap">{message.content}</div>
    </div>
  );
}

export function PrivateChat({
  userName,
  collaboratorName,
  messages,
  loading,
  selectedCount,
  pulledContext,
  inputValue,
  onInputChange,
  onSend,
  onCollaborate,
  onToggleSelect,
  onPushOne,
  onSummarizeOne,
  onPushSelected,
  onSummarizeSelected,
}: PrivateChatProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-[#21262d] bg-[#0d1117]/72">
      <header className="flex min-h-[76px] items-center gap-3 border-b border-[#21262d] px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold text-white">Hackathon idea brainstorm</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-xs text-[#c9d1d9]">
              <Lock className="h-3 w-3 text-[#3fb950]" />
              Private
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8b949e]">Private chat</p>
        </div>

        <button
          type="button"
          onClick={onCollaborate}
          className="inline-flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm font-medium text-[#e6edf3] transition hover:border-[#58a6ff] hover:text-white"
        >
          <MessageSquareShare className="h-4 w-4 text-[#58a6ff]" />
          Collaborate
        </button>
        <button
          type="button"
          onClick={onPushSelected}
          disabled={selectedCount === 0}
          className="hidden items-center gap-2 rounded-lg bg-[#238636] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:bg-[#21262d] disabled:text-[#6e7681] sm:inline-flex"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          type="button"
          aria-label="More private chat actions"
          className="rounded-lg border border-[#30363d] bg-[#161b22] p-2 text-[#8b949e] transition hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      <div className="border-b border-[#21262d] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b949e]">
          <span className="font-medium text-[#c9d1d9]">Private by default.</span>
          <span>Shared when useful.</span>
          {pulledContext.length > 0 ? (
            <span className="rounded-full border border-[#1f6feb] bg-[#0c2d6b]/35 px-2 py-1 text-[#79c0ff]">
              {pulledContext.length} pulled context block{pulledContext.length === 1 ? "" : "s"} active
            </span>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={`message-row flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser ? (
                  <div className="mt-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#a371f7] to-[#58a6ff]">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                ) : null}

                <div className={`min-w-0 max-w-[86%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2 text-[11px] text-[#6e7681]">
                    <span>{message.author}</span>
                    <Clock3 className="h-3 w-3" />
                    <span>{message.timestamp}</span>
                    {message.shared ? <span className="text-[#3fb950]">Shared</span> : null}
                  </div>
                  <Bubble message={message} />
                  <div className="message-actions flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(message.id)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
                        message.selected
                          ? "border-[#3fb950] bg-[#1a2e1a] text-[#aff5b4]"
                          : "border-[#30363d] bg-[#161b22] text-[#8b949e] hover:text-white"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => onPushOne(message.id)}
                      className="rounded-md border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs text-[#8b949e] transition hover:text-white"
                    >
                      Push to Shared
                    </button>
                    <button
                      type="button"
                      onClick={() => onSummarizeOne(message.id)}
                      className="rounded-md border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs text-[#8b949e] transition hover:text-white"
                    >
                      Summarize & Push
                    </button>
                  </div>
                </div>

                {isUser ? (
                  <div className="mt-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3fb950] text-xs font-bold text-[#0d1117]">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                ) : null}
              </div>
            );
          })}

          {loading ? (
            <div className="flex items-center gap-3 text-sm text-[#8b949e]">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#a371f7] to-[#58a6ff]">
                <Bot className="h-4 w-4 text-white" />
              </div>
              Copilot is thinking...
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[#21262d] px-4 py-3 sm:px-5">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 pb-3">
          <button
            type="button"
            onClick={onPushSelected}
            disabled={selectedCount === 0}
            className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs text-[#c9d1d9] transition hover:text-white disabled:cursor-not-allowed disabled:text-[#6e7681]"
          >
            Share selected history ({selectedCount})
          </button>
          <button
            type="button"
            onClick={onSummarizeSelected}
            disabled={selectedCount === 0}
            className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs text-[#c9d1d9] transition hover:text-white disabled:cursor-not-allowed disabled:text-[#6e7681]"
          >
            Summarize & Push
          </button>
          <span className="text-xs text-[#6e7681]">Sharing with {collaboratorName}</span>
        </div>

        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-xl border border-[#30363d] bg-[#161b22] p-2">
          <input
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask your private Copilot..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-[#6e7681]"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!inputValue.trim() || loading}
            className="rounded-lg bg-[#238636] p-2 text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:bg-[#30363d] disabled:text-[#8b949e]"
            aria-label="Send private message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
