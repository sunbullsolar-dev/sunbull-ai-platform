import { Request, Response } from 'express';
import { query } from '../config/database';
import logger from '../utils/logger';
import { success, error as errorResponse } from '../utils/apiResponse';
import { initiateEnvelopeSignature } from '../services/docusign';
import { createPaymentIntent } from '../services/stripe';
import { sendSMS } from '../services/twilio';

export const selectPaymentOption = async (req: Request, res: Response) => {
  try {
    const { dealId, paymentOptionId } = req.body;
    const tenantId = req.tenantId!;

    const deal = await query(
      'SELECT * FROM deals WHERE id = $1 AND tenant_id = $2',
      [dealId, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    const selectedOption = deal.rows[0].selected_payment_option;

    if (selectedOption.type === 'cash') {
      return res.json(
        success(
          { nextStep: 'commitment_summary', dealId },
          200,
          'Proceed to commitment summary'
        )
      );
    } else if (selectedOption.type === 'loan') {
      return res.json(
        success(
          { nextStep: 'financing_application', dealId, lender: selectedOption.lender },
          200,
          'Proceed to financing application'
        )
      );
    }

    res.json(success({ nextStep: 'commitment_summary', dealId }));
  } catch (err) {
    logger.error('Payment selection error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getCommitmentSummary = async (req: Request, res: Response) => {
  try {
    const { dealId } = req.body;
    const tenantId = req.tenantId!;

    const deal = await query(
      `SELECT d.*, l.first_name, l.last_name, l.email 
       FROM deals d 
       JOIN leads l ON d.lead_id = l.id 
       WHERE d.id = $1 AND d.tenant_id = $2`,
      [dealId, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    const dealData = deal.rows[0];
    const paymentOption = JSON.parse(dealData.selected_payment_option);

    const summary = {
      customer: {
        name: `${dealData.first_name} ${dealData.last_name}`,
        email: dealData.email,
      },
      system: {
        size: dealData.system_size,
        estimatedProduction: dealData.system_size * 1200,
        estimatedAnnualSavings: (dealData.system_size * 1200 * 0.14),
      },
      payment: {
        type: paymentOption.type,
        monthlyPayment: paymentOption.monthlyPayment,
        apr: paymentOption.apr,
        term: paymentOption.term,
        downPayment: paymentOption.downPayment,
        totalCost: paymentOption.totalSystemCost,
      },
      nextAction: 'docusign_signing',
    };

    res.json(success(summary));
  } catch (err) {
    logger.error('Commitment summary error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const submitFinancingApplication = async (req: Request, res: Response) => {
  try {
    const { dealId, lenderId, applicationData } = req.body;
    const tenantId = req.tenantId!;

    const deal = await query(
      `SELECT d.*, l.* FROM deals d JOIN leads l ON d.lead_id = l.id WHERE d.id = $1 AND d.tenant_id = $2`,
      [dealId, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    logger.info('Financing application submitted', { dealId, lenderId });

    res.json(
      success(
        { status: 'submitted', dealId, estimatedApprovalTime: '24-48 hours' },
        200,
        'Application submitted successfully'
      )
    );
  } catch (err) {
    logger.error('Financing application error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const initiateDocuSignSigning = async (req: Request, res: Response) => {
  try {
    const { dealId } = req.body;
    const tenantId = req.tenantId!;

    const deal = await query(
      `SELECT d.*, l.first_name, l.last_name, l.email 
       FROM deals d 
       JOIN leads l ON d.lead_id = l.id 
       WHERE d.id = $1 AND d.tenant_id = $2`,
      [dealId, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    const dealData = deal.rows[0];

    const docusignResult = await initiateEnvelopeSignature({
      dealId,
      homeownerEmail: dealData.email,
      homeownerName: `${dealData.first_name} ${dealData.last_name}`,
      installerId: dealData.installer_id || '',
      systemSize: dealData.system_size,
      systemCost: dealData.system_cost,
    });

    await query(
      'UPDATE deals SET stage = $1 WHERE id = $2',
      ['signed', dealId]
    );

    logger.info('DocuSign signing initiated', { dealId, envelopeId: docusignResult.envelopeId });

    res.json(
      success(
        { signingUrl: docusignResult.signingUrl, envelopeId: docusignResult.envelopeId },
        200,
        'Signing initiated'
      )
    );
  } catch (err) {
    logger.error('DocuSign initiation error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const scheduleInspection = async (req: Request, res: Response) => {
  try {
    const { dealId, inspectionDate, inspectionTime } = req.body;
    const tenantId = req.tenantId!;

    const deal = await query(
      'SELECT * FROM deals WHERE id = $1 AND tenant_id = $2',
      [dealId, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    await query(
      'UPDATE deals SET inspection_date = $1, stage = $2 WHERE id = $3',
      [new Date(`${inspectionDate}T${inspectionTime}`), 'inspection_scheduled', dealId]
    );

    const dealData = deal.rows[0];
    const lead = await query(
      'SELECT * FROM leads WHERE id = $1',
      [dealData.lead_id]
    );

    if (lead.rows.length) {
      try {
        await sendSMS({
          to: lead.rows[0].phone,
          body: `Your solar inspection is scheduled for ${inspectionDate} at ${inspectionTime}. Reply STOP to opt out.`,
        });
      } catch (smsErr) {
        logger.warn('Inspection SMS failed', { smsErr });
      }
    }

    logger.info('Inspection scheduled', { dealId, inspectionDate });

    res.json(
      success(
        { dealId, inspectionDate, inspectionTime },
        200,
        'Inspection scheduled'
      )
    );
  } catch (err) {
    logger.error('Schedule inspection error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const completeCheckout = async (req: Request, res: Response) => {
  try {
    const { dealId } = req.body;
    const tenantId = req.tenantId!;

    const deal = await query(
      `SELECT d.*, l.email FROM deals d 
       JOIN leads l ON d.lead_id = l.id 
       WHERE d.id = $1 AND d.tenant_id = $2`,
      [dealId, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    await query(
      'UPDATE leads SET status = $1 WHERE id = $2',
      ['closed', deal.rows[0].lead_id]
    );

    logger.info('Checkout completed', { dealId });

    res.json(
      success(
        { dealId, status: 'completed', nextStep: 'welcome_email' },
        200,
        'Checkout completed successfully'
      )
    );
  } catch (err) {
    logger.error('Checkout completion error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  selectPaymentOption,
  getCommitmentSummary,
  submitFinancingApplication,
  initiateDocuSignSigning,
  scheduleInspection,
  completeCheckout,
};
