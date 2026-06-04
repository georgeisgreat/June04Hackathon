# CredCheck — Project Meta

> This file is maintained by Claude Code. It tracks deployment history, API directory, and data structures.

---

## Deployment Log

| Date | Version | Environment | Platform | Notes |
|------|---------|-------------|---------|-------|
| - | - | - | - | initialized |

---

## API Directory

| Service | Purpose | Env Variable | Docs | Status |
|---------|---------|-------------|------|--------|
| Claude API | Claim extraction + LLM-as-judge scoring | `ANTHROPIC_API_KEY` | https://docs.anthropic.com | ✅ Active |
| Exa Search | Evidence retrieval (primary) | `EXA_API_KEY` | https://docs.exa.ai | ✅ Active |
| Tavily Search | Evidence retrieval (fallback) | `TAVILY_API_KEY` | https://docs.tavily.com | ⏳ Standby |
| Brave Search | Evidence retrieval (fallback) | `BRAVE_API_KEY` | https://brave.com/search/api | ⏳ Standby |

> ⚠️ Never store actual key values here. Keys live in `.env` (gitignored).

---

## Tech Stack <!-- AUTO -->

| Category | Technology | Version |
|----------|-----------|---------|
| Extension framework | WXT + TypeScript | latest |
| Extension standard | Manifest V3 | - |
| Extension UI | React + Tailwind (Shadow DOM) | - |
| Backend framework | FastAPI (Python) | - |
| Claim extraction | Claude API (`claude-sonnet-4-6`) | - |
| Evidence retrieval | Exa / Tavily / Brave Search API | - |
| LLM judge | Claude API (`claude-sonnet-4-6`) | - |
| Deployment | Railway / Render | - |

---

## Data Structures <!-- AUTO -->

### Score Response (Backend → Extension)

```ts
interface ScoreResponse {
  overall_score: number          // 0.0 – 1.0
  label: string                  // e.g. "Mostly Grounded"
  claims: Claim[]
}

interface Claim {
  text: string
  verdict: "supported" | "contradicted" | "unverified"
  confidence: number             // 0.0 – 1.0
  sources: Source[]
}

interface Source {
  url: string
  snippet: string
}
```

### Score Badge Color Mapping

| Score Range | Label | Color |
|------------|-------|-------|
| 0.85 – 1.0 | Well Grounded | Green |
| 0.60 – 0.84 | Mostly Grounded | Yellow |
| 0.35 – 0.59 | Weakly Grounded | Orange |
| 0.00 – 0.34 | High Hallucination Risk | Red |

---

## Environments

| Environment | Description | Backend URL |
|-------------|-------------|------------|
| development | Local dev, extension points to localhost | `http://localhost:8000` |
| production | Deployed extension, backend on Railway/Render | `https://<your-app>.railway.app` |