import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

export interface PVWattsResult {
  annualProduction: number;
  monthlyProduction: number[];
  systemInputs: {
    dcSystemSize: number;
    acSystemSize: number;
  };
}

const client = axios.create({
  baseURL: 'https://developer.nrel.gov/api/pvwatts/v8.json',
});

export const calculateProduction = async (
  latitude: number,
  longitude: number,
  systemSize: number,
  azimuth: number = 180,
  tilt: number = 20
): Promise<PVWattsResult> => {
  const cacheKey = `pvwatts:${latitude}:${longitude}:${systemSize}`;
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.debug('PVWatts result from cache');
      return JSON.parse(cached);
    }

    const response = await client.get('', {
      params: {
        api_key: config.external.nrelApiKey,
        lat: latitude,
        lon: longitude,
        system_capacity: systemSize,
        azimuth,
        tilt,
        array_type: 1,
        module_type: 1,
        losses: 14.08,
      },
    });

    const result: PVWattsResult = {
      annualProduction: response.data.outputs.ac_annual || 0,
      monthlyProduction: response.data.outputs.ac_monthly || [],
      systemInputs: {
        dcSystemSize: response.data.inputs.dc_ac_ratio || 0,
        acSystemSize: systemSize,
      },
    };

    await cacheSet(cacheKey, JSON.stringify(result), 86400 * 30);
    
    return result;
  } catch (error: any) {
    logger.error('PVWatts request failed', {
      systemSize, latitude, longitude,
      status: error?.response?.status,
      msg: error?.message,
      data: error?.response?.data,
    });
    throw new Error(
      `PVWatts production calculation failed: ${
        error?.response?.data?.errors?.[0] || error?.message
      }`
    );
  }
};

export default {
  calculateProduction,
};
