import type { ScoreResponse } from "../types";

const BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://credcheck.railway.app";

export async function fetchScore(
  text: string,
  pinnedFacts: string[],
  conversationContext: string
): Promise<ScoreResponse> {
  const res = await fetch(`${BACKEND_URL}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      pinned_facts: pinnedFacts,
      conversation_context: conversationContext,
    }),
  });

  if (!res.ok) {
    throw new Error(`Backend error ${res.status}`);
  }

  return res.json() as Promise<ScoreResponse>;
}
