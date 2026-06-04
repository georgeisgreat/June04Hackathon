"use client";

import { Bot, ChevronLeft, CircleDot, LayoutGrid, MessageSquarePlus, Sparkles, Users } from "lucide-react";

type SidebarProps = {
  userName: string;
};

export function Sidebar({ userName }: SidebarProps) {
  const nav = [
    { label: "New chat", icon: MessageSquarePlus },
    { label: "Agents", icon: Bot },
    { label: "Spaces", icon: LayoutGrid },
    { label: "Spark Preview", icon: Sparkles },
  ];

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[#21262d] bg-[#0d1117]/95 px-3 py-4 text-sm text-[#c9d1d9] lg:flex">
      <div className="mb-5 px-2">
        <div className="text-lg font-semibold tracking-[0] text-white">ContextCollab</div>
        <div className="mt-1 text-xs text-[#8b949e]">Private AI chats. Shared team context.</div>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[#c9d1d9] transition hover:bg-[#161b22] hover:text-white"
          >
            <item.icon className="h-4 w-4 text-[#8b949e]" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-6 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#6e7681]">Today</div>
      <div className="mt-2 space-y-1">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md bg-[#161b22] px-2 py-2 text-left text-white ring-1 ring-[#30363d]"
        >
          <CircleDot className="h-3.5 w-3.5 text-[#3fb950]" />
          Hackathon idea brainstorm
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[#8b949e] transition hover:bg-[#161b22] hover:text-[#c9d1d9]"
        >
          <CircleDot className="h-3.5 w-3.5" />
          API integration help
        </button>
      </div>

      <div className="mt-auto space-y-2 border-t border-[#21262d] pt-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[#8b949e] transition hover:bg-[#161b22] hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Collapse
        </button>
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3fb950] text-xs font-bold text-[#0d1117]">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm text-white">{userName}</div>
            <div className="flex items-center gap-1 text-xs text-[#8b949e]">
              <Users className="h-3 w-3" />
              Copilot Free
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
