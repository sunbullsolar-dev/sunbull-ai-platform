import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

export interface SMSMessage {
  to: string;
  body: string;
  tags?: string[];
}

const client = axios.create({
  baseURL: 'https://api.twilio.com/2010-04-01',
  auth: {
    username: config.external.twilioAccountSid,
    password: config.external.twilioAuthToken,
  },
});

export const sendSMS = async (message: SMSMessage): Promise<string> => {
  try {
    const response = await client.post(
      `/Accounts/${config.external.twilioAccountSid}/Messages.json`,
      {
        From: config.external.twilioPhoneNumber,
        To: message.to,
        Body: message.body,
      }
    );

    logger.info('SMS sent', {
      to: message.to,
      messageId: response.data.sid,
    });

    return response.data.sid;
  } catch (error) {
    logger.error('SMS send error', { to: message.to, error });
    throw error;
  }
};

export const sendBulkSMS = async (messages: SMSMessage[]): Promise<string[]> => {
  const results: string[] = [];

  for (const message of messages) {
    try {
      const messageId = await sendSMS(message);
      results.push(messageId);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      logger.error('Bulk SMS failed for recipient', { to: message.to });
      results.push('');
    }
  }

  return results;
};

export const processTCPAOptOut = async (phoneNumber: string): Promise<void> => {
  try {
    const response = await client.post(
      `/Accounts/${config.external.twilioAccountSid}/OutgoingCallerIds.json`,
      {
        PhoneNumber: phoneNumber,
        FriendlyName: 'TCPA Opt-out',
      }
    );

    logger.info('TCPA opt-out processed', { phoneNumber });
  } catch (error) {
    logger.error('TCPA opt-out error', { phoneNumber, error });
    throw error;
  }
};

export const handleInboundMessage = async (
  from: string,
  body: string,
  messageId: string
): Promise<void> => {
  try {
    logger.info('Inbound SMS received', { from, messageId });

    if (body.toLowerCase().includes('stop')) {
      await processTCPAOptOut(from);
    }
  } catch (error) {
    logger.error('Inbound message processing error', { error });
  }
};

export default {
  sendSMS,
  sendBulkSMS,
  processTCPAOptOut,
  handleInboundMessage,
};
