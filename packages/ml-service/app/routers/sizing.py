"""API router for system sizing calculations."""

from fastapi import APIRouter, HTTPException
import hashlib
import json
from app.models.sizing_model import SizingInput, SizingOutput, sizing_model
from app.utils.cache import cache
from app.utils.logging import get_logger

router = APIRouter(prefix="/api/v1", tags=["sizing"])
logger = get_logger(__name__)


@router.post("/sizing", response_model=dict)
async def calculate_sizing(data: dict) -> dict:
    """
    Calculate recommended system sizing based on location and consumption.
    
    Args:
        data: SizingInput data including roof area, consumption, location, orientation
    
    Returns:
        SizingOutput with recommended system size and panel count
    """
    try:
        # Extract input
        sizing_input = SizingInput(
            roof_area=data.get("roof_area", 0),
            usable_solar_area=data.get("usable_solar_area", 0),
            monthly_kwh=data.get("monthly_kwh", 0),
            latitude=data.get("latitude", 0),
            longitude=data.get("longitude", 0),
            azimuth=data.get("azimuth", 180),
            pitch=data.get("pitch", 30),
            shading_factor=data.get("shading_factor", 0.85),
        )

        # Create cache key from address hash
        cache_data = {
            'lat': sizing_input.latitude,
            'lon': sizing_input.longitude,
            'kwh': sizing_input.monthly_kwh,
        }
        cache_key = f"sizing:{hashlib.md5(json.dumps(cache_data).encode()).hexdigest()}"

        # Check cache
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info("Sizing calculation from cache", key=cache_key)
            return cached_result

        # Calculate sizing
        output = sizing_model.predict(sizing_input)

        # Format response
        response = {
            "recommended_kw": output.recommended_kw,
            "panel_count": output.panel_count,
            "offset_percentage": output.offset_percentage,
            "confidence_score": output.confidence_score,
        }

        # Cache result
        cache.set(cache_key, response)

        logger.info(
            "Sizing calculated",
            kw=output.recommended_kw,
            panels=output.panel_count,
            offset=output.offset_percentage,
        )

        return response

    except Exception as e:
        logger.error("Sizing calculation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
