export enum SaaSPlan {
  STARTER = 'starter',
  GROWTH = 'growth',
  ENTERPRISE = 'enterprise',
}

export interface TenantBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  domain?: string;
}

export interface Tenant {
  id: string;
  name: string;
  description?: string;
  plan: SaaSPlan;
  status: 'active' | 'suspended' | 'inactive' | 'trial';
  branding: TenantBranding;
  website?: string;
  supportEmail?: string;
  supportPhone?: string;
  billingEmail?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  maxUsers: number;
  maxLeads: number;
  maxProposalsPerMonth: number;
  storageGb: number;
  apiCallsPerMonth: number;
  features: string[];
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  monthlyPrice: number;
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  paymentMethodOnFile: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
