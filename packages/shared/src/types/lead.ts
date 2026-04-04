export enum LeadStatus {
  INTERESTED = 'interested',
  QUALIFIED = 'qualified',
  PROPOSAL_SENT = 'proposal_sent',
  PROPOSAL_ACCEPTED = 'proposal_accepted',
  UNDER_CONTRACT = 'under_contract',
  PERMITTING = 'permitting',
  ENGINEERING = 'engineering',
  INSTALLATION_SCHEDULED = 'installation_scheduled',
  INSTALLATION_IN_PROGRESS = 'installation_in_progress',
  SYSTEM_LIVE = 'system_live',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  LOST = 'lost',
}

export enum PaymentOption {
  CASH = 'cash',
  LOAN_25_YEAR = 'loan_25_year',
  LOAN_20_YEAR = 'loan_20_year',
  LOAN_15_YEAR = 'loan_15_year',
  LOAN_10_YEAR = 'loan_10_year',
  LOAN_7_YEAR = 'loan_7_year',
  PPA = 'ppa',
  LEASE = 'lease',
}

export enum LeadSource {
  ORGANIC_SEARCH = 'organic_search',
  PAID_SEARCH = 'paid_search',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  DIRECT = 'direct',
  PARTNER = 'partner',
  EVENTS = 'events',
  OTHER = 'other',
}

export enum FinancingStatus {
  NOT_STARTED = 'not_started',
  PRE_QUALIFIED = 'pre_qualified',
  QUALIFIED = 'qualified',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  monthlyBillAmount: number;
  monthlyKwhUsage: number;
  roofType?: string;
  roofCondition?: string;
  roofAge?: number;
  homeownershipStatus: string;
  interestLevel?: number;
  status: LeadStatus;
  source: LeadSource;
  financingStatus?: FinancingStatus;
  tcpaConsent: boolean;
  tcpaConsentDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  proposalId?: string;
  dealId?: string;
  lastInteractionAt?: Date;
  abandonmentScore?: number;
}

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  monthlyBillAmount: number;
  monthlyKwhUsage: number;
  tcpaConsent: boolean;
}
