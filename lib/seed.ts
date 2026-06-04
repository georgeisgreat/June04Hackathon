import type { PrivateMessage, SharedMessage } from "./types";

const shreyasPrivateMessages: PrivateMessage[] = [
  {
    id: "shreyas-seed-user-1",
    role: "user",
    author: "Shreyas",
    content: "is there a way to check redeemed or active coupons on my github account",
    timestamp: "10:32 AM",
  },
  {
    id: "shreyas-seed-assistant-1",
    role: "assistant",
    author: "Copilot",
    content:
      "There isn't a direct API to check redeemed or active coupons, but here are some approaches you can try:\n\n1. GitHub GraphQL API - You can query account entitlements and benefits.\n2. Billing REST API - Check your active billing plans and associated discounts.\n3. Web UI Inspection - Sometimes the billing settings page shows active discounts.\n\nWant me to pull the relevant API docs and example queries for you?",
    timestamp: "10:32 AM",
  },
  {
    id: "shreyas-seed-user-2",
    role: "user",
    author: "Shreyas",
    content: "yes, that would be helpful",
    timestamp: "10:33 AM",
  },
  {
    id: "shreyas-seed-assistant-2",
    role: "assistant",
    author: "Copilot",
    content: "Sure - I'll fetch the GraphQL and REST API details along with example queries.",
    timestamp: "10:33 AM",
  },
  {
    id: "shreyas-seed-source-card",
    role: "assistant",
    author: "Copilot",
    content: "GitHub GraphQL & Billing API Docs\nFetched 4 sources.",
    timestamp: "10:34 AM",
    kind: "source-card",
  },
];

const emilyPrivateMessages: PrivateMessage[] = [
  {
    id: "emily-seed-user-1",
    role: "user",
    author: "Emily",
    content: "we need a cleaner way to explain why this is not just another group chat",
    timestamp: "10:36 AM",
  },
  {
    id: "emily-seed-assistant-1",
    role: "assistant",
    author: "Copilot",
    content:
      "Frame it as a shared context branch, not a group chat. The core distinction is control:\n\n1. Private chats stay private by default.\n2. Teammates selectively push useful findings into shared context.\n3. Each person can pull only the shared context they want into their own agent chat.\n\nA concise tagline could be: \"Private AI chats. Shared team context.\"",
    timestamp: "10:36 AM",
  },
  {
    id: "emily-seed-user-2",
    role: "user",
    author: "Emily",
    content: "give me a demo script for the moment shreyas shares something useful",
    timestamp: "10:38 AM",
  },
  {
    id: "emily-seed-assistant-2",
    role: "assistant",
    author: "Copilot",
    content:
      "Demo beat:\n\nShreyas is researching GitHub billing APIs in his private chat. He selects only the useful answer and pushes it to the shared context branch. Emily sees that context appear live, pulls it into her private chat, and asks her own Copilot to turn it into product messaging.",
    timestamp: "10:38 AM",
  },
  {
    id: "emily-seed-source-card",
    role: "assistant",
    author: "Copilot",
    content: "ContextCollab Demo Script\nDrafted 3 presentation beats.",
    timestamp: "10:39 AM",
    kind: "source-card",
  },
];

export function getSeedPrivateMessages(userName: string): PrivateMessage[] {
  const seed =
    userName.toLowerCase() === "emily" ? emilyPrivateMessages : shreyasPrivateMessages;

  return seed.map((message) => ({ ...message }));
}

export const seedSharedMessages = (room: string): SharedMessage[] => [
  {
    id: "shared-system-seed",
    room,
    author: "ContextCollab",
    content:
      "Shared context branch created. Push only the private chat details that are useful for the team.",
    kind: "system",
    timestamp: new Date().toISOString(),
  },
];
