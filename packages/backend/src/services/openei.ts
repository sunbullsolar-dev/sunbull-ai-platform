import axios from 'axios';
import logger from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';
import config from '../config';

// Infer a utility provider from a ZIP code prefix for common US markets.
// Used as a fallback when OpenEI is unavailable or returns no data.
const inferUtilityFromZip = (zipCode: string): string | null => {
  const z = parseInt(zipCode.slice(0, 5), 10);
  if (isNaN(z)) return null;
  // Los Angeles (LADWP service territory, approx)
  if (z >= 90001 && z <= 90084) return 'LADWP';
  if (z >= 90086 && z <= 90089) return 'LADWP';
  if (z >= 90091 && z <= 90103) return 'LADWP';
  if (z >= 91040 && z <= 91043) return 'LADWP';
  if (z >= 91303 && z <= 91499) return 'LADWP';
  // SCE (Southern California Edison) — broad Southern California
  if (z >= 90200 && z <= 93599) return 'SCE';
  // SDG&E — San Diego area
  if (z >= 91900 && z <= 92199) return 'SDGE';
  // PG&E — Northern California
  if (z >= 93600 && z <= 96199) return 'PG&E';
  // NY Con Ed
  if (z >= 10001 && z <= 10499) return 'Con Ed';
  // Florida (FPL approx)
  if (z >= 33000 && z <= 34999) return 'FPL';
  // Texas deregulated (TXU default)
  if (z >= 75000 && z <= 79999) return 'TXU';
  return null;
};

export interface UtilityRate {
  provider: string;
  baseRate: number;
  nemRate?: number;
  nem3Rate?: number;
  source: 'table' | 'openei';
}

// Residential average all-in rates (generation + delivery), 2026 CA tariffs.
const RATE_TABLE: Record<string, Omit<UtilityRate, 'source'>> = {
  LADWP:    { provider: 'LADWP',     baseRate: 0.19, nemRate: 0.08, nem3Rate: 0.06 },
  SCE:      { provider: 'SCE',       baseRate: 0.34, nemRate: 0.06, nem3Rate: 0.05 },
  'PG&E':   { provider: 'PG&E',      baseRate: 0.40, nemRate: 0.06, nem3Rate: 0.05 },
  SDGE:     { provider: 'SDG&E',     baseRate: 0.42, nemRate: 0.06, nem3Rate: 0.05 },
  TXU:      { provider: 'TXU',       baseRate: 0.14, nemRate: 0.03, nem3Rate: 0.03 },
  NRG:      { provider: 'NRG',       baseRate: 0.14, nemRate: 0.03, nem3Rate: 0.03 },
  PSEG:     { provider: 'PSEG',      baseRate: 0.19, nemRate: 0.05, nem3Rate: 0.05 },
  'Con Ed': { provider: 'Con Edison',baseRate: 0.28, nemRate: 0.05, nem3Rate: 0.05 },
  FPL:      { provider: 'FPL',       baseRate: 0.15, nemRate: 0.04, nem3Rate: 0.04 },
  TECO:     { provider: 'TECO',      baseRate: 0.15, nemRate: 0.04, nem3Rate: 0.04 },
};

const openeiClient = axios.create({
  baseURL: 'https://api.openei.org',
  timeout: 10000,
});

export const lookupUtilityRates = async (
  utilityCode: string | null,
  zipCode: string
): Promise<UtilityRate> => {
  const cacheKey = `utility_rates:${utilityCode || 'auto'}:${zipCode}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  if (utilityCode && RATE_TABLE[utilityCode]) {
    const rate: UtilityRate = { ...RATE_TABLE[utilityCode], source: 'table' };
    try { await cacheSet(cacheKey, JSON.stringify(rate), 86400 * 30); } catch {}
    return rate;
  }

  const fallbackToTable = (reason: string): UtilityRate | null => {
    const inferred = inferUtilityFromZip(zipCode);
    if (inferred && RATE_TABLE[inferred]) {
      logger.warn('OpenEI unavailable, using ZIP→utility table fallback', {
        zipCode,
        inferred,
        reason,
      });
      const rate: UtilityRate = { ...RATE_TABLE[inferred], source: 'table' };
      cacheSet(cacheKey, JSON.stringify(rate), 86400 * 30).catch(() => {});
      return rate;
    }
    return null;
  };

  try {
    const resp = await openeiClient.get('/utility_rates', {
      params: {
        version: 7,
        format: 'json',
        detail: 'minimal',
        address: zipCode,
        limit: 5,
        sector: 'Residential',
        approved: 'true',
        api_key: config.external.nrelApiKey || 'DEMO_KEY',
      },
    });
    const items: any[] = resp.data?.items || [];
    if (!items.length) {
      throw new Error(`OpenEI returned no residential rates for ZIP ${zipCode}`);
    }
    const best = items[0];
    const firstRate =
      best?.energyratestructure?.[0]?.[0]?.rate ??
      best?.energyratestructure?.[0]?.[0]?.adj ??
      null;
    if (typeof firstRate !== 'number') {
      throw new Error('OpenEI rate structure missing numeric rate');
    }
    const rate: UtilityRate = {
      provider: best.utility || 'Unknown',
      baseRate: firstRate,
      nemRate: 0.05,
      nem3Rate: 0.04,
      source: 'openei',
    };
    try { await cacheSet(cacheKey, JSON.stringify(rate), 86400 * 30); } catch {}
    return rate;
  } catch (error: any) {
    logger.error('OpenEI tariff lookup failed', {
      utilityCode,
      zipCode,
      msg: error?.message,
    });
    const fallback = fallbackToTable(error?.message || 'unknown');
    if (fallback) return fallback;
    throw new Error(
      `Utility tariff lookup failed for ${utilityCode || zipCode}: ${error?.message}`
    );
  }
};

export const estimateExportRate = (state: string): number => {
  const nemRates: Record<string, number> = {
    CA: 0.05, NV: 0.08, HI: 0.12, TX: 0.06,
  };
  return nemRates[state] || 0.05;
};

export default { lookupUtilityRates, estimateExportRate };
