/**
 * LightReach / Palmetto Finance integration via browser-tab relay.
 *
 * Discovered endpoints (all on https://palmetto.finance, same-origin cookie auth):
 *   POST /api/v2/accounts                 — create homeowner account
 *   GET  /api/accounts/{id}               — read account
 *   POST /api/accounts/{id}/system-design — attach system design
 *   POST /api/accounts/{id}/quotes        — generate PPA/Lease quote
 *   GET  /api/utilities?advancedFilters=…  — utility + tariff catalog
 *
 * The create-account schema was reverse-engineered from live 400 responses.
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
  logger.info('[lightreach] quotePPA start', { address: input.address });
  const accountId = await createAccount(input);
  logger.info('[lightreach] account created', { accountId });
  try {
    await attachSystemDesign(accountId, input.systemSizeKw, input.annualProductionKwh);
  } catch (e) {
    logger.warn('[lightreach] attachSystemDesign failed, continuing', { err: (e as any)?.message });
  }
  const quote = await generateQuote(accountId);
  logger.info('[lightreach] quote returned', { accountId, keys: Object.keys(quote || {}) });

  // Unknown response shape until first real call — extract common candidate fields.
  const raw = quote || {};
  return {
    accountId,
    quoteId: raw.id || raw.quoteId,
    ratePerKwh: raw.ratePerKwh || raw.rate || raw.pricePerKwh,
    escalator: raw.escalator || raw.annualEscalator,
    term: raw.term || raw.termYears,
    monthlyPayment: raw.monthlyPayment || raw.firstYearMonthlyPayment,
    year1Savings: raw.year1Savings || raw.firstYearSavings,
    lifetimeSavings: raw.lifetimeSavings || raw.totalSavings,
    raw,
  };
}
