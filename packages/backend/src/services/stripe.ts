import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
}

const client = axios.create({
  baseURL: 'https://api.stripe.com/v1',
  auth: {
    username: config.stripe.secretKey,
    password: '',
  },
});

export const createPaymentIntent = async (
  amount: number,
  installerId: string
): Promise<PaymentIntent> => {
  try {
    const response = await client.post('/payment_intents', {
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        installer_id: installerId,
      },
    });

    logger.info('Payment intent created', {
      intentId: response.data.id,
      amount,
    });

    return {
      id: response.data.id,
      clientSecret: response.data.client_secret,
      amount,
    };
  } catch (error) {
    logger.error('Payment intent creation error', { error });
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId: string): Promise<boolean> => {
  try {
    const response = await client.get(`/payment_intents/${paymentIntentId}`);
    return response.data.status === 'succeeded';
  } catch (error) {
    logger.error('Payment confirmation error', { error });
    throw error;
  }
};

export const createConnectedAccount = async (
  installerEmail: string,
  installerName: string
): Promise<string> => {
  try {
    const response = await client.post('/accounts', {
      type: 'standard',
      email: installerEmail,
      individual: {
        first_name: installerName.split(' ')[0],
        last_name: installerName.split(' ')[1],
        address: {
          country: 'US',
        },
        dob: {
          day: 1,
          month: 1,
          year: 1990,
        },
      },
      business_type: 'individual',
      country: 'US',
      default_currency: 'usd',
    });

    logger.info('Stripe connected account created', {
      accountId: response.data.id,
      email: installerEmail,
    });

    return response.data.id;
  } catch (error) {
    logger.error('Connected account creation error', { error });
    throw error;
  }
};

export const createPayout = async (
  connectedAccountId: string,
  amount: number
): Promise<string> => {
  try {
    const response = await client.post(
      `/accounts/${connectedAccountId}/transfers`,
      {
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: connectedAccountId,
      }
    );

    logger.info('Payout created', {
      payoutId: response.data.id,
      amount,
      account: connectedAccountId,
    });

    return response.data.id;
  } catch (error) {
    logger.error('Payout creation error', { error });
    throw error;
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  createConnectedAccount,
  createPayout,
};
