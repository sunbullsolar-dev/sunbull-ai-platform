/**
 * SaaS Configuration Types
 * Shared types for tenant management, billing, and branding
 */

export type PlanTier = 'starter' | 'growth' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
export type InstallerSource = 'sunbull' | 'tenant';

/**
 * SaaS Subscription model
 */
export interface SaaSSubscription {
  id: string;
  tenantId: string;
  stripeSubscriptionId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  leadUsage: number;
  leadLimit: number;
  dealUsage: number;
  dealLimit: number;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tenant onboarding data structure (all 5 steps)
 */
export interface TenantOnboardingData {
  // Step 1: Company info
  companyName: string;
  companyDomain: string;
  contactEmail: string;
  contactPhone: string;
  companyWebsite?: string;

  // Step 2: Plan selection
  selectedPlan: PlanTier;

  // Step 3: Branding setup
  branding: BrandingConfig;

  // Step 4: Installer config
  installerSource: InstallerSource;
  useOwnInstallers?: boolean;

  // Step 5: Review data
  agreedToTerms: boolean;
}

/**
 * Branding configuration for white-label customization
 */
export interface BrandingConfig {
  logoUrl: string;
  logoB64?: string; // Base64 encoded logo for upload
  primaryColor: string; // hex color
  secondaryColor: string; // hex color
  accentColor?: string; // hex color
  fontFamily: string; // e.g., 'Inter', 'Roboto', 'Poppins'
  faviconUrl?: string;
  customCss?: string;
  companyName: string;
  tagline?: string;
}

/**
 * Tenant configuration including subscription and branding
 */
export interface Tenant {
  id: string;
  companyName: string;
  subdomain: string;
  domain: string;
  branding: BrandingConfig;
  subscription: SaaSSubscription | null;
  contactEmail: string;
  contactPhone: string;
  companyWebsite?: string;
  status: 'active' | 'inactive' | 'suspended';
  installerSource: InstallerSource;
  useOwnInstallers: boolean;
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt?: Date;
}

/**
 * Usage report for tenant analytics
 */
export interface UsageReport {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  leads: {
    total: number;
    converted: number;
    conversionRate: number;
    cost: number;
  };
  deals: {
    total: number;
    won: number;
    winRate: number;
    totalValue: number;
    averageValue: number;
  };
  revenue: {
    total: number;
    fromInstallers: number;
    fromLeads: number;
  };
  usage: {
    leadUsage: number;
    leadLimit: number;
    dealUsage: number;
    dealLimit: number;
    percentageUsed: number;
  };
}

/**
 * Tenant invitation/onboarding token
 */
export interface TenantInvitation {
  id: string;
  tenantId?: string;
  token: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

/**
 * API usage limits per plan
 */
export interface PlanLimits {
  monthlyLeads: number;
  monthlyDeals: number;
  teamMembers: number;
  customDomain: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  ssoIntegration: boolean;
  dedicatedSupport: boolean;
  priority: 'standard' | 'priority' | 'dedicated';
}

/**
 * Plan definition with pricing
 */
export interface SaasPlan {
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  stripePriceId: string;
  stripeAnnualPriceId: string;
  limits: PlanLimits;
  features: string[];
}

/**
 * Billing event for tracking
 */
export interface BillingEvent {
  id: string;
  tenantId: string;
  type:
    | 'subscription_created'
    | 'subscription_updated'
    | 'subscription_canceled'
    | 'invoice_created'
    | 'invoice_paid'
    | 'invoice_failed'
    | 'overage_warning'
    | 'overage_applied';
  amount?: number;
  currency?: string;
  description: string;
  stripeEventId?: string;
  createdAt: Date;
}

/**
 * Tenant API key for programmatic access
 */
export interface TenantApiKey {
  id: string;
  tenantId: string;
  key: string; // hashed
  keyPreview: string; // last 4 characters visible
  name: string;
  scopes: string[];
  rateLimit: number; // requests per minute
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

/**
 * Audit log for tenant actions
 */
export interface TenantAuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Validation error for onboarding steps
 */
export interface OnboardingValidationError {
  step: number;
  field: string;
  message: string;
}
