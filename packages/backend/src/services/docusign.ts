import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface DocuSignEnvelopeRequest {
  dealId: string;
  homeownerEmail: string;
  homeownerName: string;
  installerId: string;
  systemSize: number;
  systemCost: number;
}

export interface DocuSignSigningURL {
  signingUrl: string;
  envelopeId: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async (): Promise<string> => {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      `${config.docusign.baseUrl}/oauth/token`,
      {
        grant_type: 'password',
        username: config.docusign.username,
        password: config.docusign.password,
        scope: 'signature',
        client_id: config.docusign.integratorKey,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

    return accessToken!;
  } catch (error) {
    logger.error('DocuSign token error', { error });
    throw error;
  }
};

export const initiateEnvelopeSignature = async (
  request: DocuSignEnvelopeRequest
): Promise<DocuSignSigningURL> => {
  try {
    const token = await getAccessToken();

    const envelopeDefinition = {
      emailSubject: `Please sign your solar agreement for ${request.systemSize}kW system`,
      documents: [
        {
          documentBase64: Buffer.from(
            generateContractDocument(request)
          ).toString('base64'),
          name: 'Solar_Agreement.pdf',
          documentId: '1',
        },
      ],
      recipients: {
        signers: [
          {
            email: request.homeownerEmail,
            name: request.homeownerName,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '5',
                  xPosition: '200',
                  yPosition: '700',
                },
              ],
            },
          },
        ],
      },
      status: 'sent',
    };

    const response = await axios.post(
      `${config.docusign.baseUrl}/v2.1/accounts/${config.docusign.accountId}/envelopes`,
      envelopeDefinition,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const envelopeId = response.data.envelopeId;

    const urlResponse = await axios.post(
      `${config.docusign.baseUrl}/v2.1/accounts/${config.docusign.accountId}/envelopes/${envelopeId}/views/recipient`,
      {
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/signed`,
        authenticationMethod: 'none',
        clientUserId: '1',
        email: request.homeownerEmail,
        recipientId: '1',
        userName: request.homeownerName,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('DocuSign envelope created', { envelopeId, dealId: request.dealId });

    return {
      signingUrl: urlResponse.data.url,
      envelopeId,
    };
  } catch (error) {
    logger.error('DocuSign envelope initiation error', { error });
    throw error;
  }
};

export const checkEnvelopeStatus = async (envelopeId: string): Promise<string> => {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `${config.docusign.baseUrl}/v2.1/accounts/${config.docusign.accountId}/envelopes/${envelopeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.data.status;
  } catch (error) {
    logger.error('DocuSign status check error', { error });
    throw error;
  }
};

const generateContractDocument = (request: DocuSignEnvelopeRequest): string => {
  return `
    SOLAR INSTALLATION AGREEMENT

    This agreement is made as of ${new Date().toLocaleDateString()}

    CUSTOMER: ${request.homeownerName}
    
    SYSTEM SPECIFICATIONS:
    System Size: ${request.systemSize} kW
    Estimated Annual Production: ${(request.systemSize * 1200).toFixed(0)} kWh
    System Cost: $${request.systemCost.toLocaleString()}

    TERMS AND CONDITIONS:
    1. The system will be installed by licensed installer
    2. System is covered under 25-year performance warranty
    3. Customer responsible for roof maintenance
    4. System tied to net metering agreement with utility
    5. Customer agrees to financing terms as specified

    SIGNATURES:

    Customer: ________________________     Date: __________

    Installer: ________________________   Date: __________
  `;
};

export default {
  initiateEnvelopeSignature,
  checkEnvelopeStatus,
};
