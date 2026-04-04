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
  try {
    const response = await client.post('/api/system-sizing', data);
    logger.debug('System sizing calculated', { systemSize: response.data.system_size_kw });
    return response.data.system_size_kw;
  } catch (error) {
    logger.error('ML service system sizing error', { error });
    throw error;
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
    const response = await client.post('/api/roi-calculation', {
      system_size_kw: systemSize,
      system_cost: systemCost,
      annual_production_kwh: annualProduction,
      utility_rate: utilityRate,
      nem_rate: nemRate,
      location,
    });

    const roi: ROIData = {
      year10Total: response.data.year_10_savings,
      year25Total: response.data.year_25_savings,
      paybackPeriod: response.data.payback_period_years,
      monthlyAverage: response.data.monthly_savings,
    };

    logger.debug('ROI calculated', { roi });
    return roi;
  } catch (error) {
    logger.error('ML service ROI error', { error });
    throw error;
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
    const response = await client.post('/api/proposal-copy', {
      homeowner_name: homeownerName,
      system_size_kw: systemSize,
      monthly_savings: monthlySavings,
      year_25_savings: year25Savings,
      payback_period: paybackPeriod,
    });

    logger.debug('Proposal copy generated');
    return response.data.proposal_text;
  } catch (error) {
    logger.error('ML service proposal copy error', { error });
    throw error;
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
