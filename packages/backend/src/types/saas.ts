/**
 * SaaS Configuration Types
 * Local copy of shared types for standalone deployment
 */

export type PlanTier = 'starter' | 'growth' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
export type InstallerSource = 'sunbull' | 'tenant';

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

export interface BrandingConfig {
  logoUrl: string;
  logoB64?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily: string;
  faviconUrl?: string;
  customCss?: string;
  companyName: string;
  tagline?: string;
}

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

export interface UsageReport {
  tenantId: string;
  period: { start: Date; end: Date };
  leads: { total: number; converted: number; conversionRate: number; cost: number };
  deals: { total: number; won: number; winRate: number; totalValue: number; averageValue: number };
  revenue: { total: number; fromInstallers: number; fromLeads: number };
  usage: { leadUsage: number; leadLimit: number; dealUsage: number; dealLimit: number; percentageUsed: number };
}

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

export interface BillingEvent {
  id: string;
  tenantId: string;
  type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled' | 'invoice_created' | 'invoice_paid' | 'invoice_failed' | 'overage_warning' | 'overage_applied';
  amount?: number;
  currency?: string;
  description: string;
  stripeEventId?: string;
  createdAt: Date;
}
