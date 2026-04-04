"""API router for lender ranking."""

from fastapi import APIRouter, HTTPException
from app.models.lender_ranker import (
    CreditTier,
    lender_ranker,
)
from app.utils.logging import get_logger

router = APIRouter(prefix="/api/v1", tags=["lender"])
logger = get_logger(__name__)


@router.post("/rank-lenders", response_model=dict)
async def rank_lenders(data: dict) -> dict:
    """
    Rank available lenders based on system cost and credit profile.
    
    Args:
        data: System cost, credit tier, loan amount, state
    
    Returns:
        Ranked list of lender options with APR, payment, approval probability
    """
    try:
        # Extract input
        credit_tier = CreditTier(data.get("credit_tier", "good"))
        
        ranker_input_dict = {
            "system_cost": data.get("system_cost", 0),
            "credit_tier": credit_tier,
            "loan_amount": data.get("loan_amount", 0),
            "state": data.get("state", "CA"),
        }

        # Rank lenders
        output = lender_ranker.rank(
            type("RankerInput", (), ranker_input_dict)()
        )

        # Format options
        options = []
        for option in output.all_options:
            options.append({
                "lender_name": option.lender_name,
                "apr": round(option.apr, 2),
                "monthly_payment": round(option.monthly_payment, 2),
                "term_years": option.term_years,
                "approval_probability": round(option.approval_probability, 2),
                "rank_score": round(option.rank_score, 2),
                "notes": option.notes,
            })

        # Format response
        response = {
            "recommended_lender": {
                "lender_name": output.recommended_lender.lender_name,
                "apr": round(output.recommended_lender.apr, 2),
                "monthly_payment": round(output.recommended_lender.monthly_payment, 2),
                "term_years": output.recommended_lender.term_years,
                "approval_probability": round(output.recommended_lender.approval_probability, 2),
                "rank_score": round(output.recommended_lender.rank_score, 2),
                "notes": output.recommended_lender.notes,
            },
            "all_options": options,
        }

        logger.info(
            "Lenders ranked",
            top_lender=output.recommended_lender.lender_name,
            credit_tier=credit_tier.value,
        )

        return response

    except Exception as e:
        logger.error("Lender ranking failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
