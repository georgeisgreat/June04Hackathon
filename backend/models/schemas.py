from pydantic import BaseModel, Field
from typing import Literal


class Source(BaseModel):
    url: str
    snippet: str
    type: str = "external"


class Claim(BaseModel):
    text: str
    verdict: Literal["supported", "contradicted", "unverified"]
    confidence: float = Field(ge=0.0, le=1.0)
    sources: list[Source] = []


class ProvenanceBreakdown(BaseModel):
    user_instructions: int = 0
    uploaded_docs: int = 0
    prior_messages: int = 0
    model_assumptions: int = 0
    external_knowledge: int = 0


class AuditCounts(BaseModel):
    grounded: int = 0
    assumption: int = 0
    unsupported: int = 0
    contradiction: int = 0


class ScoreRequest(BaseModel):
    text: str
    pinned_facts: list[str] = []
    conversation_context: str = ""


class ScoreResponse(BaseModel):
    overall_score: float = Field(ge=0.0, le=1.0)
    label: str
    drift_detected: bool = False
    provenance: ProvenanceBreakdown
    claims: list[Claim]
    audit: AuditCounts
