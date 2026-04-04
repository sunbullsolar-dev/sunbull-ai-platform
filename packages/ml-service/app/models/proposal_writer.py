"""GPT-4 powered proposal copy generator for solar sales."""

from dataclasses import dataclass
from typing import Optional
import openai
from app.config import settings


@dataclass
class ProposalInput:
    """Input data for proposal generation."""
    homeowner_name: str
    system_size_kw: float
    monthly_savings: float
    annual_production_kwh: float
    payback_years: float
    npv_25yr: float
    payment_option: str  # "cash", "finance", "lightreach"
    monthly_payment: Optional[float] = None
    location: str = "California"
    utility_provider: str = "Local Utility"
    installation_count_local: int = 0
    installer_credentials: str = ""


@dataclass
class ProposalOutput:
    """Generated proposal copy."""
    headline: str
    subheadline: str
    savings_narrative: str
    payment_description: str
    full_proposal: str


class ProposalWriter:
    """GPT-4 powered proposal copy generator."""

    def __init__(self):
        """Initialize proposal writer."""
        self.client = None
        self.model = settings.openai_model
        if settings.openai_api_key:
            try:
                self.client = openai.OpenAI(api_key=settings.openai_api_key)
            except Exception:
                pass  # Will use fallback

    def generate(self, proposal_input: ProposalInput) -> ProposalOutput:
        """Generate personalized proposal copy using GPT-4."""
        
        system_prompt = """You are an expert solar energy consultant writing clear, honest, and data-driven proposal copy for homeowners considering residential solar installations.

Your tone should be:
- Professional yet conversational
- Honest and transparent about costs and benefits
- NO sales pressure or hype
- Focus on facts, numbers, and local benefits

Include trust elements:
- Local installation experience
- Installer credentials and certifications
- Real savings numbers with realistic assumptions
- Clear explanation of how the system works

Structure your response as JSON with fields: headline, subheadline, savings_narrative, payment_description, full_proposal."""

        user_prompt = f"""Generate a professional solar proposal for the following homeowner:

Name: {proposal_input.homeowner_name}
Location: {proposal_input.location}
Utility Provider: {proposal_input.utility_provider}

System Details:
- System Size: {proposal_input.system_size_kw} kW
- Expected Annual Production: {proposal_input.annual_production_kwh:,.0f} kWh
- Estimated Year 1 Monthly Savings: ${proposal_input.monthly_savings:.2f}
- 25-Year Net Present Value: ${proposal_input.npv_25yr:,.0f}
- Simple Payback Period: {proposal_input.payback_years:.1f} years

Payment Option: {proposal_input.payment_option.capitalize()}
{f"Monthly Payment: ${proposal_input.monthly_payment:.2f}" if proposal_input.monthly_payment else ""}

Local Installation Experience:
- Installations in area: {proposal_input.installation_count_local}
- Installer credentials: {proposal_input.installer_credentials or "Professional, licensed, and insured"}

Generate compelling but honest proposal copy that explains the financial benefits and addresses typical homeowner concerns. Return valid JSON."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )
            
            content = response.choices[0].message.content
            
            # Parse JSON response
            import json
            try:
                proposal_data = json.loads(content)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                proposal_data = self._parse_fallback(content)
            
            return ProposalOutput(
                headline=proposal_data.get("headline", "Your Solar Savings Plan"),
                subheadline=proposal_data.get("subheadline", "Personalized Analysis"),
                savings_narrative=proposal_data.get("savings_narrative", ""),
                payment_description=proposal_data.get("payment_description", ""),
                full_proposal=proposal_data.get("full_proposal", content),
            )
        
        except Exception as e:
            # Fallback proposal
            return self._generate_fallback_proposal(proposal_input)

    def _parse_fallback(self, content: str) -> dict:
        """Parse proposal content in fallback mode."""
        lines = content.split('\n')
        return {
            "headline": lines[0] if lines else "Your Solar Solution",
            "subheadline": lines[1] if len(lines) > 1 else "Custom Tailored Design",
            "savings_narrative": '\n'.join(lines[2:]) if len(lines) > 2 else "",
            "payment_description": "",
            "full_proposal": content,
        }

    def _generate_fallback_proposal(self, proposal_input: ProposalInput) -> ProposalOutput:
        """Generate fallback proposal without OpenAI."""
        
        headline = f"Your {proposal_input.system_size_kw} kW Solar Solution"
        subheadline = f"Save ${proposal_input.monthly_savings:.0f}/month in Year 1"
        
        savings_narrative = f"""Based on your location in {proposal_input.location} and {proposal_input.utility_provider} utility rates, 
a {proposal_input.system_size_kw} kW system is recommended.

Expected results:
- Annual electricity production: {proposal_input.annual_production_kwh:,.0f} kWh
- Year 1 savings: ${proposal_input.monthly_savings * 12:.0f}
- 25-year net savings: ${proposal_input.npv_25yr:,.0f}
- System pays for itself in {proposal_input.payback_years:.1f} years"""

        if proposal_input.payment_option == "finance":
            payment_description = f"""Finance your system with ${proposal_input.monthly_payment:.2f}/month payment.
Your solar savings of ${proposal_input.monthly_savings:.2f}/month typically offset or exceed the payment."""
        elif proposal_input.payment_option == "lightreach":
            payment_description = f"""Pay ${proposal_input.monthly_payment:.2f}/month with Lightreach financing.
Enjoy solar immediately with no money down."""
        else:
            payment_description = f"""Invest ${proposal_input.system_size_kw * 1000 * 2.50:,.0f} cash upfront (after tax credits).
Own your system and enjoy 25+ years of clean energy."""

        full_proposal = f"""{headline}

{subheadline}

System Overview:
{savings_narrative}

Payment Option:
{payment_description}

Why Choose Solar:
- Increase home value
- Lock in energy costs
- Reduce grid dependence
- 25+ year warranty on panels
- Environmentally responsible

Next Steps:
Contact us to discuss your custom solar proposal and answer any questions."""

        return ProposalOutput(
            headline=headline,
            subheadline=subheadline,
            savings_narrative=savings_narrative,
            payment_description=payment_description,
            full_proposal=full_proposal,
        )


# Global proposal writer instance
proposal_writer = ProposalWriter()
