import cron from 'node-cron';
import { query } from '../config/database';
import logger from '../utils/logger';
import { sendNPSSurvey } from '../services/sendgrid';

export const startNPSFollowUp = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.debug('Running NPS follow-up job');

      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);

      const systemsLiveResult = await query(
        `SELECT DISTINCT d.id, l.email, l.first_name
         FROM deals d
         JOIN leads l ON d.lead_id = l.id
         WHERE d.stage = 'completed'
         AND d.updated_at = $1
         AND NOT EXISTS (
           SELECT 1 FROM nps_surveys ns WHERE ns.deal_id = d.id
         )`,
        [thirtyOneDaysAgo]
      );

      for (const record of systemsLiveResult.rows) {
        try {
          const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/surveys/nps?dealId=${record.id}`;
          await sendNPSSurvey(record.email, record.first_name, surveyUrl);

          await query(
            `INSERT INTO nps_surveys (deal_id, sent_at, survey_url)
             VALUES ($1, $2, $3)`,
            [record.id, new Date(), surveyUrl]
          );

          logger.info('NPS survey sent', { dealId: record.id });
        } catch (err) {
          logger.warn('NPS survey send failed', { dealId: record.id, error: err });
        }
      }
    } catch (error) {
      logger.error('NPS follow-up job error', { error });
    }
  });

  logger.info('NPS follow-up job started');
};

export default { startNPSFollowUp };
