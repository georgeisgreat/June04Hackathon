import os
import httpx
from exa_py import Exa

_exa: Exa | None = None


def _get_exa() -> Exa:
    global _exa
    if _exa is None:
        _exa = Exa(api_key=os.environ["EXA_API_KEY"])
    return _exa


async def retrieve_evidence(claim_text: str, num_results: int = 3) -> list[dict]:
    """Return top sources for a claim. Falls back to Tavily if Exa fails."""
    try:
        return await _exa_search(claim_text, num_results)
    except Exception:
        return await _tavily_search(claim_text, num_results)


async def _exa_search(query: str, num_results: int) -> list[dict]:
    exa = _get_exa()
    result = exa.search_and_contents(
        query,
        num_results=num_results,
        use_autoprompt=True,
        text={"max_characters": 400},
    )
    return [
        {"url": r.url, "snippet": (r.text or "")[:400], "type": "external"}
        for r in result.results
    ]


async def _tavily_search(query: str, num_results: int) -> list[dict]:
    api_key = os.environ.get("TAVILY_API_KEY", "")
    if not api_key:
        return []

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": query,
                "max_results": num_results,
                "search_depth": "basic",
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return [
            {"url": r["url"], "snippet": r.get("content", "")[:400], "type": "external"}
            for r in data.get("results", [])
        ]
