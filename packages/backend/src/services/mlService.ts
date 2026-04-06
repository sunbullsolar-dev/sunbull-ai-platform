import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

export interface SystemSizingRequest {
  roofArea: number;
  annualUsage: number;
  location: string;
}

export interface ROIData {
  year10Total: number;
  year25Total: number;
  paybackPeriod: number;
  monthlyAverage: number;
}

const client = axios.create({
  baseURL: config.mlService.url,
  headers: {
    'X-API-Key': config.mlService.apiKey,
  },
  timeout: 30000,
});

export const calculateSystemSize = async (
  data: SystemSizingRequest
): Promise<number> => {
  // Local heuristic fallback: 1 kW per ~1,500 kWh/year, capped by roof area
  // (~70 sq ft per kW). Avoids hard dependency on ml-service route mismatch.
  try {
    const byUsage = (data.annualUsage || 10000) / 1500;
    const byRoof = (data.roofArea || 1500) / 70;
    const systemSize = Math.max(3, Math.min(15, Math.min(byUsage, byRoof)));
    logger.debug('System sizing (local heuristic)', { systemSize });
    return Math.round(systemSize * 10) / 10;
  } catch (error) {
    logger.error('System sizing heuristic error', { error });
    return 7.5;
  }
};

export const calculateROI = async (
  systemSize: number,
  systemCost: number,
  annualProduction: number,
  utilityRate: number,
  nemRate: number,
  location: string
): Promise<ROIData> => {
  try {
    // Local ROI heuristic with 3%/yr utility escalation, 25-yr horizon.
    const annualValueYear1 = annualProduction * utilityRate;
    let cumulative = 0;
    let year10 = 0;
    for (let y = 1; y <= 25; y++) {
      const yearValue = annualValueYear1 * Math.pow(1.03, y - 1);
      cumulative += yearValue;
      if (y === 10) year10 = cumulative;
    }
    const monthlyAverage = annualValueYear1 / 12;
    const paybackPeriod = systemCost > 0 ? systemCost / Math.max(annualValueYear1, 1) : 7;
    const roi: ROIData = {
      year10Total: Math.round(year10),
      year25Total: Math.round(cumulative),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      monthlyAverage: Math.round(monthlyAverage),
    };
    logger.debug('ROI (local heuristic)', { roi });
    return roi;
  } catch (error) {
    logger.error('ROI heuristic error', { error });
    return { year10Total: 15000, year25Total: 55000, paybackPeriod: 7, monthlyAverage: 150 };
  }
};

export const generateProposalCopy = async (
  homeownerName: string,
  systemSize: number,
  monthlySavings: number,
  year25Savings: number,
  paybackPeriod: number
): Promise<string> => {
  try {
    const copy = `${homeownerName}, based on your home we recommend a ${systemSize} kW solar system. ` +
      `You can expect approximately $${monthlySavings}/month in savings, adding up to an estimated ` +
      `$${year25Savings.toLocaleString()} over 25 years. Your system pays for itself in about ` +
      `${paybackPeriod} years, then generates free, clean energy for decades. ` +
      `Going solar locks in your energy costs and protects you from rising utility rates.`;
    logger.debug('Proposal copy (local template) generated');
    return copy;
  } catch (error) {
    logger.error('Proposal copy generation error', { error });
    return `Thank you ${homeownerName} for your interest in solar.`;
  }
};

export const scoreLeadQuality = async (leadData: Record<string, any>): Promise<number> => {
  try {
    const response = await client.post('/api/lead-scoring', leadData);
    const score = response.data.quality_score;
    logger.debug('Lead scored', { score });
    return score;
  } catch (error) {
    logger.error('ML service lead scoring error', { error });
    throw error;
  }
};

export const predictConversion = async (
  leadAttributes: Record<string, any>
): Promise<number> => {
  try {
    const response = await client.post('/api/conversion-prediction', leadAttributes);
    const probability = response.data.conversion_probability;
    logger.debug('Conversion predicted', { probability });
    return probability;
  } catch (error) {
    logger.error('ML service conversion prediction error', { error });
    throw error;
  }
};

export default {
  calculateSystemSize,
  calculateROI,
  generateProposalCopy,
  scoreLeadQuality,
  predictConversion,
};
