# CredCheck

> Guardrail the quality of your enterprise AI conversation. With one click, fact-check if your AI employee is making things up.

A browser extension + backend scoring service that monitors AI chat replies in real time and surfaces a **credibility score** for each response — before you act on it.

---

## Quick Start <!-- AUTO -->

### Extension

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Build for production
npm run build
```

Load into Chrome: go to `chrome://extensions` → enable Developer mode → Load unpacked → select the `dist/` folder.

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy env vars
cp .env.example .env  # fill in your API keys

# Start dev server
uvicorn main:app --reload --port 8000
```

---

## Project Structure <!-- AUTO -->

```
June04Hackathon/
├── extension/                  # WXT + TypeScript browser extension
│   ├── entrypoints/
│   │   ├── content/           # Content script (ChatGPT DOM injection)
│   │   └── background/        # Service worker (request relay)
│   ├── components/            # React UI components (inside Shadow DOM)
│   ├── utils/                 # DOM adapter, scoring helpers
│   └── wxt.config.ts
│
├── backend/                    # FastAPI scoring service
│   ├── main.py                # Entry point, routes
│   ├── scorer/
│   │   ├── extractor.py       # Claim extraction (Claude API)
│   │   ├── retriever.py       # Evidence retrieval (Exa / Tavily)
│   │   └── judge.py           # LLM-as-judge (Claude API)
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                       # Project documentation
│   └── PROJECT_META.md        # Deployment log, API directory, data structures
│
├── PRD.md                      # Product requirements document
└── README.md
```

---

## Feature Map <!-- AUTO -->

> Looking to change something? Find the right file:

| Feature | File Path | Description |
|---------|-----------|-------------|
| ChatGPT DOM detection | `extension/entrypoints/content/` | MutationObserver catches completed replies |
| Score badge UI | `extension/components/` | React components rendered inside Shadow DOM |
| Request relay | `extension/entrypoints/background/` | Service worker forwards text to backend |
| Claim extraction | `backend/scorer/extractor.py` | Claude API structured JSON output |
| Evidence retrieval | `backend/scorer/retriever.py` | Exa / Tavily search |
| Scoring judgment | `backend/scorer/judge.py` | LLM-as-judge outputs grounding score |
| API routes | `backend/main.py` | `POST /score` main endpoint |

---

## Environment Variables <!-- AUTO -->

Configure in `backend/.env`:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API (claim extraction + LLM judge) |
| `EXA_API_KEY` | Exa Search evidence retrieval (primary) |
| `TAVILY_API_KEY` | Tavily evidence retrieval (fallback) |
| `BRAVE_API_KEY` | Brave Search (fallback) |

---

## Build & Deploy <!-- AUTO -->

```bash
# Package extension
npm run build
# → dist/ folder, load locally or upload to Chrome Web Store

# Deploy backend to Railway
railway up

# Or deploy to Render (connect GitHub repo for auto-deploy)
```

---

## Dependencies <!-- AUTO -->

**Extension**

| Package | Purpose |
|---------|---------|
| wxt | Manifest V3 extension build framework |
| react | UI inside Shadow DOM |
| tailwindcss | Styling (Shadow DOM isolated) |
| typescript | Type safety |

**Backend**

| Package | Purpose |
|---------|---------|
| fastapi | Web framework |
| anthropic | Claude API SDK |
| exa-py | Exa Search SDK |
| uvicorn | ASGI server |