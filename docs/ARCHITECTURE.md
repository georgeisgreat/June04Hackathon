# CredCheck — Architecture

## Overview

CredCheck is a Chrome extension + FastAPI backend that monitors AI chat replies in real time. It detects factual drift, extracts claims, retrieves evidence, and surfaces a credibility score alongside a Context Monitor side panel directly on chat.openai.com.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Chrome Browser  (chat.openai.com)                              │
│                                                                 │
│  ┌──────────────────────────┐   ┌───────────────────────────┐  │
│  │  ChatGPT Page            │   │  Shadow DOM Overlay       │  │
│  │                          │   │                           │  │
│  │  AI reply completes      │   │  ┌─────────────────────┐  │  │
│  │       │                  │   │  │  Score Badge        │  │  │
│  │  MutationObserver fires  │   │  │  (pill on reply)    │  │  │
│  │       │                  │   │  └─────────────────────┘  │  │
│  │  DOM Adapter extracts    │   │                           │  │
│  │  reply text              │   │  ┌─────────────────────┐  │  │
│  │       │                  │   │  │  Context Monitor    │  │  │
│  │  ←────┼──────────────────┼───┼──│  Side Panel         │  │  │
│  │       ↓                  │   │  │                     │  │  │
│  │  Inline Highlighter      │   │  │  GroundingStatus    │  │  │
│  │  (red on contradictions) │   │  │  ProvenanceChart    │  │  │
│  │                          │   │  │  PinnedFacts        │  │  │
│  └──────────────────────────┘   │  │  ResponseAudit      │  │  │
│                                 │  │  Actions            │  │  │
│  ┌──────────────────────────┐   │  └─────────────────────┘  │  │
│  │  Background (SW)         │   └───────────────────────────┘  │
│  │  • Receives reply text   │                                   │
│  │  • POSTs to /score       │                                   │
│  │  • Returns ScoreResponse │                                   │
│  └──────────┬───────────────┘                                   │
└─────────────┼───────────────────────────────────────────────────┘
              │ HTTP POST /score
              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FastAPI Backend  (Railway / Render)                            │
│                                                                 │
│  POST /score  ──→  Fast-path Heuristic                         │
│                         │                                       │
│                   Asserts facts?                                │
│                    No ──→ return score: 1.0 (opinion/chat)     │
│                    Yes ↓                                        │
│                                                                 │
│              ┌──────── Slow-path Pipeline ─────────┐           │
│              │                                     │           │
│              │  1. Claim Extractor                 │           │
│              │     Claude API → structured JSON    │           │
│              │     [{ text, type }]                │           │
│              │                  ↓                  │           │
│              │  2. Evidence Retriever              │           │
│              │     Exa Search per claim            │           │
│              │     (Tavily / Brave as fallback)    │           │
│              │                  ↓                  │           │
│              │  3. Embedding Prefilter             │           │
│              │     cosine similarity               │           │
│              │     rank + trim evidence            │           │
│              │                  ↓                  │           │
│              │  4. LLM Judge                       │           │
│              │     Claude API →                    │           │
│              │     verdict + confidence per claim  │           │
│              │                  ↓                  │           │
│              │  5. Provenance Analyzer             │           │
│              │     Claude API → % breakdown        │           │
│              │     (UserInstructions/Docs/etc)     │           │
│              │                  ↓                  │           │
│              │  6. Score Aggregator                │           │
│              │     overall_score, label, counts    │           │
│              └─────────────────────────────────────┘           │
│                         ↓                                       │
│              ScoreResponse JSON                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Extension

| File | Role |
|------|------|
| `entrypoints/content/index.ts` | Entry — mounts Shadow DOM, starts observer |
| `entrypoints/content/observer.ts` | `MutationObserver` — fires when AI reply stream ends |
| `entrypoints/content/adapter.ts` | ChatGPT DOM selectors (isolated for easy updates) |
| `entrypoints/content/highlighter.ts` | Wraps contradicted sentences in red inline spans |
| `entrypoints/background.ts` | Service worker — `POST /score`, relays result to content |
| `components/Badge.tsx` | Score pill (color + label) attached to reply bubble |
| `components/SidePanel/index.tsx` | Side panel shell, open/close, receives ScoreResponse |
| `components/SidePanel/GroundingStatus.tsx` | Drift alert banner |
| `components/SidePanel/ProvenanceChart.tsx` | Donut chart — provenance % breakdown |
| `components/SidePanel/PinnedFacts.tsx` | User-pinned facts list, stored in `chrome.storage` |
| `components/SidePanel/AnswerSources.tsx` | "What this answer used" source list |
| `components/SidePanel/ResponseAudit.tsx` | Grounded / Assumption / Unsupported / Contradiction counts |
| `components/SidePanel/Actions.tsx` | Pin Fact, Ignore Source, Ask for Evidence, Regenerate |
| `hooks/usePinnedFacts.ts` | `chrome.storage.local` CRUD for pinned facts |
| `lib/api.ts` | Typed fetch wrappers for `POST /score` |
| `types/index.ts` | `ScoreResponse`, `Claim`, `Source`, `ProvenanceBreakdown` |

### Backend

| File | Role |
|------|------|
| `main.py` | FastAPI app, CORS, mounts routers |
| `routers/score.py` | `POST /score` — orchestrates the pipeline |
| `services/heuristic.py` | Fast path — detects factual assertions |
| `services/claim_extractor.py` | Claude API → `[{ text, type }]` |
| `services/evidence_retriever.py` | Exa Search per claim, Tavily fallback |
| `services/scorer.py` | LLM-as-judge → verdict + confidence per claim |
| `services/provenance_analyzer.py` | Claude API → provenance % breakdown |
| `models/schemas.py` | Pydantic: `ScoreRequest`, `ScoreResponse`, `Claim`, `Source` |

---

## Data Flow (step by step)

```
1.  ChatGPT reply stream ends
      └─ observer.ts fires (MutationObserver on [data-message-author-role="assistant"])

2.  Content script sends reply text to background
      └─ chrome.runtime.sendMessage({ type: "SCORE_REQUEST", text })

3.  Background POSTs to FastAPI
      └─ POST http://localhost:8000/score  { text, pinned_facts[] }

4.  Backend fast-path heuristic
      └─ Contains factual assertions?  No → { overall_score: 1.0, label: "Not Factual" }

5.  Claim extraction (Claude API)
      └─ Prompt: extract all factual claims as structured JSON

6.  Evidence retrieval (Exa)
      └─ One search query per claim → top 3 sources each

7.  Embedding prefilter
      └─ Cosine similarity → drop irrelevant evidence chunks

8.  LLM judge (Claude API)
      └─ Per claim: supported / contradicted / unverified + confidence

9.  Provenance analysis (Claude API)
      └─ % breakdown: UserInstructions / UploadedDocs / PriorMessages / ModelAssumptions / ExternalKnowledge

10. Score aggregation
      └─ overall_score = weighted avg(claim confidences)
         label = threshold map
         counts = { grounded, assumption, unsupported, contradiction }

11. ScoreResponse returned to extension
      └─ Badge rendered on reply bubble
         Side panel populated
         Contradicted sentences highlighted inline
         Pinned facts checked for drift
```

---

## API Contract

### `POST /score`

**Request**
```json
{
  "text": "string — the full AI reply text",
  "pinned_facts": ["string", "..."],
  "conversation_context": "string (optional) — prior turns for provenance"
}
```

**Response**
```json
{
  "overall_score": 0.73,
  "label": "Mostly Grounded",
  "drift_detected": true,
  "provenance": {
    "user_instructions": 35,
    "uploaded_docs": 25,
    "prior_messages": 20,
    "model_assumptions": 15,
    "external_knowledge": 5
  },
  "claims": [
    {
      "text": "string",
      "verdict": "supported | contradicted | unverified",
      "confidence": 0.91,
      "sources": [
        { "url": "string", "snippet": "string", "type": "latest_user_instruction | pinned_fact | message | external" }
      ]
    }
  ],
  "audit": {
    "grounded": 3,
    "assumption": 1,
    "unsupported": 0,
    "contradiction": 1
  }
}
```

---

## Score Label Mapping

| Score | Label | Badge Color |
|-------|-------|-------------|
| 0.85 – 1.0 | Well Grounded | Green |
| 0.60 – 0.84 | Mostly Grounded | Yellow |
| 0.35 – 0.59 | Weakly Grounded | Orange |
| 0.00 – 0.34 | High Hallucination Risk | Red |

---

## Key Design Decisions

**Shadow DOM isolation** — All extension UI is injected inside a Shadow DOM container so ChatGPT's styles don't bleed in and vice versa. Tailwind is compiled with a custom prefix to avoid conflicts.

**Adapter pattern for DOM selectors** — `adapter.ts` is the only file that knows ChatGPT-specific selectors. When OpenAI changes their DOM, only this file needs updating.

**Fast-path heuristic** — Conversational or opinion replies skip the full pipeline entirely. This keeps median latency low for non-factual exchanges.

**Pinned Facts in `chrome.storage`** — User-defined ground truths persist across sessions and are sent with every `/score` request so the backend can flag drift against them.

**Claude API for both extraction and judgment** — Using the same model family for claim extraction and LLM-as-judge keeps prompt engineering consistent and simplifies the response parsing contract.

**Mock fallback** — If any API key is missing, the backend returns a deterministic mock `ScoreResponse` so the extension UI is always exercisable during development.
