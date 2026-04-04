export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES_REP = 'sales_rep',
  INSTALLER = 'installer',
  CUSTOMER = 'customer',
  FINANCE = 'finance',
  SUPPORT = 'support',
}

export interface User {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  profilePicture?: string;
  title?: string;
  department?: string;
  permissions: string[];
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  mfaEnabled: boolean;
  apiKeyHash?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
