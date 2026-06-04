// All ChatGPT-specific DOM selectors are isolated here.
// When OpenAI changes their DOM, only this file needs updating.

export const SELECTORS = {
  // Each assistant message turn
  assistantTurn: '[data-message-author-role="assistant"]',
  // The prose container inside a turn
  replyContent: ".markdown.prose",
  // Streaming indicator — present while reply is generating
  streamingCursor: ".result-streaming",
};

export function getReplyText(turnEl: Element): string {
  const prose = turnEl.querySelector(SELECTORS.replyContent);
  return prose?.textContent?.trim() ?? "";
}

export function isStreaming(turnEl: Element): boolean {
  return turnEl.querySelector(SELECTORS.streamingCursor) !== null;
}

export function getConversationContext(): string {
  const turns = document.querySelectorAll("[data-message-author-role]");
  const lines: string[] = [];
  turns.forEach((t) => {
    const role = t.getAttribute("data-message-author-role") ?? "unknown";
    const text = t.textContent?.trim().slice(0, 300) ?? "";
    if (text) lines.push(`[${role}]: ${text}`);
  });
  return lines.slice(-10).join("\n"); // last 10 turns for context
}
