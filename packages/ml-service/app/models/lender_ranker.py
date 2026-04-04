"""Lender ranking algorithm for solar financing options."""

from dataclasses import dataclass
from typing import List
from enum import Enum


class CreditTier(str, Enum):
    """Credit tier categories."""
    EXCELLENT = "excellent"  # 750+
    GOOD = "good"  # 700-749
    FAIR = "fair"  # 650-699
    POOR = "poor"  # <650


@dataclass
class LenderOption:
    """Ranked lender option with financing details."""
    lender_name: str
    apr: float
    monthly_payment: float
    term_years: int
    approval_probability: float
    rank_score: float
    notes: str = ""


@dataclass
class LenderRankerInput:
    """Input for lender ranking."""
    system_cost: float  # Total system cost in dollars
    credit_tier: CreditTier
    loan_amount: float  # Amount to finance
    state: str  # Two-letter state code


@dataclass
class LenderRankerOutput:
    """Ranked lender options output."""
    recommended_lender: LenderOption
    all_options: List[LenderOption]


class LenderRanker:
    """Lender ranking algorithm based on APR, approval odds, and payment."""

    def __init__(self):
        """Initialize lender ranker."""
        
        # Lender database with state-specific rates
        self.lenders = {
            "Lightreach": {
                "base_apr": 0.0,  # 0% promotional
                "approval_rate_multipliers": {
                    "excellent": 0.98,
                    "good": 0.95,
                    "fair": 0.85,
                    "poor": 0.60,
                },
                "min_loan": 5000,
                "max_loan": 100000,
                "term_years": 25,
            },
            "Mosaic": {
                "base_apr": 5.99,
                "approval_rate_multipliers": {
                    "excellent": 0.96,
                    "good": 0.92,
                    "fair": 0.80,
                    "poor": 0.50,
                },
                "min_loan": 5000,
                "max_loan": 75000,
                "term_years": 20,
            },
            "Sunrun": {
                "base_apr": 6.49,
                "approval_rate_multipliers": {
                    "excellent": 0.95,
                    "good": 0.90,
                    "fair": 0.75,
                    "poor": 0.40,
                },
                "min_loan": 10000,
                "max_loan": 100000,
                "term_years": 20,
            },
            "LendingClub": {
                "base_apr": 7.99,
                "approval_rate_multipliers": {
                    "excellent": 0.92,
                    "good": 0.85,
                    "fair": 0.70,
                    "poor": 0.35,
                },
                "min_loan": 1000,
                "max_loan": 50000,
                "term_years": 7,
            },
            "Bank of America": {
                "base_apr": 8.49,
                "approval_rate_multipliers": {
                    "excellent": 0.90,
                    "good": 0.80,
                    "fair": 0.60,
                    "poor": 0.30,
                },
                "min_loan": 10000,
                "max_loan": 100000,
                "term_years": 15,
            },
        }

        # State-based APR adjustments
        self.state_apr_adjustments = {
            "CA": -0.25,  # California: lower rates
            "TX": 0.0,
            "NY": -0.15,
            "FL": 0.25,
            "AZ": 0.0,
        }

    def rank(self, ranker_input: LenderRankerInput) -> LenderRankerOutput:
        """Rank available lenders for the customer."""
        
        options = []
        credit_tier_str = ranker_input.credit_tier.value

        for lender_name, lender_data in self.lenders.items():
            # Check if loan amount within lender's limits
            if not (lender_data["min_loan"] <= ranker_input.loan_amount <= lender_data["max_loan"]):
                continue

            # Calculate APR with state adjustment
            base_apr = lender_data["base_apr"]
            state_adjustment = self.state_apr_adjustments.get(ranker_input.state, 0)
            apr = max(0, base_apr + state_adjustment)

            # Calculate monthly payment
            monthly_payment = self._calculate_payment(
                ranker_input.loan_amount,
                apr,
                lender_data["term_years"]
            )

            # Get approval probability
            approval_multiplier = lender_data["approval_rate_multipliers"].get(
                credit_tier_str,
                0.5
            )
            approval_probability = min(0.99, max(0.1, approval_multiplier))

            # Calculate rank score
            rank_score = self._calculate_rank_score(
                apr,
                approval_probability,
                monthly_payment,
                ranker_input.system_cost
            )

            options.append(LenderOption(
                lender_name=lender_name,
                apr=apr,
                monthly_payment=monthly_payment,
                term_years=lender_data["term_years"],
                approval_probability=approval_probability,
                rank_score=rank_score,
                notes=self._get_lender_notes(lender_name),
            ))

        # Sort by rank score (descending)
        options.sort(key=lambda x: x.rank_score, reverse=True)

        return LenderRankerOutput(
            recommended_lender=options[0] if options else self._get_fallback_option(),
            all_options=options,
        )

    def _calculate_payment(
        self,
        principal: float,
        annual_apr: float,
        term_years: int
    ) -> float:
        """Calculate monthly loan payment."""
        if annual_apr == 0:
            return principal / (term_years * 12)

        monthly_rate = annual_apr / 12 / 100
        num_payments = term_years * 12

        numerator = principal * monthly_rate * (1 + monthly_rate) ** num_payments
        denominator = (1 + monthly_rate) ** num_payments - 1

        if denominator == 0:
            return principal / num_payments

        return numerator / denominator

    def _calculate_rank_score(
        self,
        apr: float,
        approval_probability: float,
        monthly_payment: float,
        system_cost: float
    ) -> float:
        """Calculate composite rank score."""
        
        # Normalize APR (lower is better)
        # Range 0-15%, normalize to 0-1
        apr_score = max(0, 1 - (apr / 15)) * 100

        # Approval probability (higher is better)
        approval_score = approval_probability * 100

        # Payment score (lower is better)
        # Compare to maximum acceptable: 5% of system cost per month
        max_acceptable_monthly = system_cost * 0.05
        payment_score = max(0, 1 - (monthly_payment / max_acceptable_monthly)) * 100

        # Weighted composite
        # APR: 40%, Approval: 30%, Payment: 30%
        composite = (
            (apr_score * 0.40) +
            (approval_score * 0.30) +
            (payment_score * 0.30)
        )

        return composite

    def _get_lender_notes(self, lender_name: str) -> str:
        """Get lender-specific notes."""
        notes_map = {
            "Lightreach": "Sunbull partner - 0% APR promotional offer",
            "Mosaic": "Strong approval rates for good credit",
            "Sunrun": "Nationwide lender with competitive rates",
            "LendingClub": "Quick funding, good for shorter terms",
            "Bank of America": "Traditional bank option",
        }
        return notes_map.get(lender_name, "")

    def _get_fallback_option(self) -> LenderOption:
        """Get fallback lender option."""
        return LenderOption(
            lender_name="Lightreach",
            apr=0.0,
            monthly_payment=0,
            term_years=25,
            approval_probability=0.85,
            rank_score=100.0,
            notes="Default option - contact for details",
        )


# Global ranker instance
lender_ranker = LenderRanker()
