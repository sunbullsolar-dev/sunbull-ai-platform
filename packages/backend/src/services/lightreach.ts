/**
 * LightReach / Palmetto Finance integration via browser-tab relay.
 *
 * Quotes are fetched in a SINGLE call to /api/v3/estimated-pricing — no
 * account/system-design persistence required. The endpoint returns an array
 * of candidate PPA products (varying kwhRate + escalationRate) which we
 * filter to the best option for the proposal.
 *
 * Request schema discovered by iteratively filling 400-response requirements.
 */
import { enqueue, RelayResponse } from './lightreachRelay';
import logger from '../utils/logger';

export interface LightReachQuoteInput {
  address: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lon: number;
  systemSizeKw: number;
  annualProductionKwh: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  utilityLseId: string;
  utilityTariffId: number;
  utilityRate: number;
  // Pulled from Sunbull org config / env
  salesRepName: string;
  salesRepEmail: string;
  salesRepLicenseNumber: string;
  salesRepPhoneNumber?: string;
  reference?: string;
}

export interface LightReachQuoteResult {
  accountId: string;
  quoteId?: string;
  ratePerKwh?: number;
  escalator?: number;
  term?: number;
  monthlyPayment?: number;
  year1Savings?: number;
  lifetimeSavings?: number;
  raw: any;
}

async function relay(method: 'GET' | 'POST', path: string, body?: any): Promise<RelayResponse> {
  return enqueue({ method, path, body });
}

export interface LightReachPricingProduct {
  productId: string;
  type: string;
  name: string;
  escalationRate: number;
  kwhRate: number;
  ppwRate: number;
  monthlyPayments?: Array<{ year: number; monthlyPayment: number; totalMonthlyPayment: number; batteryPayment: number }>;
  term?: number;
  epcPpw?: number;
}

/**
 * Fetch live LightReach PPA pricing. Single POST, no account persistence.
 * Returns all candidate products (typically ~100 combos of kwhRate × escalator).
 */
export async function estimatedPricing(input: LightReachQuoteInput): Promise<LightReachPricingProduct[]> {
  const body = {
    lseId: input.utilityLseId,
    tariffId: input.utilityTariffId,
    utilityRate: input.utilityRate,
    systemSizeKw: input.systemSizeKw,
    annualProductionKwh: input.annualProductionKwh,
    systemFirstYearProductionKwh: input.annualProductionKwh,
    state: input.state,
    zip: input.zip,
    programType: 'solar',
    contractType: 'ppa',
    organizationId: process.env.LIGHTREACH_ORG_ID || 'pacific-sky-solar-llc',
    salesRepLicenseNumber: input.salesRepLicenseNumber,
    coordinates: { lat: input.lat, lon: input.lon },
    address: {
      address1: input.address1,
      city: input.city,
      state: input.state,
      zip: input.zip,
    },
    address1: input.address1,
    city: input.city,
  };
  const res = await relay('POST', '/api/v3/estimated-pricing', body);
  if (res.status >= 400) {
    throw new Error(`LightReach estimatedPricing failed ${res.status}: ${JSON.stringify(res.body).slice(0, 400)}`);
  }
  if (!Array.isArray(res.body)) {
    throw new Error(`LightReach estimatedPricing: unexpected body shape: ${JSON.stringify(res.body).slice(0, 300)}`);
  }
  return res.body as LightReachPricingProduct[];
}

/**
 * Pick the best PPA product for a proposal.
 * Strategy: prefer the lowest kwhRate × escalator combination that covers
 * the customer's needs, defaulting to the 2.99% escalator bucket (most common
 * industry standard) and the minimum kwhRate within it.
 */
function pickBestProduct(products: LightReachPricingProduct[]): LightReachPricingProduct {
  const targetEsc = 0.0299;
  const bucket = products.filter((p) => Math.abs(p.escalationRate - targetEsc) < 0.0005);
  const pool = bucket.length ? bucket : products;
  return pool.slice().sort((a, b) => a.kwhRate - b.kwhRate)[0];
}

// Legacy account-based flow — kept for reference / potential future use.
export async function createAccount(input: LightReachQuoteInput): Promise<string> {
  const body = {
    language: 'English',
    programType: 'solar',
    reference: input.reference || `sunbull-${Date.now()}`,
    salesRepName: input.salesRepName,
    salesRepEmail: input.salesRepEmail,
    salesRepLicenseNumber: input.salesRepLicenseNumber,
    salesRepPhoneNumber: input.salesRepPhoneNumber || '',
    address: {
      address1: input.address1,
      city: input.city,
      state: input.state,
      zip: input.zip,
    },
    coordinates: { lat: input.lat, lon: input.lon },
    utility: {
      lseId: input.utilityLseId,
      tariffId: input.utilityTariffId,
      rate: input.utilityRate,
    },
    applicants: [{
      type: 'primary',
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      email: input.email,
      address: {
        address1: input.address1,
        city: input.city,
        state: input.state,
        zip: input.zip,
      },
    }],
  };

  const res = await relay('POST', '/api/v2/accounts', body);
  if (res.status >= 400) {
    throw new Error(`LightReach createAccount failed ${res.status}: ${JSON.stringify(res.body).slice(0, 300)}`);
  }
  const id = res.body?.id || res.body?.accountId || res.body?.account?.id;
  if (!id) throw new Error(`LightReach createAccount: no id in response: ${JSON.stringify(res.body).slice(0, 300)}`);
  return id;
}

export async function attachSystemDesign(accountId: string, systemSizeKw: number, annualProductionKwh: number) {
  const body = {
    systemSizeKw,
    annualProductionKwh,
    systemFirstYearProductionKwh: annualProductionKwh,
  };
  const res = await relay('POST', `/api/accounts/${accountId}/system-design`, body);
  if (res.status >= 400) {
    logger.warn('[lightreach] system-design non-2xx (may be OK)', { status: res.status, body: res.body });
  }
  return res.body;
}

export async function generateQuote(accountId: string): Promise<any> {
  const res = await relay('POST', `/api/accounts/${accountId}/quotes`, {});
  if (res.status >= 400) {
    throw new Error(`LightReach generateQuote failed ${res.status}: ${JSON.stringify(res.body).slice(0, 400)}`);
  }
  return res.body;
}

export async function quotePPA(input: LightReachQuoteInput): Promise<LightReachQuoteResult> {
  logger.info('[lightreach] estimatedPricing start', { address: input.address });
  const products = await estimatedPricing(input);
  logger.info('[lightreach] estimatedPricing returned', { count: products.length });
  if (!products.length) {
    throw new Error('LightReach estimatedPricing returned no products');
  }
  const best = pickBestProduct(products);
  const firstMonthly = best.monthlyPayments?.[0]?.totalMonthlyPayment ?? best.monthlyPayments?.[0]?.monthlyPayment;
  logger.info('[lightreach] picked best product', {
    productId: best.productId,
    kwhRate: best.kwhRate,
    escalationRate: best.escalationRate,
    monthly: firstMonthly,
  });
  return {
    accountId: '',
    quoteId: best.productId,
    ratePerKwh: best.kwhRate,
    escalator: best.escalationRate,
    term: best.term ?? 25,
    monthlyPayment: firstMonthly,
    year1Savings: undefined,
    lifetimeSavings: undefined,
    raw: { best, allCount: products.length },
  };
}
