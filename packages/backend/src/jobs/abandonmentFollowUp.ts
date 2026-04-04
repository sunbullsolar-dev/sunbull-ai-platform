import cron from 'node-cron';
import { query } from '../config/database';
import logger from '../utils/logger';
import { sendSMS } from '../services/twilio';
import { sendAbandonmentReminder } from '../services/sendgrid';

const ABANDONMENT_THRESHOLD_MINUTES = 30;

export const startAbandonmentFollowUp = () => {
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.debug('Running abandonment follow-up job');

      const thirtyMinutesAgo = new Date(Date.now() - ABANDONMENT_THRESHOLD_MINUTES * 60000);

      const abandonedResult = await query(
        `SELECT DISTINCT p.lead_id, l.email, l.phone, l.first_name, l.last_name
         FROM proposals p
         JOIN leads l ON p.lead_id = l.id
         WHERE p.status = 'viewed' 
         AND p.viewed_at < $1
         AND NOT EXISTS (
           SELECT 1 FROM deals d WHERE d.lead_id = l.id
         )
         AND NOT EXISTS (
           SELECT 1 FROM abandonment_reminders ar WHERE ar.lead_id = l.id AND ar.type = 'sms'
         )`,
        [thirtyMinutesAgo]
      );

      for (const record of abandonedResult.rows) {
        try {
          await sendSMS({
            to: record.phone,
            body: `Hi ${record.first_name}, your solar proposal is ready! Select your payment option now to lock in your pricing. Reply STOP to opt out.`,
            tags: ['abandonment', 'follow-up'],
          });

          await query(
            `INSERT INTO abandonment_reminders (lead_id, type, sent_at)
             VALUES ($1, $2, $3)`,
            [record.lead_id, 'sms', new Date()]
          );

          logger.info('Abandonment SMS sent', { leadId: record.lead_id });
        } catch (err) {
          logger.warn('Abandonment SMS failed', { leadId: record.lead_id, error: err });
        }
      }

      const emailAbandonedResult = await query(
        `SELECT DISTINCT p.lead_id, l.email, l.first_name, l.last_name
         FROM proposals p
         JOIN leads l ON p.lead_id = l.id
         WHERE p.status = 'viewed' 
         AND p.viewed_at < $1
         AND NOT EXISTS (
           SELECT 1 FROM deals d WHERE d.lead_id = l.id
         )
         AND EXISTS (
           SELECT 1 FROM abandonment_reminders ar WHERE ar.lead_id = l.id AND ar.type = 'sms'
         )
         AND NOT EXISTS (
           SELECT 1 FROM abandonment_reminders ar WHERE ar.lead_id = l.id AND ar.type = 'email'
         )`,
        [new Date(Date.now() - (ABANDONMENT_THRESHOLD_MINUTES + 30) * 60000)]
      );

      for (const record of emailAbandonedResult.rows) {
        try {
          const proposalUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/proposals/${record.proposal_id}`;
          await sendAbandonmentReminder(record.email, record.first_name, proposalUrl);

          await query(
            `INSERT INTO abandonment_reminders (lead_id, type, sent_at)
             VALUES ($1, $2, $3)`,
            [record.lead_id, 'email', new Date()]
          );

          logger.info('Abandonment email sent', { leadId: record.lead_id });
        } catch (err) {
          logger.warn('Abandonment email failed', { leadId: record.lead_id, error: err });
        }
      }
    } catch (error) {
      logger.error('Abandonment follow-up job error', { error });
    }
  });

  logger.info('Abandonment follow-up job started');
};

export default { startAbandonmentFollowUp };
