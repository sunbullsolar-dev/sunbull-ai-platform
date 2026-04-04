"""Example usage of the Sunbull AI ML Service models directly."""

import asyncio
from app.models.sizing_model import SizingInput, sizing_model
from app.models.roi_calculator import ROIInput, PaymentType, roi_calculator
from app.models.proposal_writer import ProposalInput, proposal_writer
from app.models.lead_scorer import LeadScorerInput, lead_scorer
from app.models.lender_ranker import CreditTier


def example_sizing():
    """Example: System sizing calculation."""
    print("\n=== SYSTEM SIZING EXAMPLE ===\n")
    
    sizing_input = SizingInput(
        roof_area=2500,
        usable_solar_area=2000,
        monthly_kwh=800,
        latitude=37.7749,  # San Francisco
        longitude=-122.4194,
        azimuth=180,  # South-facing
        pitch=25,  # 25 degree pitch
        shading_factor=0.85,  # 15% shading
    )
    
    output = sizing_model.predict(sizing_input)
    
    print(f"Input: {sizing_input.monthly_kwh} kWh/month consumption")
    print(f"Location: {sizing_input.latitude}, {sizing_input.longitude}")
    print(f"\nRecommended system size: {output.recommended_kw} kW")
    print(f"Panel count (440W): {output.panel_count} panels")
    print(f"Energy offset: {output.offset_percentage:.1f}%")
    print(f"Confidence score: {output.confidence_score:.2f}")


def example_roi():
    """Example: 25-year ROI analysis."""
    print("\n=== ROI ANALYSIS EXAMPLE ===\n")
    
    roi_input = ROIInput(
        system_size_kw=8.0,
        annual_production_kwh=12000,
        current_monthly_bill=150,
        utility_rate=0.18,  # $0.18/kWh
        utility_escalation_rate=0.03,  # 3% annual increase
        panel_cost_per_watt=2.50,
        itc_percentage=30,  # 30% tax credit
        nem_version="3.0",
        export_rate=0.12,  # $0.12/kWh export rate (NEM 3.0)
        payment_type=PaymentType.CASH,
    )
    
    output = roi_calculator.calculate(roi_input)
    
    print(f"System: {roi_input.system_size_kw} kW")
    print(f"Annual production: {roi_input.annual_production_kwh:,.0f} kWh")
    print(f"\nFinancial Summary:")
    print(f"  System cost: ${output.total_solar_cost:,.2f}")
    print(f"  After 30% tax credit: ${output.total_solar_cost_after_itc:,.2f}")
    print(f"  Year 1 monthly savings: ${output.monthly_savings_year1:.2f}")
    print(f"  Payback period: {output.payback_years:.1f} years")
    print(f"  25-year savings: ${output.total_25yr_savings:,.2f}")
    print(f"  25-year NPV (5% discount): ${output.npv_25yr:,.2f}")
    
    # Show first 3 years detail
    print(f"\nYear-by-year breakdown (first 3 years):")
    for year_data in output.year_by_year_breakdown[:3]:
        print(f"  Year {year_data.year}:")
        print(f"    Production: {year_data.production_kwh:,.0f} kWh")
        print(f"    Utility savings: ${year_data.utility_cost_avoided:,.2f}")
        print(f"    Cumulative: ${year_data.cumulative_savings:,.2f}")


def example_proposal():
    """Example: AI-generated proposal."""
    print("\n=== PROPOSAL GENERATION EXAMPLE ===\n")
    
    proposal_input = ProposalInput(
        homeowner_name="John Smith",
        system_size_kw=8.0,
        monthly_savings=120,
        annual_production_kwh=12000,
        payback_years=7.5,
        npv_25yr=65000,
        payment_option="finance",
        monthly_payment=150,
        location="San Francisco, CA",
        utility_provider="PG&E",
        installation_count_local=250,
        installer_credentials="NABCEP Certified, 20+ years experience",
    )
    
    # Note: This requires OPENAI_API_KEY environment variable
    try:
        output = proposal_writer.generate(proposal_input)
        
        print(f"Headline: {output.headline}")
        print(f"Subheadline: {output.subheadline}")
        print(f"\nSavings Narrative:")
        print(output.savings_narrative)
        print(f"\nPayment Option:")
        print(output.payment_description)
    except Exception as e:
        print(f"Proposal generation failed (may need OPENAI_API_KEY): {e}")


def example_lead_scoring():
    """Example: Lead propensity scoring."""
    print("\n=== LEAD SCORING EXAMPLE ===\n")
    
    lead_input = LeadScorerInput(
        source="google",
        bill_amount=150,
        address_state="CA",
        utility_provider="PG&E",
        has_bill_upload=True,
        time_on_page=180,
        device_type="desktop",
    )
    
    output = lead_scorer.score(lead_input)
    
    print(f"Lead score: {output.score:.1f}/100")
    print(f"Recommendation: {output.recommendation.upper()}")
    print(f"Confidence: {output.confidence:.2f}")
    print(f"\nScoring factors:")
    for factor in output.factors:
        contribution_sign = "+" if factor.contribution > 0 else ""
        print(f"  {factor.name}: {contribution_sign}{factor.contribution:.2f}")


def example_lender_ranking():
    """Example: Lender option ranking."""
    print("\n=== LENDER RANKING EXAMPLE ===\n")
    
    # Use a simple object instead of dataclass for this example
    class RankerInput:
        def __init__(self):
            self.system_cost = 20000
            self.credit_tier = CreditTier.GOOD
            self.loan_amount = 20000
            self.state = "CA"
    
    ranker_input = RankerInput()
    output = lender_ranker.rank(ranker_input)
    
    print(f"System cost: ${ranker_input.system_cost:,.2f}")
    print(f"Credit tier: {ranker_input.credit_tier.value}")
    print(f"\nTop recommendation: {output.recommended_lender.lender_name}")
    print(f"  APR: {output.recommended_lender.apr:.2f}%")
    print(f"  Monthly payment: ${output.recommended_lender.monthly_payment:.2f}")
    print(f"  Term: {output.recommended_lender.term_years} years")
    print(f"  Approval probability: {output.recommended_lender.approval_probability:.0%}")
    
    print(f"\nAll lender options (ranked):")
    for i, option in enumerate(output.all_options, 1):
        print(f"  {i}. {option.lender_name}")
        print(f"     APR: {option.apr:.2f}% | Payment: ${option.monthly_payment:.2f}/mo | Score: {option.rank_score:.1f}")


if __name__ == "__main__":
    # Run all examples
    print("Sunbull AI ML Service - Example Usage")
    print("=" * 50)
    
    example_sizing()
    example_roi()
    example_proposal()
    example_lead_scoring()
    
    # Lender ranking requires CreditTier - handle separately
    try:
        from app.models.lender_ranker import lender_ranker
        example_lender_ranking()
    except Exception as e:
        print(f"\nLender ranking example failed: {e}")
    
    print("\n" + "=" * 50)
    print("Examples complete!")
