"""API router for proposal copy generation."""

from fastapi import APIRouter, HTTPException
from app.models.proposal_writer import (
    ProposalInput,
    proposal_writer,
)
from app.utils.logging import get_logger

router = APIRouter(prefix="/api/v1", tags=["proposal"])
logger = get_logger(__name__)


@router.post("/proposal-copy", response_model=dict)
async def generate_proposal(data: dict) -> dict:
    """
    Generate personalized AI-powered proposal copy using GPT-4.
    
    Args:
        data: Proposal input including homeowner details and system specs
    
    Returns:
        Generated proposal with headline, narrative, and full proposal text
    """
    try:
        # Extract input
        proposal_input = ProposalInput(
            homeowner_name=data.get("homeowner_name", "Homeowner"),
            system_size_kw=data.get("system_size_kw", 0),
            monthly_savings=data.get("monthly_savings", 0),
            annual_production_kwh=data.get("annual_production_kwh", 0),
            payback_years=data.get("payback_years", 0),
            npv_25yr=data.get("npv_25yr", 0),
            payment_option=data.get("payment_option", "cash"),
            monthly_payment=data.get("monthly_payment"),
            location=data.get("location", "California"),
            utility_provider=data.get("utility_provider", "Local Utility"),
            installation_count_local=data.get("installation_count_local", 0),
            installer_credentials=data.get("installer_credentials", ""),
        )

        # Generate proposal
        output = proposal_writer.generate(proposal_input)

        # Format response
        response = {
            "headline": output.headline,
            "subheadline": output.subheadline,
            "savings_narrative": output.savings_narrative,
            "payment_description": output.payment_description,
            "full_proposal": output.full_proposal,
        }

        logger.info(
            "Proposal generated",
            homeowner=proposal_input.homeowner_name,
            system_size=proposal_input.system_size_kw,
        )

        return response

    except Exception as e:
        logger.error("Proposal generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
