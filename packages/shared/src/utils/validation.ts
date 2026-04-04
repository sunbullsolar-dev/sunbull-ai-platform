// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone regex pattern (10 digits, with optional formatting)
const PHONE_REGEX = /^\+?1?\s?-?\(?([0-9]{3})\)?-?\s?([0-9]{3})-?\s?([0-9]{4})$/;

// Name regex pattern (allows letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

// Disposable email domains blocklist
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'sharklasers.com',
  'temp-mail.org',
  'yopmail.com',
  'trashmail.com',
  'fakeinbox.com',
  'spam4.me',
  'dispostable.com',
  'trashmail.de',
  '10minemail.com',
  'crazymailing.com',
  'cutypaste.com',
  'emailondeck.com',
  'fakeemail.net',
  'getnada.com',
  'guerrillamail.info',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.ws',
  'grr.la',
  'guerrillamail.de',
  'guerrillamail.biz',
  'guerrillamail.com',
  'pokemail.net',
  'spam.la',
];

/**
 * Validates if a string is a valid full name
 */
export function validateFullName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  const trimmed = name.trim();
  return NAME_REGEX.test(trimmed);
}

/**
 * Validates if a string is a valid email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const trimmed = email.toLowerCase().trim();
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Validates if a string is a valid phone number
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Validates an address object
 */
export function validateAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}): boolean {
  if (!address || typeof address !== 'object') {
    return false;
  }

  const { street, city, state, zipCode } = address;

  // Check required fields
  if (!street || !city || !state || !zipCode) {
    return false;
  }

  // Validate state (2 letter code)
  if (!/^[A-Z]{2}$/.test(state)) {
    return false;
  }

  // Validate ZIP code (5 or 9 digit format)
  if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
    return false;
  }

  return true;
}

/**
 * Validates if a bill amount is within acceptable range
 */
export function validateBillAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return false;
  }
  return amount >= 30 && amount <= 2000;
}

/**
 * Validates if kWh usage is within acceptable range
 */
export function validateKwhUsage(kwh: number): boolean {
  if (typeof kwh !== 'number' || isNaN(kwh)) {
    return false;
  }
  return kwh >= 100 && kwh <= 30000;
}

/**
 * Formats a phone number to standard format
 */
export function formatPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const cleaned = phone.replace(/\D/g, '');

  // Handle 10-digit format
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Handle 11-digit format (with country code)
  if (cleaned.length === 11) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Checks if an email is a disposable/temporary email
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const domain = email.toLowerCase().split('@')[1];

  if (!domain) {
    return false;
  }

  return DISPOSABLE_EMAIL_DOMAINS.some(
    (disposableDomain) => domain === disposableDomain || domain.endsWith(disposableDomain),
  );
}

/**
 * Comprehensive lead intake validation
 */
export function validateLeadIntake(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  monthlyBillAmount?: number;
  monthlyKwhUsage?: number;
  tcpaConsent?: boolean;
}): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!validateFullName(data.firstName || '')) {
    errors.firstName = 'First name is invalid';
  }

  if (!validateFullName(data.lastName || '')) {
    errors.lastName = 'Last name is invalid';
  }

  if (!validateEmail(data.email || '')) {
    errors.email = 'Email is invalid';
  } else if (isDisposableEmail(data.email || '')) {
    errors.email = 'Disposable email addresses are not accepted';
  }

  if (!validatePhone(data.phone || '')) {
    errors.phone = 'Phone number is invalid';
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.address = 'Address is invalid';
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'City is invalid';
  }

  if (!data.state || !/^[A-Z]{2}$/.test(data.state)) {
    errors.state = 'State code is invalid';
  }

  if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
    errors.zipCode = 'ZIP code is invalid';
  }

  if (!validateBillAmount(data.monthlyBillAmount || 0)) {
    errors.monthlyBillAmount = 'Monthly bill amount must be between $30 and $2000';
  }

  if (!validateKwhUsage(data.monthlyKwhUsage || 0)) {
    errors.monthlyKwhUsage = 'Monthly kWh usage must be between 100 and 30,000';
  }

  if (data.tcpaConsent !== true) {
    errors.tcpaConsent = 'TCPA consent is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
