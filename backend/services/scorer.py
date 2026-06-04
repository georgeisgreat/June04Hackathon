import json
import anthropic

_CLIENT = anthropic.Anthropic()

_SYSTEM = """You are a grounding judge. Given a factual claim and supporting evidence snippets,
determine whether the claim is supported, contradicted, or unverified by the evidence.

Return ONLY a JSON object with:
  - "verdict": "supported" | "contradicted" | "unverified"
  - "confidence": float between 0.0 and 1.0

Rules:
- "supported": evidence clearly backs the claim
- "contradicted": evidence directly conflicts with the claim
- "unverified": evidence is irrelevant, absent, or inconclusive
"""


async def judge_claim(claim_text: str, evidence: list[dict], pinned_facts: list[str]) -> dict:
    """LLM-as-judge: score a single claim against evidence and pinned facts."""
    evidence_block = "\n\n".join(
        f"[Source {i+1}] {e['url']}\n{e['snippet']}" for i, e in enumerate(evidence)
    )
    pinned_block = ""
    if pinned_facts:
        pinned_block = "\n\nUser-pinned facts (treat as ground truth):\n" + "\n".join(
            f"- {f}" for f in pinned_facts
        )

    user_msg = f"Claim: {claim_text}\n\nEvidence:\n{evidence_block}{pinned_block}"

    message = _CLIENT.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=128,
        system=_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )

    raw = message.content[0].text.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"verdict": "unverified", "confidence": 0.5}
