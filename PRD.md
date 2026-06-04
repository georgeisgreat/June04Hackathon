# Product Requirements Document — CredCheck

**Hackathon:** June 04, 2026  
**Deadline:** 3:00 PM  
**Team repo:** https://github.com/georgeisgreat/June04Hackathon

---

## 1. Problem

AI chat tools (ChatGPT, Claude, Copilot) produce fluent, confident-sounding responses that can quietly drift from ground truth. Users — especially in enterprise settings — often only discover hallucinations or weak grounding *after* a bad answer has influenced a decision. There is no ambient signal that tells a user "this reply is risky."

---

## 2. Solution

**CredCheck** is a browser extension + backend scoring service that monitors AI chat replies in real time and surfaces a credibility score for each response — before the user acts on it.

> "Guardrail the quality of your enterprise AI conversation. With one click, fact-check if your AI employee is making things up."

---

## 3. Value Proposition

| User pain | CredCheck answer |
|---|---|
| Can't tell if AI reply is grounded | Real-time credibility score on every reply |
| Hallucinations catch me off guard | Claim-level evidence breakdown |
| No idea where AI is pulling info from | Source attribution per claim |
| Trust erosion in AI-assisted work | Ambient quality layer that builds confidence |

Primary value: **a credibility layer for AI chats** that detects source drift, weak grounding, and hallucination risk in real time.

---

## 4. Target User

**Enterprise knowledge workers** using AI assistants for research, drafting, or decision support — where an uncaught hallucination has real professional or financial consequences.

Secondary: individual power users / researchers who rely heavily on AI-generated content.

---

## 5. Scope (Hackathon MVP)

### In scope
- Chrome extension running on **ChatGPT** (chat.openai.com)
- Real-time score badge on each completed AI reply
- Expandable breakdown: grounding score / hallucination risk / top sources
- FastAPI backend handling claim extraction, evidence retrieval, and scoring

### Out of scope (post-hackathon)
- Support for Claude.ai, Copilot, Gemini, Perplexity
- API-level interception (tool calls, function outputs)
- User accounts, history, or dashboards
- Mobile or Safari support

---

## 6. Technical Architecture

### Extension (MV3)
```
EXTENSION
├── Framework: WXT + TypeScript
├── Manifest V3 (service worker background)
│
├── Content Script  ── runs on chat.openai.com
│   ├── MutationObserver → detects stream-complete AI replies
│   ├── DOM Adapter → ChatGPT-specific selectors
│   └── Shadow DOM → style-isolated overlay
│
├── UI (in Shadow DOM)
│   ├── React + Tailwind
│   └── Score badge → expands to claim breakdown + sources
│
└── Background (service worker)
    └── Relays reply text to backend (no LLM calls client-side)
```

### Backend (Scoring Service)
```
BACKEND
├── FastAPI (Python) — deploy: Railway / Render
│
├── Fast path  → heuristic prefilter
│   └── Does reply assert facts? Does it cite sources?
│
└── Slow path  → grounding pipeline
    ├── Claim extraction ........ Claude API (structured JSON output)
    ├── Evidence retrieval ...... Exa / Tavily / Brave Search API
    ├── Cheap prefilter ......... embedding similarity (claim vs evidence)
    └── LLM-as-judge ............ Claude API → grounding + hallucination score
```

### Data flow
1. Content script detects a completed AI reply via MutationObserver
2. Reply text sent to background service worker
3. Background POSTs text to FastAPI backend
4. Backend runs fast-path heuristic; if facts are asserted, runs slow-path pipeline
5. Pipeline returns `{ score, claims: [{ text, evidence, verdict }] }`
6. Extension renders score badge + expandable breakdown in Shadow DOM overlay

---

## 7. Scoring Output Schema

```json
{
  "overall_score": 0.73,
  "label": "Mostly Grounded",
  "claims": [
    {
      "text": "The Eiffel Tower is 330 meters tall.",
      "verdict": "supported",
      "confidence": 0.91,
      "sources": [
        { "url": "https://...", "snippet": "..." }
      ]
    },
    {
      "text": "It was built in 1887.",
      "verdict": "contradicted",
      "confidence": 0.82,
      "sources": [
        { "url": "https://...", "snippet": "Construction began in 1887 and completed in 1889." }
      ]
    }
  ]
}
```

---

## 8. User Experience

### Score badge states
| Score | Label | Color |
|---|---|---|
| 0.85 – 1.0 | Well Grounded | Green |
| 0.60 – 0.84 | Mostly Grounded | Yellow |
| 0.35 – 0.59 | Weakly Grounded | Orange |
| 0.00 – 0.34 | High Hallucination Risk | Red |

### Interaction flow
1. User is in a ChatGPT conversation
2. AI reply completes → small badge appears in top-right corner of the reply bubble
3. Badge shows score + color label (e.g. "73 — Mostly Grounded")
4. User clicks badge → side panel opens with claim-by-claim breakdown
5. Each claim shows: verdict chip (Supported / Contradicted / Unverified) + source links

---

## 9. APIs & Dependencies

| Component | Technology |
|---|---|
| Extension framework | WXT + TypeScript |
| Extension UI | React + Tailwind (Shadow DOM) |
| Backend framework | FastAPI (Python) |
| Claim extraction | Claude API (`claude-sonnet-4-6`) |
| Evidence retrieval | Exa Search API (primary), Tavily / Brave (fallback) |
| Embedding similarity | `text-embedding-3-small` or Claude embeddings |
| LLM judge | Claude API (`claude-sonnet-4-6`) |
| Deployment | Railway or Render |

---

## 10. Milestones (Today)

| Time | Milestone |
|---|---|
| 10:00 AM | Repo scaffolded, WXT extension boots in Chrome |
| 11:00 AM | MutationObserver fires correctly on ChatGPT reply completion |
| 12:00 PM | Backend `/score` endpoint returns mock JSON |
| 12:30 PM | Score badge renders in Shadow DOM |
| 1:30 PM | **PRD finalized** |
| 2:00 PM | End-to-end: real reply → real score → badge |
| 2:30 PM | Claim breakdown panel working |
| 2:50 PM | Demo rehearsal |
| 3:00 PM | **Submission deadline** |

---

## 11. Future Roadmap

- Support additional chat surfaces (Claude.ai, Copilot, Gemini, Perplexity)
- Intercept tool-call responses and API-level outputs for deeper grounding
- User history and drift tracking across a conversation session
- Enterprise dashboard: aggregate credibility trends across teams
- Configurable trust thresholds and domain-specific evidence sources
- Firefox / Safari ports

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| ChatGPT DOM changes break selectors | Adapter pattern isolates per-site selectors; fast fix path |
| Evidence retrieval too slow (>3s) | Fast-path heuristic skips grounding for non-factual replies |
| Claude API rate limits under demo load | Cache identical reply hashes; mock fallback for demo |
| Shadow DOM injection conflicts with site CSP | Use `chrome.scripting.insertCSS` + isolated world |