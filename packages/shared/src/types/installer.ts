export enum InstallerStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export interface InstallerVettingRequirements {
  backgroundCheckPassed: boolean;
  backgroundCheckDate?: Date;
  licensesVerified: boolean;
  licensesVerifiedDate?: Date;
  insuranceVerified: boolean;
  insuranceExpiryDate?: Date;
  referencesVerified: boolean;
  referencesVerifiedDate?: Date;
  safetyTrainingCompleted: boolean;
  safetyTrainingDate?: Date;
  qualityCertificationPassed: boolean;
  qualityCertificationDate?: Date;
}

export interface Installer {
  id: string;
  tenantId: string;
  companyName: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiryDate: Date;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: Date;
  serviceAreas: string[];
  yearsInBusiness: number;
  totalInstallations: number;
  averageRating: number;
  certifications: string[];
  employees: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  status: InstallerStatus;
  vettingRequirements: InstallerVettingRequirements;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}
