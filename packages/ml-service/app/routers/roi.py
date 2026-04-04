"""API router for ROI analysis calculations."""

from fastapi import APIRouter, HTTPException
from typing import Optional
from app.models.roi_calculator import (
    ROIInput,
    ROIOutput,
    PaymentType,
    roi_calculator,
)
from app.utils.logging import get_logger

router = APIRouter(prefix="/api/v1", tags=["roi"])
logger = get_logger(__name__)


@router.post("/roi", response_model=dict)
async def calculate_roi(data: dict) -> dict:
    """
    Calculate 25-year ROI analysis for solar system.
    
    Args:
        data: ROIInput including system size, production, costs, rates
    
    Returns:
        Complete 25-year financial analysis with year-by-year breakdown
    """
    try:
        # Extract input
        payment_type = PaymentType(data.get("payment_type", "cash"))
        
        roi_input = ROIInput(
            system_size_kw=data.get("system_size_kw", 0),
            annual_production_kwh=data.get("annual_production_kwh", 0),
            current_monthly_bill=data.get("current_monthly_bill", 0),
            utility_rate=data.get("utility_rate", 0.15),
            utility_escalation_rate=data.get("utility_escalation_rate", 0.03),
            panel_cost_per_watt=data.get("panel_cost_per_watt", 2.50),
            itc_percentage=data.get("itc_percentage", 30.0),
            nem_version=data.get("nem_version", "3.0"),
            export_rate=data.get("export_rate", 0.12),
            payment_type=payment_type,
            loan_apr=data.get("loan_apr"),
            loan_term_years=data.get("loan_term_years"),
        )

        # Calculate ROI
        output = roi_calculator.calculate(roi_input)

        # Format year-by-year breakdown
        year_breakdown = []
        for year_data in output.year_by_year_breakdown:
            year_breakdown.append({
                "year": year_data.year,
                "production_kwh": round(year_data.production_kwh, 2),
                "energy_offset_kwh": round(year_data.energy_offset_kwh, 2),
                "utility_cost_avoided": round(year_data.utility_cost_avoided, 2),
                "payment_or_cost": round(year_data.payment_or_cost, 2),
                "maintenance_cost": round(year_data.maintenance_cost, 2),
                "net_cash_flow": round(year_data.net_cash_flow, 2),
                "cumulative_savings": round(year_data.cumulative_savings, 2),
            })

        # Format response
        response = {
            "current_annual_cost": round(output.current_annual_cost, 2),
            "projected_25yr_utility_cost": round(output.projected_25yr_utility_cost, 2),
            "total_solar_cost": round(output.total_solar_cost, 2),
            "total_solar_cost_after_itc": round(output.total_solar_cost_after_itc, 2),
            "total_25yr_savings": round(output.total_25yr_savings, 2),
            "monthly_savings_year1": round(output.monthly_savings_year1, 2),
            "payback_years": round(output.payback_years, 2),
            "npv_25yr": round(output.npv_25yr, 2),
            "payment_type": output.payment_type.value,
            "year_by_year_breakdown": year_breakdown,
        }

        logger.info(
            "ROI calculated",
            system_size_kw=roi_input.system_size_kw,
            total_savings=output.total_25yr_savings,
            payback_years=output.payback_years,
        )

        return response

    except Exception as e:
        logger.error("ROI calculation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
