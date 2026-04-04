import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { PaymentOption } from '../types';

export interface LenderQuote {
  lender: string;
  apr: number;
  monthlyPayment: number;
  term: number;
  downPayment: number;
  totalCost: number;
}

export const prequialifyMultipleLenders = async (
  systemCost: number,
  creditScore: number,
  homeValue: number,
  annualIncome: number
): Promise<PaymentOption[]> => {
  const quotes: PaymentOption[] = [];

  try {
    const goodleapQuote = await goodleapPrequalify(systemCost, creditScore);
    if (goodleapQuote) quotes.push(goodleapQuote);
  } catch (err) {
    logger.warn('GoodLeap prequalification failed', { err });
  }

  try {
    const mosaicQuote = await mosaicPrequalify(systemCost, creditScore, homeValue);
    if (mosaicQuote) quotes.push(mosaicQuote);
  } catch (err) {
    logger.warn('Mosaic prequalification failed', { err });
  }

  try {
    const sunlightQuote = await sunlightPrequalify(systemCost, creditScore, annualIncome);
    if (sunlightQuote) quotes.push(sunlightQuote);
  } catch (err) {
    logger.warn('Sunlight prequalification failed', { err });
  }

  try {
    const lightreachQuote = await lightreachPrequalify(systemCost, creditScore);
    if (lightreachQuote) quotes.push(lightreachQuote);
  } catch (err) {
    logger.warn('Lightreach prequalification failed', { err });
  }

  return quotes.sort((a, b) => (a.monthlyPayment || 0) - (b.monthlyPayment || 0));
};

const goodleapPrequalify = async (
  systemCost: number,
  creditScore: number
): Promise<PaymentOption | null> => {
  try {
    const response = await axios.post(
      'https://api.goodleap.com/v1/prequal',
      {
        system_cost: systemCost,
        credit_score: creditScore,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.lenders.goodleap.apiKey}`,
        },
      }
    );

    return {
      id: `goodleap_${Date.now()}`,
      type: 'loan',
      lender: 'GoodLeap',
      monthlyPayment: response.data.monthly_payment,
      apr: response.data.apr,
      term: response.data.term,
      downPayment: response.data.down_payment,
      totalSystemCost: systemCost,
      savingsYear1: response.data.year1_savings,
      savingsYear25: response.data.year25_savings,
    };
  } catch (error) {
    logger.error('GoodLeap API error', { error });
    return null;
  }
};

const mosaicPrequalify = async (
  systemCost: number,
  creditScore: number,
  homeValue: number
): Promise<PaymentOption | null> => {
  try {
    const response = await axios.post(
      'https://api.mosaictech.io/v1/quotes',
      {
        system_cost: systemCost,
        credit_score: creditScore,
        home_value: homeValue,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.lenders.mosaic.apiKey}`,
        },
      }
    );

    return {
      id: `mosaic_${Date.now()}`,
      type: 'loan',
      lender: 'Mosaic',
      monthlyPayment: response.data.monthly_payment,
      apr: response.data.apr,
      term: response.data.term,
      downPayment: response.data.down_payment,
      totalSystemCost: systemCost,
      savingsYear1: response.data.year1_savings,
      savingsYear25: response.data.year25_savings,
    };
  } catch (error) {
    logger.error('Mosaic API error', { error });
    return null;
  }
};

const sunlightPrequalify = async (
  systemCost: number,
  creditScore: number,
  annualIncome: number
): Promise<PaymentOption | null> => {
  try {
    const response = await axios.post(
      'https://api.sunlight.com/v2/prequal',
      {
        system_cost: systemCost,
        credit_score: creditScore,
        annual_income: annualIncome,
      },
      {
        headers: {
          'X-API-Key': config.lenders.sunlight.apiKey,
        },
      }
    );

    return {
      id: `sunlight_${Date.now()}`,
      type: 'loan',
      lender: 'Sunlight',
      monthlyPayment: response.data.monthly_payment,
      apr: response.data.apr,
      term: response.data.term,
      downPayment: response.data.down_payment,
      totalSystemCost: systemCost,
      savingsYear1: response.data.year1_savings,
      savingsYear25: response.data.year25_savings,
    };
  } catch (error) {
    logger.error('Sunlight API error', { error });
    return null;
  }
};

const lightreachPrequalify = async (
  systemCost: number,
  creditScore: number
): Promise<PaymentOption | null> => {
  try {
    const response = await axios.post(
      'https://api.lightreach.com/v1/prequal',
      {
        system_cost: systemCost,
        credit_score: creditScore,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.lenders.lightreach.apiKey}`,
        },
      }
    );

    return {
      id: `lightreach_${Date.now()}`,
      type: 'loan',
      lender: 'Lightreach',
      monthlyPayment: response.data.monthly_payment,
      apr: response.data.apr,
      term: response.data.term,
      downPayment: response.data.down_payment,
      totalSystemCost: systemCost,
      savingsYear1: response.data.year1_savings,
      savingsYear25: response.data.year25_savings,
    };
  } catch (error) {
    logger.error('Lightreach API error', { error });
    return null;
  }
};

export default {
  prequialifyMultipleLenders,
};
