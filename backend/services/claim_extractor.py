import json
import re
import anthropic

_CLIENT = anthropic.Anthropic()

_SYSTEM = """You are a fact-checking assistant. Extract every distinct factual claim from the given text.
Return ONLY a JSON array. Each item must have:
  - "text": the exact claim as a short sentence
  - "type": one of "fact", "statistic", "date", "attribution"
Do not include opinions, suggestions, or greetings. If there are no factual claims, return [].
"""


async def extract_claims(text: str) -> list[dict]:
    """Extract factual claims from AI reply text using Claude."""
    message = _CLIENT.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=_SYSTEM,
        messages=[{"role": "user", "content": f"Text to analyze:\n\n{text}"}],
    )

    raw = message.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)

    try:
        claims = json.loads(raw)
        return claims if isinstance(claims, list) else []
    except json.JSONDecodeError:
        return []
