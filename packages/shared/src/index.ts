// Export all types
export * from './types/lead';
export * from './types/proposal';
export * from './types/deal';
export * from './types/installer';
export * from './types/tenant';
export * from './types/user';
export * from './types/communication';
export * from './types/api';

// Export all constants
export * from './constants/index';

// Export all utilities
export {
  validateFullName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateBillAmount,
  validateKwhUsage,
  formatPhone,
  isDisposableEmail,
  validateLeadIntake,
} from './utils/validation';
