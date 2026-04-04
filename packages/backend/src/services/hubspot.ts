import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

const client = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    'Authorization': `Bearer ${config.hubspot.apiKey}`,
  },
});

export const createContact = async (
  email: string,
  firstName: string,
  lastName: string,
  phone?: string,
  address?: string
): Promise<string> => {
  try {
    const response = await client.post('/crm/v3/objects/contacts', {
      properties: {
        firstname: firstName,
        lastname: lastName,
        email,
        phone: phone || '',
        address: address || '',
      },
    });

    logger.info('HubSpot contact created', {
      contactId: response.data.id,
      email,
    });

    return response.data.id;
  } catch (error) {
    logger.error('HubSpot contact creation error', { email, error });
    throw error;
  }
};

export const updateContact = async (
  contactId: string,
  properties: Record<string, any>
): Promise<void> => {
  try {
    await client.patch(`/crm/v3/objects/contacts/${contactId}`, {
      properties,
    });

    logger.info('HubSpot contact updated', { contactId });
  } catch (error) {
    logger.error('HubSpot contact update error', { contactId, error });
  }
};

export const createDeal = async (
  dealName: string,
  contactId: string,
  dealstage: string,
  amount: number
): Promise<string> => {
  try {
    const response = await client.post('/crm/v3/objects/deals', {
      properties: {
        dealname: dealName,
        dealstage,
        amount,
      },
      associations: [
        {
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 3,
            },
          ],
          id: contactId,
        },
      ],
    });

    logger.info('HubSpot deal created', {
      dealId: response.data.id,
      dealName,
    });

    return response.data.id;
  } catch (error) {
    logger.error('HubSpot deal creation error', { dealName, error });
    throw error;
  }
};

export const updateDealStage = async (
  dealId: string,
  stage: string
): Promise<void> => {
  try {
    await client.patch(`/crm/v3/objects/deals/${dealId}`, {
      properties: {
        dealstage: stage,
      },
    });

    logger.info('HubSpot deal stage updated', { dealId, stage });
  } catch (error) {
    logger.error('HubSpot deal stage update error', { dealId, error });
  }
};

export const addDealNote = async (dealId: string, note: string): Promise<void> => {
  try {
    await client.post(`/crm/v3/objects/deals/${dealId}/associations/notes`, {
      type: 'deal_to_note',
      id: dealId,
    });

    logger.info('HubSpot note added', { dealId });
  } catch (error) {
    logger.error('HubSpot note error', { dealId, error });
  }
};

export default {
  createContact,
  updateContact,
  createDeal,
  updateDealStage,
  addDealNote,
};
