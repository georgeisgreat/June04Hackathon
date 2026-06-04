import json
import anthropic

_CLIENT = anthropic.Anthropic()

_SYSTEM = """You analyze an AI assistant's reply and estimate what sources of information it likely drew from.
Return ONLY a JSON object with integer percentages summing to 100:
{
  "user_instructions": <int>,
  "uploaded_docs": <int>,
  "prior_messages": <int>,
  "model_assumptions": <int>,
  "external_knowledge": <int>
}

Definitions:
- user_instructions: explicit directives given in the conversation by the user
- uploaded_docs: knowledge from files/documents the user shared
- prior_messages: context from earlier turns in the conversation
- model_assumptions: the model filling gaps with trained assumptions
- external_knowledge: factual world knowledge from training data
"""


async def analyze_provenance(reply_text: str, context: str) -> dict:
    """Estimate provenance breakdown percentages for an AI reply."""
    user_msg = f"Conversation context:\n{context}\n\nAI reply to analyze:\n{reply_text}"

    message = _CLIENT.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=256,
        system=_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )

    raw = message.content[0].text.strip()
    try:
        data = json.loads(raw)
        # Ensure all keys present
        defaults = {
            "user_instructions": 0,
            "uploaded_docs": 0,
            "prior_messages": 0,
            "model_assumptions": 0,
            "external_knowledge": 0,
        }
        defaults.update({k: int(v) for k, v in data.items() if k in defaults})
        return defaults
    except (json.JSONDecodeError, ValueError):
        return {
            "user_instructions": 20,
            "uploaded_docs": 0,
            "prior_messages": 20,
            "model_assumptions": 30,
            "external_knowledge": 30,
        }
