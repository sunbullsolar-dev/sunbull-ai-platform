import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import logger from '../utils/logger';
import { success, error as errorResponse } from '../utils/apiResponse';
import { analyzeRoof } from '../services/googleSolar';
import { calculateProduction } from '../services/pvwatts';
import { lookupUtilityRates } from '../services/openei';
import { extractBillData } from '../services/billOcr';
import { prequialifyMultipleLenders } from '../services/lenders';
import { calculateSystemSize, calculateROI, generateProposalCopy } from '../services/mlService';
import { sendProposalEmail } from '../services/sendgrid';

export const generateProposal = async (req: Request, res: Response) => {
  try {
    const { leadId, billImageBase64 } = req.body;
    const tenantId = req.tenantId!;

    const leadResult = await query(
      'SELECT * FROM leads WHERE id = $1 AND tenant_id = $2',
      [leadId, tenantId]
    );

    if (!leadResult.rows.length) {
      return res.status(404).json(errorResponse('Lead not found', 404));
    }

    const lead = leadResult.rows[0];
    logger.info('Proposal generation started', { leadId });

    try {
      const roofAnalysis = await analyzeRoof(lead.address);
      logger.debug('Roof analysis complete', { roofAnalysis });

      let annualUsage = lead.estimated_annual_usage || 10000;
      let utilityRate = 0.14;
      let nemRate = 0.05;

      if (billImageBase64) {
        try {
          const billData = await extractBillData(billImageBase64);
          annualUsage = billData.monthlyUsage * 12;
          utilityRate = billData.monthlyBill / billData.monthlyUsage;
          logger.debug('Bill data extracted', { billData });
        } catch (billErr) {
          logger.warn('Bill OCR failed, using estimates', { billErr });
        }
      }

      const systemSize = await calculateSystemSize({
        roofArea: roofAnalysis.usableSurface,
        annualUsage,
        location: lead.address,
      });

      const addressParts = lead.address.split(',');
      const zipCode = addressParts[addressParts.length - 1].trim().split(' ')[0];

      const utilityData = await lookupUtilityRates(lead.address, zipCode);
      nemRate = utilityData.nemRate || 0.05;

      const pvData = await calculateProduction(
        37.7749,
        -122.4194,
        systemSize
      );

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
        utilityRate,
        nemRate,
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

      logger.info('Proposal generated successfully', { proposalId, leadId });

      res.status(201).json(
        success(
          {
            id: proposalId,
            systemSize,
            annualProduction: pvData.annualProduction,
            systemCost,
            roi,
            paymentOptions,
          },
          201,
          'Proposal generated successfully'
        )
      );
    } catch (apiErr: any) {
      const msg = apiErr?.message || String(apiErr);
      const stack = apiErr?.stack || '';
      console.error('[proposal-generate] inner pipeline failed:', msg, stack);
      logger.error('API call failed during proposal generation', { apiErr });
      res.status(500).json(
        errorResponse(`Proposal pipeline failed: ${msg}`, 500)
      );
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    const stack = err?.stack || '';
    console.error('[proposal-generate] outer handler failed:', msg, stack);
    logger.error('Proposal generation error', { error: err });
    res.status(500).json(errorResponse(`Proposal error: ${msg}`, 500));
  }
};

export const getProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;

    const proposal = await query(
      'SELECT * FROM proposals WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!proposal.rows.length) {
      return res.status(404).json(errorResponse('Proposal not found', 404));
    }

    const proposalData = proposal.rows[0];
    proposalData.roof_analysis = JSON.parse(proposalData.roof_analysis);
    proposalData.payment_options = JSON.parse(proposalData.payment_options);
    proposalData.roi = JSON.parse(proposalData.roi);

    res.json(success(proposalData));
  } catch (err) {
    logger.error('Get proposal error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getProposalByLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const tenantId = req.tenantId!;

    const proposal = await query(
      'SELECT * FROM proposals WHERE lead_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 1',
      [leadId, tenantId]
    );

    if (!proposal.rows.length) {
      return res.status(404).json(errorResponse('Proposal not found', 404));
    }

    const proposalData = proposal.rows[0];
    proposalData.roof_analysis = JSON.parse(proposalData.roof_analysis);
    proposalData.payment_options = JSON.parse(proposalData.payment_options);
    proposalData.roi = JSON.parse(proposalData.roi);

    res.json(success(proposalData));
  } catch (err) {
    logger.error('Get proposal by lead error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  generateProposal,
  getProposal,
  getProposalByLead,
};
