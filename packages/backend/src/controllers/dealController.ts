import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import logger from '../utils/logger';
import { success, error as errorResponse } from '../utils/apiResponse';
import { updateDealStage, createDeal as createHubSpotDeal } from '../services/hubspot';

export const createDeal = async (req: Request, res: Response) => {
  try {
    const { leadId, paymentOptionId, systemSize, systemCost } = req.body;
    const tenantId = req.tenantId!;

    const leadResult = await query(
      'SELECT * FROM leads WHERE id = $1 AND tenant_id = $2',
      [leadId, tenantId]
    );

    if (!leadResult.rows.length) {
      return res.status(404).json(errorResponse('Lead not found', 404));
    }

    const lead = leadResult.rows[0];

    const proposalResult = await query(
      'SELECT * FROM proposals WHERE lead_id = $1 AND tenant_id = $2',
      [leadId, tenantId]
    );

    if (!proposalResult.rows.length) {
      return res.status(404).json(errorResponse('Proposal not found', 404));
    }

    const proposal = proposalResult.rows[0];
    const paymentOptions = JSON.parse(proposal.payment_options);
    const selectedOption = paymentOptions.find((opt: any) => opt.id === paymentOptionId);

    if (!selectedOption) {
      return res.status(400).json(errorResponse('Invalid payment option', 400));
    }

    const dealId = uuidv4();

    await query(
      `INSERT INTO deals 
        (id, lead_id, tenant_id, stage, selected_payment_option, system_size, system_cost, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        dealId,
        leadId,
        tenantId,
        'proposal_selected',
        JSON.stringify(selectedOption),
        systemSize,
        systemCost,
        new Date(),
        new Date(),
      ]
    );

    await query(
      'UPDATE proposals SET status = $1 WHERE id = $2',
      ['accepted', proposal.id]
    );

    await query(
      'UPDATE leads SET status = $1 WHERE id = $2',
      ['deal_created', leadId]
    );

    try {
      await createHubSpotDeal(
        `Solar System - ${systemSize}kW`,
        lead.id,
        'proposalAccepted',
        systemCost
      );
    } catch (hsErr) {
      logger.warn('HubSpot deal creation failed', { hsErr });
    }

    logger.info('Deal created', { dealId, leadId, paymentOption: selectedOption.lender });

    res.status(201).json(
      success(
        {
          id: dealId,
          leadId,
          stage: 'proposal_selected',
          selectedPayment: selectedOption,
        },
        201,
        'Deal created successfully'
      )
    );
  } catch (err) {
    logger.error('Deal creation error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;

    const deal = await query(
      'SELECT * FROM deals WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    const dealData = deal.rows[0];
    dealData.selected_payment_option = JSON.parse(dealData.selected_payment_option);

    res.json(success(dealData));
  } catch (err) {
    logger.error('Get deal error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const updateDeal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, installerId, inspectionDate, installationDate } = req.body;
    const tenantId = req.tenantId!;

    const validStages = [
      'proposal_selected',
      'payment_pending',
      'signed',
      'inspection_scheduled',
      'inspection_completed',
      'installation_scheduled',
      'installation_in_progress',
      'completed',
      'cancelled',
    ];

    if (stage && !validStages.includes(stage)) {
      return res.status(400).json(errorResponse('Invalid stage', 400));
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (stage) {
      updates.push(`stage = $${paramCount++}`);
      values.push(stage);
    }
    if (installerId) {
      updates.push(`installer_id = $${paramCount++}`);
      values.push(installerId);
    }
    if (inspectionDate) {
      updates.push(`inspection_date = $${paramCount++}`);
      values.push(inspectionDate);
    }
    if (installationDate) {
      updates.push(`installation_date = $${paramCount++}`);
      values.push(installationDate);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(id);
    values.push(tenantId);

    await query(
      `UPDATE deals SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}`,
      values
    );

    logger.info('Deal updated', { dealId: id, stage });

    res.json(success({ id, stage }, 200, 'Deal updated successfully'));
  } catch (err) {
    logger.error('Update deal error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getDealDashboard = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const tenantId = req.tenantId!;

    const dealResult = await query(
      'SELECT * FROM deals WHERE lead_id = $1 AND tenant_id = $2',
      [leadId, tenantId]
    );

    const leadResult = await query(
      'SELECT * FROM leads WHERE id = $1 AND tenant_id = $2',
      [leadId, tenantId]
    );

    if (!dealResult.rows.length || !leadResult.rows.length) {
      return res.status(404).json(errorResponse('Deal or lead not found', 404));
    }

    const deal = dealResult.rows[0];
    const lead = leadResult.rows[0];

    deal.selected_payment_option = JSON.parse(deal.selected_payment_option);

    const dashboard = {
      customer: {
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
      },
      system: {
        size: deal.system_size,
        cost: deal.system_cost,
        status: deal.stage,
      },
      payment: deal.selected_payment_option,
      timeline: {
        inspectionDate: deal.inspection_date,
        installationDate: deal.installation_date,
      },
    };

    res.json(success(dashboard));
  } catch (err) {
    logger.error('Get deal dashboard error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  createDeal,
  getDeal,
  updateDeal,
  getDealDashboard,
};
