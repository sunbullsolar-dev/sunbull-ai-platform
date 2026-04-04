"""API router for lead propensity scoring."""

from fastapi import APIRouter, HTTPException
from app.models.lead_scorer import (
    LeadScorerInput,
    lead_scorer,
)
from app.utils.logging import get_logger

router = APIRouter(prefix="/api/v1", tags=["scoring"])
logger = get_logger(__name__)


@router.post("/lead-score", response_model=dict)
async def score_lead(data: dict) -> dict:
    """
    Score lead on conversion propensity (0-100).
    
    Args:
        data: Lead features including source, bill, location, engagement
    
    Returns:
        Propensity score, confidence, and contributing factors
    """
    try:
        # Extract input
        lead_input = LeadScorerInput(
            source=data.get("source", "organic"),
            bill_amount=data.get("bill_amount", 100),
            address_state=data.get("address_state", "CA"),
            utility_provider=data.get("utility_provider", ""),
            has_bill_upload=data.get("has_bill_upload", False),
            time_on_page=data.get("time_on_page", 0),
            device_type=data.get("device_type", "desktop"),
        )

        # Score lead
        output = lead_scorer.score(lead_input)

        # Format factors
        factors = [
            {
                "name": factor.name,
                "contribution": round(factor.contribution, 2),
            }
            for factor in output.factors
        ]

        # Format response
        response = {
            "score": round(output.score, 2),
            "confidence": round(output.confidence, 2),
            "recommendation": output.recommendation,
            "factors": factors,
        }

        logger.info(
            "Lead scored",
            score=output.score,
            recommendation=output.recommendation,
            source=lead_input.source,
        )

        return response

    except Exception as e:
        logger.error("Lead scoring failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
