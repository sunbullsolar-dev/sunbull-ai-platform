import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { cacheSet, cacheDel } from '../config/redis';
import logger from '../utils/logger';
import { success, error as errorResponse } from '../utils/apiResponse';

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, subdomain, brandColor, logo } = req.body;

    const existingTenant = await query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (existingTenant.rows.length) {
      return res.status(409).json(errorResponse('Subdomain already taken', 409));
    }

    const tenantId = uuidv4();

    await query(
      `INSERT INTO tenants 
        (id, name, subdomain, brand_color, logo, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        tenantId,
        name,
        subdomain,
        brandColor || '#4CAF50',
        logo,
        new Date(),
        new Date(),
      ]
    );

    logger.info('Tenant created', { tenantId, subdomain });

    res.status(201).json(
      success(
        { id: tenantId, name, subdomain },
        201,
        'Tenant created successfully'
      )
    );
  } catch (err) {
    logger.error('Tenant creation error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await query(
      'SELECT * FROM tenants WHERE id = $1',
      [id]
    );

    if (!tenant.rows.length) {
      return res.status(404).json(errorResponse('Tenant not found', 404));
    }

    res.json(success(tenant.rows[0]));
  } catch (err) {
    logger.error('Get tenant error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, brandColor, logo, settings } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (brandColor) {
      updates.push(`brand_color = $${paramCount++}`);
      values.push(brandColor);
    }
    if (logo) {
      updates.push(`logo = $${paramCount++}`);
      values.push(logo);
    }
    if (settings) {
      updates.push(`settings = $${paramCount++}`);
      values.push(JSON.stringify(settings));
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(id);

    await query(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    await cacheDel(`tenant:${id}`);

    logger.info('Tenant updated', { tenantId: id });

    res.json(success({ id }, 200, 'Tenant updated successfully'));
  } catch (err) {
    logger.error('Tenant update error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getTenantStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const leadsResult = await query(
      'SELECT COUNT(*) FROM leads WHERE tenant_id = $1',
      [id]
    );

    const dealsResult = await query(
      'SELECT COUNT(*) FROM deals WHERE tenant_id = $1',
      [id]
    );

    const proposalsResult = await query(
      'SELECT COUNT(*) FROM proposals WHERE tenant_id = $1',
      [id]
    );

    const stats = {
      totalLeads: parseInt(leadsResult.rows[0].count),
      totalDeals: parseInt(dealsResult.rows[0].count),
      totalProposals: parseInt(proposalsResult.rows[0].count),
      conversionRate: leadsResult.rows[0].count > 0
        ? (parseInt(dealsResult.rows[0].count) / parseInt(leadsResult.rows[0].count) * 100).toFixed(2)
        : 0,
    };

    res.json(success(stats));
  } catch (err) {
    logger.error('Get tenant stats error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  createTenant,
  getTenant,
  updateTenant,
  getTenantStats,
};
