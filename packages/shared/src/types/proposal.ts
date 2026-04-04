export interface ProposalHeroNumbers {
  panelCount: number;
  systemSizeKw: number;
  offsetPercentage: number;
  currentMonthlyBill: number;
}

export interface TwentyFiveYearComparison {
  utilityCost: number;
  solarCost: number;
  totalSavings: number;
  yearsToBreakEven: number;
}

export interface PaymentOptionCard {
  type: string;
  monthlyPayment: number;
  apr?: number;
  loanTerm?: number;
  description: string;
  qualified: boolean;
}

export interface DataTransparency {
  roofSource: string;
  productionSource: string;
  utilitySource: string;
  billUploaded: boolean;
}

export interface Proposal {
  id: string;
  leadId: string;
  tenantId: string;
  generatedAt: Date;
  expiresAt: Date;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  heroNumbers: ProposalHeroNumbers;
  comparison25Year: TwentyFiveYearComparison;
  paymentOptions: PaymentOptionCard[];
  selectedPaymentOption?: string;
  dataTransparency: DataTransparency;
  systemDesignUrl?: string;
  estimatedProductionMwh: number;
  estimatedMonthlyProduction: number;
  systemCostBeforeIncentives: number;
  federalTaxCredit: number;
  systemCostAfterIncentives: number;
  roofConditionScore?: number;
  degradationRate: number;
  presentationUrl?: string;
  viewedAt?: Date;
  viewedByName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
