export const UTILITY_PROVIDERS: Record<string, string[]> = {
  CA: [
    'Pacific Gas and Electric Company',
    'Southern California Edison',
    'San Diego Gas and Electric',
    'Sacramento Municipal Utility District',
    'East Bay Municipal Utility District',
    'Silicon Valley Power',
    'Modesto Irrigation District',
  ],
  TX: [
    'Texas Electric Cooperative',
    'Austin Energy',
    'Dallas Power and Light',
    'Oncor Electric Delivery',
    'Houston Lighting and Power',
    'Lower Colorado River Authority',
  ],
  FL: [
    'Florida Power and Light',
    'Tampa Electric Company',
    'Duke Energy Florida',
    'Jacksonville Electric Authority',
    'Orlando Utilities Commission',
    'Florida Power Corporation',
  ],
  AZ: [
    'Arizona Public Service Company',
    'Salt River Project',
    'Tucson Electric Power',
    'Arizona Electric Power Cooperative',
    'Gila Valley Electric Cooperative',
  ],
};

export const PANEL_SPECS = {
  wattage: 440,
  model: 'Hyundai 440W',
  efficiency: 0.205,
  temperatureCoefficient: -0.0035,
};

export const ITC_PERCENTAGE = 0.30;
export const UTILITY_ESCALATION_RATE = 0.03;

export const MAX_BILL_AMOUNT = 2000;
export const MIN_BILL_AMOUNT = 30;

export const MAX_KWH = 30000;
export const MIN_KWH = 100;

export const SERVICE_STATES = ['CA', 'TX', 'FL', 'AZ'];

export const NEM_VERSIONS: Record<string, string> = {
  CA: 'NEM 3.0',
  TX: 'None',
  FL: 'Retail Net Metering',
  AZ: 'NEM',
};

export const PROPOSAL_GENERATION_TIMEOUT = 120000; // 2 minutes

export const ABANDONMENT_SMS_DELAY = 1800000; // 30 minutes
export const ABANDONMENT_EMAIL_DELAY = 7200000; // 2 hours

export const NPS_PROMOTER_THRESHOLD = 9;

export const INSTALL_SLA_DAYS = 7;

export const MODEL_CONFIDENCE_THRESHOLD = 0.80;

export const SAAS_TIERS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 299,
    maxUsers: 3,
    maxLeads: 100,
    maxProposalsPerMonth: 50,
    storageGb: 10,
    apiCallsPerMonth: 5000,
    features: [
      'Basic lead management',
      'Proposal generation',
      'Email support',
    ],
  },
  growth: {
    name: 'Growth',
    monthlyPrice: 999,
    maxUsers: 10,
    maxLeads: 1000,
    maxProposalsPerMonth: 500,
    storageGb: 100,
    apiCallsPerMonth: 50000,
    features: [
      'Advanced lead management',
      'Proposal generation',
      'CRM integration',
      'Priority email support',
      'Custom branding',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 2999,
    maxUsers: 100,
    maxLeads: 10000,
    maxProposalsPerMonth: 5000,
    storageGb: 1000,
    apiCallsPerMonth: 500000,
    features: [
      'Full platform access',
      'Dedicated account manager',
      'Phone support',
      'Custom integrations',
      'White-label solution',
      'Advanced analytics',
    ],
  },
};

// Degradation rates by region (% per year)
export const SYSTEM_DEGRADATION_RATE = 0.008; // 0.8% per year

// System lifespan
export const SYSTEM_LIFESPAN_YEARS = 25;

// Equipment lead times (days)
export const EQUIPMENT_LEAD_TIME_DAYS = 14;

// Financing terms options
export const FINANCING_TERMS: number[] = [7, 10, 15, 20, 25];

// APR ranges by credit tier (estimated)
export const APR_BY_CREDIT_TIER: Record<string, { min: number; max: number }> =
  {
    excellent: { min: 3.99, max: 4.99 },
    good: { min: 5.99, max: 7.99 },
    fair: { min: 8.99, max: 10.99 },
    poor: { min: 11.99, max: 15.99 },
  };

// Federal tax credit (ITC) phase-out schedule
export const FEDERAL_ITC_SCHEDULE: Record<number, number> = {
  2024: 0.3,
  2025: 0.3,
  2026: 0.26,
  2027: 0.22,
  2028: 0.0,
};

// Permitting timeline estimates (business days)
export const PERMITTING_TIMELINE = {
  residential: 15,
  commercial: 30,
};

// Installation timeline estimate (days)
export const INSTALLATION_TIMELINE = {
  residential: 2,
  commercial: 5,
};
