"""Lead propensity scoring model for solar sales qualification."""

import numpy as np
from dataclasses import dataclass
from typing import List
from sklearn.linear_model import LogisticRegression
from pathlib import Path


@dataclass
class LeadScorerInput:
    """Input features for lead scoring."""
    source: str  # "google", "facebook", "organic", etc.
    bill_amount: float  # Monthly bill in dollars
    address_state: str  # Two-letter state code
    utility_provider: str
    has_bill_upload: bool
    time_on_page: float  # Seconds
    device_type: str  # "mobile", "desktop", "tablet"


@dataclass
class ScoringFactor:
    """Individual scoring factor."""
    name: str
    contribution: float  # Positive or negative


@dataclass
class LeadScorerOutput:
    """Lead propensity score output."""
    score: float  # 0-100
    confidence: float  # 0-1.0
    factors: List[ScoringFactor]
    recommendation: str  # "hot", "warm", "cool"


class LeadScorer:
    """Lead propensity scoring using logistic regression with fallback heuristics."""

    def __init__(self, model_path: str = None):
        """Initialize lead scorer."""
        self.model = None
        self.model_path = model_path
        self.is_trained = False
        self.feature_names = None
        self._load_model()

        # Heuristic weights for fallback scoring
        self.source_scores = {
            "google": 0.85,
            "facebook": 0.70,
            "organic": 0.80,
            "referral": 0.75,
            "paid_search": 0.80,
            "social": 0.65,
        }

        self.state_solar_potential = {
            "CA": 0.95,
            "TX": 0.85,
            "FL": 0.80,
            "AZ": 0.90,
            "NC": 0.75,
            "NY": 0.70,
        }

        self.utility_providers_high_rates = {
            "PG&E": 0.95,
            "SCE": 0.90,
            "SDG&E": 0.95,
            "FPL": 0.80,
        }

    def _load_model(self) -> None:
        """Load trained model if available."""
        if self.model_path:
            path = Path(self.model_path) / "lead_scorer_model.pkl"
            if path.exists():
                try:
                    import pickle
                    with open(path, "rb") as f:
                        self.model = pickle.load(f)
                    self.is_trained = True
                except Exception:
                    self.model = None
                    self.is_trained = False

    def train(self, X: np.ndarray, y: np.ndarray, feature_names: List[str]) -> None:
        """Train logistic regression model."""
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.model.fit(X, y)
        self.feature_names = feature_names
        self.is_trained = True

        # Save model
        if self.model_path:
            import pickle
            path = Path(self.model_path)
            path.mkdir(parents=True, exist_ok=True)
            with open(path / "lead_scorer_model.pkl", "wb") as f:
                pickle.dump(self.model, f)

    def score(self, lead_input: LeadScorerInput) -> LeadScorerOutput:
        """Score a lead on conversion propensity."""
        
        if self.is_trained and self.model:
            return self._score_with_model(lead_input)
        else:
            return self._score_heuristic(lead_input)

    def _score_with_model(self, lead_input: LeadScorerInput) -> LeadScorerOutput:
        """Score using trained logistic regression model."""
        
        # Feature engineering
        features = self._extract_features(lead_input)
        X = np.array([features])
        
        # Get probability
        probabilities = self.model.predict_proba(X)[0]
        conversion_prob = probabilities[1]  # Probability of conversion
        
        score = conversion_prob * 100
        confidence = 0.85
        
        # Factor attribution
        factors = self._get_factor_attribution(features, conversion_prob)
        
        return LeadScorerOutput(
            score=score,
            confidence=confidence,
            factors=factors,
            recommendation=self._get_recommendation(score),
        )

    def _score_heuristic(self, lead_input: LeadScorerInput) -> LeadScorerOutput:
        """Score using heuristic rules."""
        
        score = 50.0  # Base score
        factors = []

        # Source factor
        source_score = self.source_scores.get(lead_input.source.lower(), 0.60)
        source_contribution = (source_score - 0.5) * 20  # -10 to +10
        score += source_contribution
        factors.append(ScoringFactor(
            name=f"Lead source: {lead_input.source}",
            contribution=source_contribution
        ))

        # Bill amount factor (higher bills = more solar potential)
        bill_factor = min(1.0, lead_input.bill_amount / 300)  # Normalize to 300
        bill_contribution = (bill_factor - 0.5) * 20
        score += bill_contribution
        factors.append(ScoringFactor(
            name=f"Monthly bill: ${lead_input.bill_amount:.0f}",
            contribution=bill_contribution
        ))

        # State solar potential
        state_potential = self.state_solar_potential.get(lead_input.address_state, 0.70)
        state_contribution = (state_potential - 0.5) * 15
        score += state_contribution
        factors.append(ScoringFactor(
            name=f"Solar potential in {lead_input.address_state}",
            contribution=state_contribution
        ))

        # Utility provider factor
        provider_rate_factor = self.utility_providers_high_rates.get(
            lead_input.utility_provider,
            0.75
        )
        provider_contribution = (provider_rate_factor - 0.5) * 15
        score += provider_contribution
        factors.append(ScoringFactor(
            name=f"Utility provider rates",
            contribution=provider_contribution
        ))

        # Engagement factors
        if lead_input.has_bill_upload:
            score += 10
            factors.append(ScoringFactor(
                name="Bill document uploaded",
                contribution=10.0
            ))

        if lead_input.time_on_page > 60:
            score += 8
            factors.append(ScoringFactor(
                name="Extended page engagement",
                contribution=8.0
            ))

        if lead_input.device_type == "desktop":
            score += 5
            factors.append(ScoringFactor(
                name="Desktop device (higher intent)",
                contribution=5.0
            ))

        # Normalize score to 0-100
        score = max(0, min(100, score))

        return LeadScorerOutput(
            score=score,
            confidence=0.75,
            factors=factors,
            recommendation=self._get_recommendation(score),
        )

    def _extract_features(self, lead_input: LeadScorerInput) -> List[float]:
        """Extract features for model prediction."""
        # Encode categorical variables
        source_encoding = {
            "google": 1.0, "facebook": 0.7, "organic": 0.8,
            "referral": 0.75, "paid_search": 0.8, "social": 0.65
        }
        source_value = source_encoding.get(lead_input.source.lower(), 0.5)

        device_encoding = {"desktop": 1.0, "mobile": 0.7, "tablet": 0.8}
        device_value = device_encoding.get(lead_input.device_type.lower(), 0.5)

        # Normalize bill amount
        bill_normalized = min(1.0, lead_input.bill_amount / 400)

        # Engagement normalized
        engagement_normalized = min(1.0, lead_input.time_on_page / 300)

        return [
            source_value,
            bill_normalized,
            engagement_normalized,
            float(lead_input.has_bill_upload),
            device_value,
        ]

    def _get_factor_attribution(
        self,
        features: List[float],
        prediction_prob: float
    ) -> List[ScoringFactor]:
        """Get factor contributions from model."""
        if not self.model or not self.feature_names:
            return []

        coefficients = self.model.coef_[0]
        factors = []

        for i, coef in enumerate(coefficients):
            contribution = coef * features[i] * 10  # Scale for interpretability
            if abs(contribution) > 0.5:
                factors.append(ScoringFactor(
                    name=f"Feature {i}",
                    contribution=contribution
                ))

        return sorted(factors, key=lambda x: abs(x.contribution), reverse=True)[:3]

    def _get_recommendation(self, score: float) -> str:
        """Get recommendation based on score."""
        if score >= 75:
            return "hot"
        elif score >= 50:
            return "warm"
        else:
            return "cool"


# Global scorer instance
lead_scorer = LeadScorer()
