export enum DealStage {
  CONTRACT_SIGNED = 'contract_signed',
  PERMITTING_STARTED = 'permitting_started',
  PERMITTING_APPROVED = 'permitting_approved',
  ENGINEERING_STARTED = 'engineering_started',
  ENGINEERING_COMPLETED = 'engineering_completed',
  EQUIPMENT_ORDERED = 'equipment_ordered',
  EQUIPMENT_ARRIVED = 'equipment_arrived',
  INSTALLATION_SCHEDULED = 'installation_scheduled',
  INSTALLATION_IN_PROGRESS = 'installation_in_progress',
  INSTALLATION_COMPLETED = 'installation_completed',
  PTO_REQUESTED = 'pto_requested',
  PTO_APPROVED = 'pto_approved',
  SYSTEM_LIVE = 'system_live',
}

export interface CommitmentSummary {
  systemSize: number;
  monthlyPayment: number;
  paymentType: string;
  loanTerm?: number;
  apr?: number;
  estimatedMonthlyProduction: number;
  estimatedAnnualSavings: number;
  twentyFiveYearSavings: number;
  federalTaxCredit: number;
  totalSystemCost: number;
  costAfterIncentives: number;
}

export interface CustomerDashboardData {
  [key in DealStage]?: Date;
}

export interface Deal {
  id: string;
  leadId: string;
  proposalId: string;
  tenantId: string;
  installerId?: string;
  stage: DealStage;
  stageHistory: CustomerDashboardData;
  contractSignedAt?: Date;
  contractDocusignId?: string;
  permittingStartedAt?: Date;
  permittingApprovedAt?: Date;
  engineeringStartedAt?: Date;
  engineeringCompletedAt?: Date;
  equipmentOrderedAt?: Date;
  equipmentArrivedAt?: Date;
  installationScheduledAt?: Date;
  installationStartedAt?: Date;
  installationCompletedAt?: Date;
  ptoRequestedAt?: Date;
  ptoApprovedAt?: Date;
  systemLiveAt?: Date;
  systemSize: number;
  monthlyPayment: number;
  paymentType: string;
  loanTerm?: number;
  apr?: number;
  federalTaxCredit: number;
  estimatedMonthlyProduction: number;
  estimatedAnnualSavings: number;
  estimatedTwentyFiveYearSavings: number;
  totalSystemCost: number;
  costAfterIncentives: number;
  utilityProvider: string;
  accountNumber: string;
  meterNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
