import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

export interface BillData {
  monthlyUsage: number;
  monthlyBill: number;
  billingPeriod: string;
  provider: string;
  confidence: number;
}

const client = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${config.external.openaiApiKey}`,
  },
});

export const extractBillData = async (imageBase64: string): Promise<BillData> => {
  try {
    const response = await client.post(
      '/chat/completions',
      {
        model: 'gpt-4-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              {
                type: 'text',
                text: `Extract the following from this utility bill:
                - Monthly kWh usage
                - Monthly bill amount
                - Billing period dates
                - Utility provider name
                
                Return as JSON: { monthlyUsage, monthlyBill, billingPeriod, provider, confidence }`,
              },
            ],
          },
        ],
        max_tokens: 500,
      }
    );

    const content = response.data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse bill data');
    }

    const billData: BillData = JSON.parse(jsonMatch[0]);
    logger.info('Bill data extracted', { billData });
    
    return billData;
  } catch (error) {
    logger.error('Bill OCR error', { error });
    throw error;
  }
};

export default {
  extractBillData,
};
