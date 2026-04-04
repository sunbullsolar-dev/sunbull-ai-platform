import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

export interface RoofAnalysis {
  area: number;
  azimuth: number;
  pitch: number;
  shading: number;
  usableSurface: number;
}

const client = axios.create({
  baseURL: 'https://solar.googleapis.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeRoof = async (address: string): Promise<RoofAnalysis> => {
  const cacheKey = `roof_analysis:${address}`;
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.debug('Roof analysis from cache', { address });
      return JSON.parse(cached);
    }

    const response = await client.post(
      '/buildingInsights:analyze',
      {
        location: {
          address,
        },
      },
      {
        params: {
          key: config.external.googleSolarApiKey,
        },
      }
    );

    const roofData = response.data.roofSegmentSummaries?.[0] || {};
    
    const analysis: RoofAnalysis = {
      area: roofData.segmentArea || 0,
      azimuth: roofData.azimuthDegrees || 0,
      pitch: roofData.pitchDegrees || 0,
      shading: roofData.sunshineQuantiles?.[0] || 0.8,
      usableSurface: (roofData.segmentArea || 0) * 0.8,
    };

    await cacheSet(cacheKey, JSON.stringify(analysis), 86400 * 30);
    
    return analysis;
  } catch (error) {
    logger.error('Roof analysis error', { address, error });
    throw error;
  }
};

export const getIncident = async (address: string) => {
  try {
    const response = await client.post(
      '/geoLocation:lookup',
      {
        location: {
          address,
        },
      },
      {
        params: {
          key: config.external.googleSolarApiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    logger.error('Geolocation lookup error', { address, error });
    throw error;
  }
};

export default {
  analyzeRoof,
  getIncident,
};
