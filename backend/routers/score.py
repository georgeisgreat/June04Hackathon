import asyncio
from fastapi import APIRouter
from models.schemas import ScoreRequest, ScoreResponse, Claim, Source, ProvenanceBreakdown, AuditCounts
from services.heuristic import is_factual
from services.claim_extractor import extract_claims
from services.evidence_retriever import retrieve_evidence
from services.scorer import judge_claim
from services.provenance_analyzer import analyze_provenance

router = APIRouter()

_SCORE_LABELS = [
    (0.85, "Well Grounded"),
    (0.60, "Mostly Grounded"),
    (0.35, "Weakly Grounded"),
    (0.00, "High Hallucination Risk"),
]


def _score_to_label(score: float) -> str:
    for threshold, label in _SCORE_LABELS:
        if score >= threshold:
            return label
    return "High Hallucination Risk"


def _mock_response() -> ScoreResponse:
    """Returned when API keys are absent — keeps UI exercisable during dev."""
    return ScoreResponse(
        overall_score=0.73,
        label="Mostly Grounded",
        drift_detected=True,
        provenance=ProvenanceBreakdown(
            user_instructions=35,
            uploaded_docs=25,
            prior_messages=20,
            model_assumptions=15,
            external_knowledge=5,
        ),
        claims=[
            Claim(
                text="This marketplace lets babysitters compete for jobs.",
                verdict="contradicted",
                confidence=0.88,
                sources=[
                    Source(
                        url="https://example.com/pinned",
                        snippet="User stated: 'Do not position it as a marketplace.'",
                        type="pinned_fact",
                    )
                ],
            ),
            Claim(
                text="Parents choose from profiles, reviews, and ratings.",
                verdict="supported",
                confidence=0.71,
                sources=[
                    Source(
                        url="https://example.com/source1",
                        snippet="Trust-based networks rely on personal recommendations.",
                        type="external",
                    )
                ],
            ),
        ],
        audit=AuditCounts(grounded=3, assumption=1, unsupported=0, contradiction=1),
    )


@router.post("/score", response_model=ScoreResponse)
async def score(req: ScoreRequest):
    import os

    if not os.environ.get("ANTHROPIC_API_KEY") or not os.environ.get("EXA_API_KEY"):
        return _mock_response()

    if not is_factual(req.text):
        return ScoreResponse(
            overall_score=1.0,
            label="Not Factual",
            drift_detected=False,
            provenance=ProvenanceBreakdown(prior_messages=50, model_assumptions=50),
            claims=[],
            audit=AuditCounts(),
        )

    # Run claim extraction and provenance analysis concurrently
    raw_claims, provenance_data = await asyncio.gather(
        extract_claims(req.text),
        analyze_provenance(req.text, req.conversation_context),
    )

    if not raw_claims:
        return ScoreResponse(
            overall_score=0.5,
            label="Weakly Grounded",
            drift_detected=False,
            provenance=ProvenanceBreakdown(**provenance_data),
            claims=[],
            audit=AuditCounts(),
        )

    # Retrieve evidence for all claims concurrently
    evidence_lists = await asyncio.gather(
        *[retrieve_evidence(c["text"]) for c in raw_claims]
    )

    # Judge all claims concurrently
    judgments = await asyncio.gather(
        *[
            judge_claim(c["text"], ev, req.pinned_facts)
            for c, ev in zip(raw_claims, evidence_lists)
        ]
    )

    claims: list[Claim] = []
    audit = AuditCounts()

    for raw, ev_list, judgment in zip(raw_claims, evidence_lists, judgments):
        verdict = judgment.get("verdict", "unverified")
        confidence = float(judgment.get("confidence", 0.5))

        if verdict == "supported":
            audit.grounded += 1
        elif verdict == "contradicted":
            audit.contradiction += 1
        else:
            audit.unsupported += 1

        claims.append(
            Claim(
                text=raw["text"],
                verdict=verdict,
                confidence=confidence,
                sources=[Source(**s) for s in ev_list],
            )
        )

    # Assumption count = claims where model filled in without evidence
    audit.assumption = sum(1 for c in claims if not c.sources)

    overall = sum(c.confidence for c in claims) / len(claims) if claims else 0.5
    drift = any(c.verdict == "contradicted" for c in claims if req.pinned_facts)

    return ScoreResponse(
        overall_score=round(overall, 3),
        label=_score_to_label(overall),
        drift_detected=drift,
        provenance=ProvenanceBreakdown(**provenance_data),
        claims=claims,
        audit=audit,
    )
