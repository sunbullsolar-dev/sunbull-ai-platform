import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

export interface UtilityRate {
  provider: string;
  baseRate: number;
  nemRate?: number;
  nem3Rate?: number;
}

const client = axios.create({
  baseURL: 'https://openei.org/services/rest',
});

export const lookupUtilityRates = async (
  address: string,
  zipCode: string
): Promise<UtilityRate> => {
  const cacheKey = `utility_rates:${zipCode}`;
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.debug('Utility rates from cache', { zipCode });
      return JSON.parse(cached);
    }

    const response = await client.get('/v1/utilities', {
      params: {
        format: 'json',
        zipcode: zipCode,
      },
    });

    if (!response.data.results || !response.data.results.length) {
      throw new Error('No utilities found for zipcode');
    }

    const utility = response.data.results[0];
    
    const rateResponse = await client.get('/v1/rates', {
      params: {
        format: 'json',
        utility: utility.id,
        sector: 'Residential',
        limit: 1,
      },
    });

    const rate = rateResponse.data.results?.[0] || {};

    const utilityRate: UtilityRate = {
      provider: utility.name,
      baseRate: rate.energyrate || 0.12,
      nemRate: rate.summerenergylongrateoffpeak || 0.05,
      nem3Rate: rate.nem3 || 0.04,
    };

    await cacheSet(cacheKey, JSON.stringify(utilityRate), 86400 * 30);
    
    return utilityRate;
  } catch (error) {
    logger.error('Utility rate lookup error', { zipCode, error });
    throw error;
  }
};

export const estimateExportRate = (state: string, nemGeneration: number): number => {
  const nemRates: Record<string, number> = {
    CA: 0.04,
    NV: 0.08,
    HI: 0.12,
    TX: 0.06,
  };

  return nemRates[state] || 0.05;
};

export default {
  lookupUtilityRates,
  estimateExportRate,
};
