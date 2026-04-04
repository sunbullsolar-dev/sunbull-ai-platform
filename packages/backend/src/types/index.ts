export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'sales_rep' | 'installer' | 'homeowner';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  brandColor?: string;
  logo?: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'new' | 'qualified' | 'proposal_sent' | 'proposal_viewed' | 'deal_created' | 'closed' | 'lost';
  tcpaConsent: boolean;
  tcpaConsentDate: Date;
  estimatedSystemSize?: number;
  roofCondition?: string;
  utility?: string;
  estimatedAnnualUsage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  leadId: string;
  tenantId: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  roofAnalysis: {
    area: number;
    azimuth: number;
    pitch: number;
    shading: number;
    usableSurface: number;
  };
  systemSize: number;
  annualProduction: number;
  paymentOptions: PaymentOption[];
  roi?: {
    year25Total: number;
    year10Total: number;
    paybackPeriod: number;
  };
  proposalText?: string;
  viewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentOption {
  id: string;
  type: 'cash' | 'loan' | 'lease' | 'ppa';
  lender?: string;
  monthlyPayment?: number;
  apr?: number;
  term?: number;
  downPayment?: number;
  totalSystemCost?: number;
  savingsYear1?: number;
  savingsYear25?: number;
}

export interface Deal {
  id: string;
  leadId: string;
  tenantId: string;
  stage: 'proposal_selected' | 'payment_pending' | 'signed' | 'inspection_scheduled' | 'inspection_completed' | 'installation_scheduled' | 'installation_in_progress' | 'completed' | 'cancelled';
  selectedPaymentOption: PaymentOption;
  installerId?: string;
  inspectionDate?: Date;
  installationDate?: Date;
  systemSize: number;
  systemCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest {
  user: User;
  tenant?: Tenant;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
