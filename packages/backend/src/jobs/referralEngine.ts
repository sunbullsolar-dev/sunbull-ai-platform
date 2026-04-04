import { query } from '../config/database';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ReferralLink {
  id: string;
  referrerId: string;
  referralCode: string;
  referralUrl: string;
  createdAt: Date;
}

export const generateReferralLink = async (dealId: string): Promise<ReferralLink> => {
  try {
    const referralCode = uuidv4().split('-')[0].toUpperCase();
    const referralId = uuidv4();
    const referralUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/refer/${referralCode}`;

    await query(
      `INSERT INTO referral_links (id, deal_id, referral_code, referral_url, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [referralId, dealId, referralCode, referralUrl, new Date()]
    );

    logger.info('Referral link generated', { dealId, referralCode });

    return {
      id: referralId,
      referrerId: dealId,
      referralCode,
      referralUrl,
      createdAt: new Date(),
    };
  } catch (error) {
    logger.error('Referral link generation error', { dealId, error });
    throw error;
  }
};

export const trackReferralConversion = async (
  referralCode: string,
  newLeadId: string
): Promise<void> => {
  try {
    const linkResult = await query(
      'SELECT id, deal_id FROM referral_links WHERE referral_code = $1',
      [referralCode]
    );

    if (!linkResult.rows.length) {
      logger.warn('Referral code not found', { referralCode });
      return;
    }

    const link = linkResult.rows[0];

    await query(
      `INSERT INTO referral_conversions (referral_link_id, new_lead_id, converted_at)
       VALUES ($1, $2, $3)`,
      [link.id, newLeadId, new Date()]
    );

    logger.info('Referral conversion tracked', { referralCode, newLeadId });
  } catch (error) {
    logger.error('Referral conversion tracking error', { referralCode, error });
  }
};

export const getReferralStats = async (dealId: string): Promise<any> => {
  try {
    const statsResult = await query(
      `SELECT 
        rl.referral_code,
        COUNT(rc.id) as total_conversions,
        COUNT(DISTINCT rc.new_lead_id) as unique_leads
       FROM referral_links rl
       LEFT JOIN referral_conversions rc ON rl.id = rc.referral_link_id
       WHERE rl.deal_id = $1
       GROUP BY rl.referral_code`,
      [dealId]
    );

    return statsResult.rows;
  } catch (error) {
    logger.error('Referral stats error', { dealId, error });
    throw error;
  }
};

export default {
  generateReferralLink,
  trackReferralConversion,
  getReferralStats,
};
