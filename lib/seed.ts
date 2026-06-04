import type { PrivateMessage, SharedMessage } from "./types";

export const seedPrivateMessages: PrivateMessage[] = [
  {
    id: "seed-user-1",
    role: "user",
    author: "Shreyas",
    content: "is there a way to check redeemed or active coupons on my github account",
    timestamp: "10:32 AM",
  },
  {
    id: "seed-assistant-1",
    role: "assistant",
    author: "Copilot",
    content:
      "There isn't a direct API to check redeemed or active coupons, but here are some approaches you can try:\n\n1. GitHub GraphQL API - You can query account entitlements and benefits.\n2. Billing REST API - Check your active billing plans and associated discounts.\n3. Web UI Inspection - Sometimes the billing settings page shows active discounts.\n\nWant me to pull the relevant API docs and example queries for you?",
    timestamp: "10:32 AM",
  },
  {
    id: "seed-user-2",
    role: "user",
    author: "Shreyas",
    content: "yes, that would be helpful",
    timestamp: "10:33 AM",
  },
  {
    id: "seed-assistant-2",
    role: "assistant",
    author: "Copilot",
    content: "Sure - I'll fetch the GraphQL and REST API details along with example queries.",
    timestamp: "10:33 AM",
  },
  {
    id: "seed-source-card",
    role: "assistant",
    author: "Copilot",
    content: "GitHub GraphQL & Billing API Docs\nFetched 4 sources.",
    timestamp: "10:34 AM",
    kind: "source-card",
  },
];

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
