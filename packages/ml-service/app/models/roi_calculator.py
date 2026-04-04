"""25-year NPV ROI financial calculator for solar systems."""

import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum


class PaymentType(str, Enum):
    """Payment method types."""
    CASH = "cash"
    FINANCE = "finance"
    LIGHTREACH = "lightreach"


@dataclass
class YearlyBreakdown:
    """Annual cash flow breakdown."""
    year: int
    production_kwh: float
    energy_offset_kwh: float
    utility_cost_avoided: float
    payment_or_cost: float
    maintenance_cost: float
    net_cash_flow: float
    cumulative_savings: float
    remaining_loan_balance: Optional[float] = None


@dataclass
class ROIInput:
    """Input data for 25-year ROI analysis."""
    system_size_kw: float
    annual_production_kwh: float
    current_monthly_bill: float
    utility_rate: float  # $/kWh
    utility_escalation_rate: float = 0.03  # 3% annual increase
    panel_cost_per_watt: float = 2.50  # $/W
    itc_percentage: float = 30.0  # Investment Tax Credit %
    nem_version: str = "3.0"  # NEM version (2.0, 3.0)
    export_rate: float = 0.12  # $/kWh for NEM 3.0 exports
    payment_type: PaymentType = PaymentType.CASH
    loan_apr: Optional[float] = None  # For finance payment
    loan_term_years: Optional[int] = None  # For finance payment


@dataclass
class ROIOutput:
    """25-year ROI analysis output."""
    current_annual_cost: float
    projected_25yr_utility_cost: float
    total_solar_cost: float
    total_solar_cost_after_itc: float
    total_25yr_savings: float
    monthly_savings_year1: float
    payback_years: float
    npv_25yr: float
    year_by_year_breakdown: List[YearlyBreakdown] = field(default_factory=list)
    payment_type: PaymentType = PaymentType.CASH


class ROICalculator:
    """25-year NPV solar ROI calculator with full cash flow modeling."""

    def __init__(self):
        """Initialize ROI calculator."""
        self.analysis_period = 25
        self.panel_degradation_rate = 0.0055  # 0.55% annual
        self.maintenance_cost_annual = 150  # Annual maintenance cost
        self.discount_rate = 0.05  # 5% NPV discount rate

    def calculate(self, roi_input: ROIInput) -> ROIOutput:
        """Calculate full 25-year ROI analysis."""
        
        # Current costs
        current_annual_cost = roi_input.current_monthly_bill * 12
        
        # System cost
        system_cost = roi_input.system_size_kw * 1000 * roi_input.panel_cost_per_watt
        itc_credit = system_cost * (roi_input.itc_percentage / 100)
        system_cost_after_itc = system_cost - itc_credit
        
        # Initialize year-by-year breakdown
        year_breakdown = []
        cumulative_savings = 0.0
        payback_year = None
        
        # Build year-by-year cash flows
        for year in range(1, self.analysis_period + 1):
            # Solar production with degradation
            degradation_factor = (1 - self.panel_degradation_rate) ** (year - 1)
            production_kwh = roi_input.annual_production_kwh * degradation_factor
            
            # Utility costs (with escalation)
            utility_rate = roi_input.utility_rate * (1 + roi_input.utility_escalation_rate) ** (year - 1)
            
            # Avoided utility cost
            if roi_input.nem_version == "3.0":
                # NEM 3.0: Import at higher rate, export at lower rate
                # Simplified: assume 80% consumption offset, 20% exported
                import_offset = production_kwh * 0.80
                export_kwh = production_kwh * 0.20
                utility_cost_avoided = (
                    (import_offset * utility_rate) +
                    (export_kwh * roi_input.export_rate)
                )
            else:
                # NEM 2.0: Simple offset of consumption
                utility_cost_avoided = production_kwh * utility_rate
            
            # Maintenance cost
            maintenance_cost = self.maintenance_cost_annual
            
            # Payment or cost
            if roi_input.payment_type == PaymentType.CASH:
                # Cash: only ITC benefit in year 1
                if year == 1:
                    payment_cost = -itc_credit
                else:
                    payment_cost = 0
            elif roi_input.payment_type == PaymentType.FINANCE:
                # Financed: calculate loan payment
                if roi_input.loan_apr is None or roi_input.loan_term_years is None:
                    payment_cost = 0
                else:
                    monthly_rate = roi_input.loan_apr / 12 / 100
                    num_payments = roi_input.loan_term_years * 12
                    monthly_payment = self._calculate_loan_payment(
                        system_cost_after_itc,
                        monthly_rate,
                        num_payments
                    )
                    # Only pay during loan term
                    if year <= roi_input.loan_term_years:
                        payment_cost = monthly_payment * 12
                    else:
                        payment_cost = 0
            else:  # LIGHTREACH
                # Lightreach: typically 0% APR, calculate equivalent cost
                monthly_rate = 0.0
                num_payments = 25 * 12
                monthly_payment = system_cost_after_itc / (25 * 12)
                payment_cost = monthly_payment * 12
            
            # Net cash flow
            net_cash_flow = (
                utility_cost_avoided -
                maintenance_cost -
                payment_cost
            )
            
            cumulative_savings += net_cash_flow
            
            # Track payback
            if payback_year is None and cumulative_savings > 0:
                payback_year = year
            
            year_breakdown.append(YearlyBreakdown(
                year=year,
                production_kwh=production_kwh,
                energy_offset_kwh=production_kwh,  # Simplified
                utility_cost_avoided=utility_cost_avoided,
                payment_or_cost=payment_cost,
                maintenance_cost=maintenance_cost,
                net_cash_flow=net_cash_flow,
                cumulative_savings=cumulative_savings,
            ))
        
        # Calculate NPV
        npv = self._calculate_npv(year_breakdown)
        
        # Projected 25-year utility cost without solar
        projected_utility_cost = self._calculate_projected_utility_cost(
            current_annual_cost,
            roi_input.utility_escalation_rate
        )
        
        # Total 25-year savings
        total_savings = cumulative_savings
        
        # Monthly savings in year 1
        year1_breakdown = year_breakdown[0]
        monthly_savings_year1 = year1_breakdown.net_cash_flow / 12
        
        # Payback period (with interpolation)
        payback_years = self._interpolate_payback(year_breakdown)
        
        return ROIOutput(
            current_annual_cost=current_annual_cost,
            projected_25yr_utility_cost=projected_utility_cost,
            total_solar_cost=system_cost,
            total_solar_cost_after_itc=system_cost_after_itc,
            total_25yr_savings=total_savings,
            monthly_savings_year1=monthly_savings_year1,
            payback_years=payback_years,
            npv_25yr=npv,
            year_by_year_breakdown=year_breakdown,
            payment_type=roi_input.payment_type,
        )

    def _calculate_loan_payment(
        self,
        principal: float,
        monthly_rate: float,
        num_payments: int
    ) -> float:
        """Calculate monthly loan payment using standard amortization."""
        if monthly_rate == 0:
            return principal / num_payments
        
        numerator = principal * monthly_rate * (1 + monthly_rate) ** num_payments
        denominator = (1 + monthly_rate) ** num_payments - 1
        return numerator / denominator

    def _calculate_projected_utility_cost(
        self,
        current_annual: float,
        escalation_rate: float
    ) -> float:
        """Calculate total utility cost over 25 years with escalation."""
        total = 0
        for year in range(1, 26):
            annual_cost = current_annual * (1 + escalation_rate) ** (year - 1)
            total += annual_cost
        return total

    def _calculate_npv(self, year_breakdown: List[YearlyBreakdown]) -> float:
        """Calculate NPV of cash flows."""
        npv = 0
        for year_data in year_breakdown:
            pv = year_data.net_cash_flow / ((1 + self.discount_rate) ** year_data.year)
            npv += pv
        return npv

    def _interpolate_payback(self, year_breakdown: List[YearlyBreakdown]) -> float:
        """Calculate payback period with linear interpolation."""
        for i, year_data in enumerate(year_breakdown):
            if year_data.cumulative_savings > 0:
                if i == 0:
                    # Payback in first year
                    if year_data.net_cash_flow != 0:
                        fraction = abs(year_data.cumulative_savings) / year_data.net_cash_flow
                        return year_data.year - fraction
                    return year_data.year
                else:
                    # Linear interpolation between years
                    prev_data = year_breakdown[i - 1]
                    if prev_data.cumulative_savings < 0:
                        fraction = abs(prev_data.cumulative_savings) / (
                            year_data.cumulative_savings - prev_data.cumulative_savings
                        )
                        return prev_data.year + fraction
        
        # Never reaches payback
        return float('inf')


# Global calculator instance
roi_calculator = ROICalculator()
