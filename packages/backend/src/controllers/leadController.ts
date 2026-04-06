import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import logger from '../utils/logger';
import { success, error as errorResponse, paginated } from '../utils/apiResponse';
import { sendEmail } from '../services/sendgrid';
import { updateContact, createContact } from '../services/hubspot';

export const createLead = async (req: Request, res: Response) => {
  try {
    let {
      firstName,
      lastName,
      email,
      phone,
      address,
      tcpaConsent,
      fullName,
      utilityProvider,
      monthlyBill,
      billUnit,
    } = req.body as any;

    if ((!firstName || !lastName) && fullName) {
      const parts = String(fullName).trim().split(/\s+/);
      firstName = firstName || parts[0] || 'Homeowner';
      lastName = lastName || parts.slice(1).join(' ') || '-';
    }
    if (!lastName) lastName = '-';

    const leadId = uuidv4();
    const tenantId = req.tenantId!;

    const existingLead = await query(
      'SELECT id FROM leads WHERE email = $1 AND address = $2 AND tenant_id = $3',
      [email, address, tenantId]
    );

    if (existingLead.rows.length > 0) {
      logger.warn('Duplicate lead attempt', { email, address });
      return res.status(409).json(
        errorResponse('Lead already exists', 409)
      );
    }

    const billAmount = typeof monthlyBill === 'number' ? monthlyBill : null;
    const unit = billUnit === 'kwh' ? 'kwh' : billAmount ? 'dollar' : null;

    await query(
      `INSERT INTO leads
        (id, tenant_id, first_name, last_name, email, phone, address, status,
         tcpa_consent, tcpa_consent_date, utility, monthly_bill, bill_unit,
         created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        leadId,
        tenantId,
        firstName,
        lastName,
        email,
        phone,
        address,
        'new',
        tcpaConsent,
        new Date(),
        utilityProvider || null,
        billAmount,
        unit,
        new Date(),
        new Date(),
      ]
    );

    try {
      await createContact(email, firstName, lastName, phone, address);
    } catch (err) {
      logger.warn('HubSpot sync failed', { email });
    }

    const welcomeHtml = `
      <h1>Welcome to Sunbull Solar!</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for your interest in solar! We've received your information and are analyzing your home for the perfect solar solution.</p>
      <p>You'll hear from us within 24 hours with your personalized proposal.</p>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Sunbull Solar',
        html: welcomeHtml,
      });
    } catch (err) {
      logger.warn('Welcome email failed', { email });
    }

    logger.info('Lead created', { leadId, email, tenantId });

    res.status(201).json(
      success({ id: leadId, email, status: 'new' }, 201, 'Lead created successfully')
    );
  } catch (err) {
    logger.error('Lead creation error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getLeads = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;
    const tenantId = req.tenantId!;

    const leads = await query(
      `SELECT * FROM leads 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );

    const totalResult = await query(
      'SELECT COUNT(*) FROM leads WHERE tenant_id = $1',
      [tenantId]
    );

    res.json(
      paginated(
        leads.rows,
        page,
        limit,
        parseInt(totalResult.rows[0].count),
        200
      )
    );
  } catch (err) {
    logger.error('Get leads error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;

    const lead = await query(
      'SELECT * FROM leads WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!lead.rows.length) {
      return res.status(404).json(errorResponse('Lead not found', 404));
    }

    res.json(success(lead.rows[0]));
  } catch (err) {
    logger.error('Get lead error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.tenantId!;

    const validStatuses = [
      'new',
      'qualified',
      'proposal_sent',
      'proposal_viewed',
      'deal_created',
      'closed',
      'lost',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json(
        errorResponse('Invalid status value', 400)
      );
    }

    await query(
      'UPDATE leads SET status = $1, updated_at = $2 WHERE id = $3 AND tenant_id = $4',
      [status, new Date(), id, tenantId]
    );

    logger.info('Lead status updated', { leadId: id, status });

    res.json(success({ id, status }, 200, 'Status updated successfully'));
  } catch (err) {
    logger.error('Update lead status error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  createLead,
  getLeads,
  getLead,
  updateLeadStatus,
};
