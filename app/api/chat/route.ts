import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { ChatMode } from "@/lib/types";

type ChatRequest = {
  mode: ChatMode;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  sharedContext?: string;
  pulledContext?: string;
  selectedContext?: string;
  userName?: string;
  collaboratorName?: string;
};

const prompts: Record<ChatMode, string> = {
  private:
    "You are a GitHub Copilot-style assistant helping the current user during a hackathon. Be concise, practical, and technical. If pulled context from the shared chat is provided, use it as relevant background while keeping the private chat separate.",
  shared:
    "You are the ContextCollab shared AI assistant helping Shreyas and Emily coordinate. Be concise and collaborative. Use the shared context branch as the source of truth.",
  summarize:
    "Summarize selected private chat messages into a short shared-context card. Do not include irrelevant private details. Return only the summary.",
  "pull-context":
    "Summarize selected shared chat messages into a compact note that can be inserted into the current user's private AI chat. Return a concise context block.",
};

function fallbackResponse(body: ChatRequest) {
  if (body.mode === "summarize") {
    return "Shared context summary: selected private chat contains GitHub API and billing/coupon investigation details that may help the team coordinate next steps.";
  }

  if (body.mode === "pull-context") {
    return "Pulled context: use the shared branch as background, especially team decisions and selected GitHub API notes. Keep private reasoning separate.";
  }

  if (body.mode === "shared") {
    return "Realtime shared context is ready. I would align on the API surface, decide what private findings are safe to share, and keep the branch focused on reusable team context.";
  }

  return "I can help with that. For the hackathon MVP, keep the flow practical: identify the GitHub data source, test one API call, then share only the useful result into the team context branch.";
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequest;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ content: fallbackResponse(body) });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const contextBlocks = [
    body.sharedContext ? `Shared context branch:\n${body.sharedContext}` : "",
    body.pulledContext ? `Pulled private context:\n${body.pulledContext}` : "",
    body.selectedContext ? `Selected context:\n${body.selectedContext}` : "",
    body.userName ? `Current user: ${body.userName}` : "",
    body.collaboratorName ? `Collaborator: ${body.collaboratorName}` : "",
  ].filter(Boolean);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: body.mode === "summarize" || body.mode === "pull-context" ? 0.2 : 0.45,
    messages: [
      { role: "system", content: prompts[body.mode] ?? prompts.private },
      ...(contextBlocks.length
        ? [{ role: "system" as const, content: contextBlocks.join("\n\n") }]
        : []),
      ...(body.messages ?? []).map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  });

  return NextResponse.json({
    content: completion.choices[0]?.message?.content ?? fallbackResponse(body),
  });
}
