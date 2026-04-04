import { query } from '../config/database';
import logger from '../utils/logger';
import { analyzeRoof } from '../services/googleSolar';
import { calculateProduction } from '../services/pvwatts';
import { lookupUtilityRates } from '../services/openei';
import { prequialifyMultipleLenders } from '../services/lenders';
import { calculateSystemSize, calculateROI, generateProposalCopy } from '../services/mlService';
import { sendProposalEmail } from '../services/sendgrid';
import { v4 as uuidv4 } from 'uuid';

export const executeProposalPipeline = async (leadId: string, tenantId: string): Promise<string> => {
  try {
    logger.info('Proposal pipeline started', { leadId, tenantId });

    const leadResult = await query(
      'SELECT * FROM leads WHERE id = $1 AND tenant_id = $2',
      [leadId, tenantId]
    );

    if (!leadResult.rows.length) {
      throw new Error('Lead not found');
    }

    const lead = leadResult.rows[0];

    const roofAnalysis = await analyzeRoof(lead.address);
    const systemSize = await calculateSystemSize({
      roofArea: roofAnalysis.usableSurface,
      annualUsage: lead.estimated_annual_usage || 10000,
      location: lead.address,
    });

    const addressParts = lead.address.split(',');
    const zipCode = addressParts[addressParts.length - 1].trim().split(' ')[0];

    const utilityData = await lookupUtilityRates(lead.address, zipCode);
    const pvData = await calculateProduction(37.7749, -122.4194, systemSize);
    const systemCost = systemSize * 2500;

    const paymentOptions = await prequialifyMultipleLenders(
      systemCost,
      750,
      400000,
      100000
    );

    const roi = await calculateROI(
      systemSize,
      systemCost,
      pvData.annualProduction,
      utilityData.baseRate,
      utilityData.nemRate || 0.05,
      lead.address
    );

    const proposalText = await generateProposalCopy(
      lead.first_name,
      systemSize,
      roi.monthlyAverage,
      roi.year25Total,
      roi.paybackPeriod
    );

    const proposalId = uuidv4();

    await query(
      `INSERT INTO proposals 
        (id, lead_id, tenant_id, status, roof_analysis, system_size, annual_production, 
         payment_options, roi, proposal_text, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        proposalId,
        leadId,
        tenantId,
        'draft',
        JSON.stringify(roofAnalysis),
        systemSize,
        pvData.annualProduction,
        JSON.stringify(paymentOptions),
        JSON.stringify(roi),
        proposalText,
        new Date(),
        new Date(),
      ]
    );

    await query(
      'UPDATE leads SET status = $1, estimated_system_size = $2, updated_at = $3 WHERE id = $4',
      ['proposal_sent', systemSize, new Date(), leadId]
    );

    const proposalUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/proposals/${proposalId}`;

    try {
      await sendProposalEmail(lead.email, lead.first_name, proposalUrl);
    } catch (emailErr) {
      logger.warn('Proposal email failed', { emailErr });
    }

    logger.info('Proposal pipeline completed', { proposalId, leadId });
    return proposalId;
  } catch (error) {
    logger.error('Proposal pipeline error', { leadId, error });
    throw error;
  }
};

export default { executeProposalPipeline };
