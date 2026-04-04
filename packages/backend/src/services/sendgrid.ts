import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

const client = axios.create({
  baseURL: 'https://api.sendgrid.com/v3',
  headers: {
    'Authorization': `Bearer ${config.external.sendgridApiKey}`,
  },
});

export const sendEmail = async (message: EmailMessage): Promise<string> => {
  try {
    const response = await client.post('/mail/send', {
      personalizations: [
        {
          to: Array.isArray(message.to)
            ? message.to.map(email => ({ email }))
            : [{ email: message.to }],
        },
      ],
      from: {
        email: message.from || config.email.fromEmail,
      },
      subject: message.subject,
      content: [
        {
          type: 'text/html',
          value: message.html,
        },
        ...(message.text ? [{ type: 'text/plain', value: message.text }] : []),
      ],
      replyTo: message.replyTo ? { email: message.replyTo } : undefined,
    });

    logger.info('Email sent', {
      to: message.to,
      subject: message.subject,
    });

    return 'sent';
  } catch (error) {
    logger.error('Email send error', { to: message.to, error });
    throw error;
  }
};

export const sendProposalEmail = async (
  to: string,
  homeownerName: string,
  proposalUrl: string
): Promise<void> => {
  const html = `
    <h1>Your Custom Solar Proposal</h1>
    <p>Hi ${homeownerName},</p>
    <p>We've prepared a personalized solar proposal for your home. Click below to review and select your preferred payment option.</p>
    <a href="${proposalUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      View Your Proposal
    </a>
    <p>If you have any questions, reply to this email or call us directly.</p>
    <p>Best regards,<br>Sunbull AI Team</p>
  `;

  await sendEmail({
    to,
    subject: 'Your Solar Proposal is Ready',
    html,
  });
};

export const sendAbandonmentReminder = async (
  to: string,
  homeownerName: string,
  proposalUrl: string
): Promise<void> => {
  const html = `
    <h1>Don't Miss Out on Solar Savings!</h1>
    <p>Hi ${homeownerName},</p>
    <p>We noticed you haven't selected a payment option for your solar proposal yet. Here are the key benefits you'd be missing:</p>
    <ul>
      <li>30+ year system lifespan</li>
      <li>Zero down payment financing options available</li>
      <li>Average savings of $10,000-15,000 over 10 years</li>
    </ul>
    <a href="${proposalUrl}" style="background: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Complete Your Proposal Now
    </a>
    <p>Best regards,<br>Sunbull AI Team</p>
  `;

  await sendEmail({
    to,
    subject: 'Complete Your Solar Proposal - Limited Time',
    html,
  });
};

export const sendNPSSurvey = async (
  to: string,
  homeownerName: string,
  surveyUrl: string
): Promise<void> => {
  const html = `
    <h1>How Did We Do?</h1>
    <p>Hi ${homeownerName},</p>
    <p>Your solar system is now live! We'd love to hear about your experience with Sunbull.</p>
    <a href="${surveyUrl}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Take 30 Seconds to Rate Us
    </a>
    <p>Thank you for choosing solar!</p>
  `;

  await sendEmail({
    to,
    subject: 'Rate Your Sunbull Solar Experience',
    html,
  });
};

export default {
  sendEmail,
  sendProposalEmail,
  sendAbandonmentReminder,
  sendNPSSurvey,
};
