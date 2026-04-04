"""XGBoost system sizing model for solar recommendations."""

import numpy as np
import math
from dataclasses import dataclass
from typing import Optional
import xgboost as xgb
from pathlib import Path


@dataclass
class SizingInput:
    """Input data for system sizing calculation."""
    roof_area: float  # Square feet
    usable_solar_area: float  # Square feet
    monthly_kwh: float  # Current monthly consumption
    latitude: float
    longitude: float
    azimuth: float  # 0-360 degrees
    pitch: float  # 0-90 degrees
    shading_factor: float  # 0-1.0 (1.0 = no shading)


@dataclass
class SizingOutput:
    """Output data from system sizing calculation."""
    recommended_kw: float
    panel_count: int  # 440W panels
    offset_percentage: float  # 0-100
    confidence_score: float  # 0-1.0


class SizingModel:
    """XGBoost system sizing model with rule-based fallback."""

    def __init__(self, model_path: Optional[str] = None):
        """Initialize sizing model."""
        self.model = None
        self.model_path = model_path
        self.is_trained = False
        self._load_model()

    def _load_model(self) -> None:
        """Load trained model from disk if available."""
        if self.model_path:
            path = Path(self.model_path) / "sizing_model.pkl"
            if path.exists():
                try:
                    self.model = xgb.Booster()
                    self.model.load_model(str(path))
                    self.is_trained = True
                except Exception:
                    self.model = None
                    self.is_trained = False

    def train(self, X: np.ndarray, y: np.ndarray) -> None:
        """Train XGBoost model on historical data."""
        dtrain = xgb.DMatrix(X, label=y)
        
        params = {
            "objective": "reg:squarederror",
            "max_depth": 6,
            "learning_rate": 0.1,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        }
        
        self.model = xgb.train(params, dtrain, num_boost_round=100)
        self.is_trained = True

        # Save model
        if self.model_path:
            path = Path(self.model_path)
            path.mkdir(parents=True, exist_ok=True)
            self.model.save_model(str(path / "sizing_model.pkl"))

    def predict(self, sizing_input: SizingInput) -> SizingOutput:
        """Generate system sizing recommendation."""
        
        # Annual consumption (kWh)
        annual_kwh = sizing_input.monthly_kwh * 12
        
        # Calculate peak sun hours based on latitude
        peak_sun_hours = self._estimate_peak_sun_hours(sizing_input.latitude)
        
        # Efficiency factor based on orientation and shading
        efficiency_factor = self._calculate_efficiency_factor(
            sizing_input.azimuth,
            sizing_input.pitch,
            sizing_input.shading_factor
        )
        
        if self.is_trained and self.model:
            # Use trained XGBoost model
            features = np.array([[
                sizing_input.roof_area,
                sizing_input.usable_solar_area,
                sizing_input.monthly_kwh,
                sizing_input.latitude,
                sizing_input.longitude,
                sizing_input.azimuth,
                sizing_input.pitch,
                sizing_input.shading_factor,
                peak_sun_hours,
                efficiency_factor,
            ]])
            
            dmatrix = xgb.DMatrix(features)
            recommended_kw = float(self.model.predict(dmatrix)[0])
            confidence_score = 0.85
        else:
            # Rule-based fallback calculation
            # Formula: annual_kwh / (365 * peak_sun_hours * efficiency_factor)
            # This gives required kW to produce annual_kwh
            recommended_kw = annual_kwh / (
                365 * peak_sun_hours * efficiency_factor
            )
            confidence_score = 0.75

        # Ensure recommendation fits available space
        max_panels = int(sizing_input.usable_solar_area / 65)  # ~65 sq ft per 440W panel
        max_kw = (max_panels * 440) / 1000
        
        if recommended_kw > max_kw:
            recommended_kw = max_kw
            confidence_score *= 0.8

        # Round to nearest 0.5 kW
        recommended_kw = round(recommended_kw * 2) / 2

        # Calculate panel count (440W panels)
        panel_count = math.ceil((recommended_kw * 1000) / 440)

        # Calculate offset percentage
        annual_production = recommended_kw * 365 * peak_sun_hours * efficiency_factor
        offset_percentage = min(100.0, (annual_production / annual_kwh) * 100) if annual_kwh > 0 else 0

        return SizingOutput(
            recommended_kw=recommended_kw,
            panel_count=panel_count,
            offset_percentage=offset_percentage,
            confidence_score=confidence_score,
        )

    def _estimate_peak_sun_hours(self, latitude: float) -> float:
        """Estimate average peak sun hours based on latitude."""
        # Simplified model based on latitude
        # Equator gets ~5.5 PSH, poles get ~2.5 PSH
        abs_lat = abs(latitude)
        
        if abs_lat < 15:
            return 5.5
        elif abs_lat < 30:
            return 5.2
        elif abs_lat < 40:
            return 4.8
        elif abs_lat < 50:
            return 4.2
        else:
            return 3.5

    def _calculate_efficiency_factor(
        self,
        azimuth: float,
        pitch: float,
        shading_factor: float
    ) -> float:
        """Calculate system efficiency based on orientation and shading."""
        
        # Optimal azimuth is 180 degrees (south-facing)
        # Optimal pitch varies by latitude but ~30 degrees is typical
        azimuth_diff = abs(azimuth - 180)
        azimuth_penalty = (azimuth_diff / 180) * 0.15  # Max 15% loss
        
        # Optimal pitch around 30 degrees
        pitch_diff = abs(pitch - 30)
        pitch_penalty = (min(pitch_diff, 60) / 60) * 0.10  # Max 10% loss
        
        # Shading factor is already 0-1.0
        shading_efficiency = shading_factor
        
        # Combined efficiency
        efficiency = 1.0
        efficiency -= azimuth_penalty
        efficiency -= pitch_penalty
        efficiency *= shading_efficiency
        
        return max(0.5, min(1.0, efficiency))


# Global model instance
sizing_model = SizingModel()
