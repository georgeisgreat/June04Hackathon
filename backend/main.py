from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.score import router as score_router

app = FastAPI(title="CredCheck Scoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Chrome extension origin varies; restrict in prod
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(score_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
