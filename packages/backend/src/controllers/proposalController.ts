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

      // Resolve ZIP from geocoded address fallback to trailing token
      const zipMatch = (lead.address || '').match(/\b(\d{5})(?:-\d{4})?\b/);
      const zipCode = zipMatch ? zipMatch[1] : '';

      // Real utility tariff lookup
      const utilityData = await lookupUtilityRates(lead.utility || null, zipCode);
      const utilityRate = utilityData.baseRate;
      const nemRate = utilityData.nem3Rate ?? utilityData.nemRate ?? 0.05;
      logger.info('Utility tariff resolved', { utilityData });

      // Convert raw monthly bill → kWh using real tariff
      let annualUsage: number;
      if (lead.bill_unit === 'kwh' && lead.monthly_bill) {
        annualUsage = Number(lead.monthly_bill) * 12;
      } else if (lead.bill_unit === 'dollar' && lead.monthly_bill) {
        annualUsage = (Number(lead.monthly_bill) / utilityRate) * 12;
      } else if (lead.estimated_annual_usage) {
        annualUsage = Number(lead.estimated_annual_usage);
      } else {
        throw new Error('Cannot determine annual usage: no bill or estimate on lead');
      }
      annualUsage = Math.round(annualUsage);
      logger.info('Annual usage resolved', { annualUsage, billUnit: lead.bill_unit });

      // System size: target >=110% offset whenever roof allows.
      // 1 kW ≈ 1,500 kWh/yr specific yield; ~6.5 m² / kW usable roof.
      // Roof is the only hard ceiling — we only undersize below 110% if the
      // roof physically can't fit it.
      const OFFSET_TARGET = 1.10;
      const targetByUsage = (annualUsage / 1500) * OFFSET_TARGET;
      const byRoof = (roofAnalysis.usableSurface || 100) / 6.5;
      const systemSize = Math.round(
        Math.max(3, Math.min(targetByUsage, byRoof)) * 10
      ) / 10;
      const effectiveOffset = Math.round(((systemSize * 1500) / annualUsage) * 100);
      logger.info('System sized', {
        annualUsage,
        targetByUsage: Math.round(targetByUsage * 10) / 10,
        roofMax: Math.round(byRoof * 10) / 10,
        systemSize,
        effectiveOffset,
        roofLimited: byRoof < targetByUsage,
      });

      // Real PVWatts call at geocoded lat/lng
      const pvData = await calculateProduction(
        roofAnalysis.latitude,
        roofAnalysis.longitude,
        systemSize,
        roofAnalysis.azimuth,
        Math.max(5, Math.min(45, roofAnalysis.pitch || 20))
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
      `SELECT p.*, l.first_name, l.last_name, l.email, l.address
       FROM proposals p LEFT JOIN leads l ON l.id = p.lead_id
       WHERE p.id = $1 AND p.tenant_id = $2`,
      [id, tenantId]
    );

    if (!proposal.rows.length) {
      return res.status(404).json(errorResponse('Proposal not found', 404));
    }

    const proposalData = proposal.rows[0];
    const safeParse = (v: any) => (typeof v === 'string' ? JSON.parse(v) : v);
    proposalData.roof_analysis = safeParse(proposalData.roof_analysis);
    proposalData.payment_options = safeParse(proposalData.payment_options);
    proposalData.roi = safeParse(proposalData.roi);

    res.json(success(proposalData));
  } catch (err: any) {
    console.error('[get-proposal]', err?.message, err?.stack);
    logger.error('Get proposal error', { error: err });
    res.status(500).json(errorResponse(`Get proposal error: ${err?.message || err}`, 500));
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
    const safeParse = (v: any) => (typeof v === 'string' ? JSON.parse(v) : v);
    proposalData.roof_analysis = safeParse(proposalData.roof_analysis);
    proposalData.payment_options = safeParse(proposalData.payment_options);
    proposalData.roi = safeParse(proposalData.roi);

    res.json(success(proposalData));
  } catch (err: any) {
    console.error('[get-proposal-by-lead]', err?.message, err?.stack);
    logger.error('Get proposal by lead error', { error: err });
    res.status(500).json(errorResponse(`Get proposal by lead error: ${err?.message || err}`, 500));
  }
};

export default {
  generateProposal,
  getProposal,
  getProposalByLead,
};
