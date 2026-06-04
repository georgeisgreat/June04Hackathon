# ContextCollab

Private AI chats. Shared team context.

ContextCollab is a deployable Next.js hackathon MVP for teams using AI agents. A user starts in a private Copilot-style AI chat, clicks **Collaborate**, adds Emily, and opens a realtime shared context branch. Private chats stay local and private. Users choose what to push into shared context and what to pull back into their own private chat.

Core principle: **Private by default. Shared when useful.**

## Features

- Private Copilot-style chat for each user.
- Realtime shared context branch powered by Ably.
- Select private messages and push them to shared context.
- Summarize selected private history before sharing.
- Pull selected shared context back into a private chat.
- Server-side OpenAI route for private/shared/summarize/pull-context modes.
- Graceful fallback when `OPENAI_API_KEY` or `NEXT_PUBLIC_ABLY_KEY` is missing.

## Demo URLs

```txt
/?room=demo-room&user=Shreyas
/?room=demo-room&user=Emily
```

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
OPENAI_API_KEY=
NEXT_PUBLIC_ABLY_KEY=
```

`OPENAI_API_KEY` is only used in `app/api/chat/route.ts` and is never exposed to the browser. `NEXT_PUBLIC_ABLY_KEY` is safe for this hackathon demo. If it is missing, ContextCollab falls back to local-only shared chat.

## Build

```bash
npm run build
```

The app is ready to deploy on Vercel.
