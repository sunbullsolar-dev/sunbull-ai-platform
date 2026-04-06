import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  postalCode: string;
  administrativeAreaLevel1: string;
}

export interface RoofAnalysis {
  area: number;
  azimuth: number;
  pitch: number;
  shading: number;
  usableSurface: number;
  maxArrayPanelsCount: number;
  latitude: number;
  longitude: number;
  source: 'google-solar' | 'google-solar-estimated';
}

const solarClient = axios.create({
  baseURL: 'https://solar.googleapis.com/v1',
  timeout: 15000,
});

const geocodeClient = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api',
  timeout: 10000,
});

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  const cacheKey = `geocode:${address}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  if (!config.external.googleSolarApiKey) {
    throw new Error('GOOGLE_SOLAR_API_KEY is not set — cannot geocode address');
  }

  const resp = await geocodeClient.get('/geocode/json', {
    params: { address, key: config.external.googleSolarApiKey },
  });

  if (resp.data.status !== 'OK' || !resp.data.results?.length) {
    throw new Error(
      `Address could not be verified: "${address}" (geocode status=${resp.data.status})`
    );
  }

  const r = resp.data.results[0];
  const loc = r.geometry.location;
  const comps: any[] = r.address_components || [];
  const postalCode =
    comps.find((c) => c.types.includes('postal_code'))?.short_name || '';
  const state =
    comps.find((c) => c.types.includes('administrative_area_level_1'))?.short_name || '';

  const result: GeocodeResult = {
    latitude: loc.lat,
    longitude: loc.lng,
    formattedAddress: r.formatted_address,
    postalCode,
    administrativeAreaLevel1: state,
  };

  try { await cacheSet(cacheKey, JSON.stringify(result), 86400 * 30); } catch {}
  return result;
};

export const analyzeRoof = async (address: string): Promise<RoofAnalysis> => {
  const cacheKey = `roof_analysis:${address}`;
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {}

  const geo = await geocodeAddress(address);

  try {
    const resp = await solarClient.get('/buildingInsights:findClosest', {
      params: {
        'location.latitude': geo.latitude,
        'location.longitude': geo.longitude,
        requiredQuality: 'LOW',
        key: config.external.googleSolarApiKey,
      },
    });

    const solar = resp.data?.solarPotential || {};
    const segs: any[] = solar.roofSegmentStats || [];
    if (!segs.length) throw new Error('No roof segments returned by Google Solar');

    const best = segs.reduce((a, b) =>
      (a.stats?.areaMeters2 || 0) >= (b.stats?.areaMeters2 || 0) ? a : b
    );
    const totalArea = segs.reduce(
      (sum, s) => sum + (s.stats?.areaMeters2 || 0),
      0
    );
    const sq = best.stats?.sunshineQuantiles || [];
    const median = sq.length ? sq[Math.floor(sq.length / 2)] : 1600;
    const shading = Math.max(0.4, Math.min(1, median / 2000));

    const analysis: RoofAnalysis = {
      area: totalArea,
      azimuth: best.azimuthDegrees ?? 180,
      pitch: best.pitchDegrees ?? 20,
      shading,
      usableSurface: totalArea * 0.75,
      maxArrayPanelsCount: solar.maxArrayPanelsCount || 0,
      latitude: geo.latitude,
      longitude: geo.longitude,
      source: 'google-solar',
    };

    try { await cacheSet(cacheKey, JSON.stringify(analysis), 86400 * 30); } catch {}
    return analysis;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404) {
      logger.warn('Google Solar has no imagery for building, using geocoded estimate', {
        address,
      });
      return {
        area: 140,
        azimuth: 180,
        pitch: 22,
        shading: 0.85,
        usableSurface: 105,
        maxArrayPanelsCount: 20,
        latitude: geo.latitude,
        longitude: geo.longitude,
        source: 'google-solar-estimated',
      };
    }
    logger.error('Google Solar findClosest failed', {
      address,
      status,
      msg: error?.message,
      data: error?.response?.data,
    });
    throw new Error(
      `Roof analysis failed (${status || 'network'}): ${
        error?.response?.data?.error?.message || error?.message
      }`
    );
  }
};

export default { geocodeAddress, analyzeRoof };
