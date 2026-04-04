import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import logger from '../utils/logger';
import { success, error as errorResponse, paginated } from '../utils/apiResponse';

export const getInstallers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const state = req.query.state as string;
    const offset = (page - 1) * limit;
    const tenantId = req.tenantId!;

    let whereClause = 'tenant_id = $1 AND availability = true';
    const params: any[] = [tenantId];

    if (state) {
      params.push(state);
      whereClause += ` AND state = $${params.length}`;
    }

    const installers = await query(
      `SELECT id, first_name, last_name, email, phone, state, availability, created_at 
       FROM installers 
       WHERE ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    const totalResult = await query(
      `SELECT COUNT(*) FROM installers WHERE ${whereClause}`,
      params
    );

    res.json(
      paginated(
        installers.rows,
        page,
        limit,
        parseInt(totalResult.rows[0].count),
        200
      )
    );
  } catch (err) {
    logger.error('Get installers error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const getInstaller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId!;

    const installer = await query(
      'SELECT * FROM installers WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!installer.rows.length) {
      return res.status(404).json(errorResponse('Installer not found', 404));
    }

    res.json(success(installer.rows[0]));
  } catch (err) {
    logger.error('Get installer error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const createInstaller = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, state, availability } = req.body;
    const tenantId = req.tenantId!;

    const installerId = uuidv4();

    await query(
      `INSERT INTO installers 
        (id, tenant_id, first_name, last_name, email, phone, state, availability, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        installerId,
        tenantId,
        firstName,
        lastName,
        email,
        phone,
        state,
        availability,
        new Date(),
        new Date(),
      ]
    );

    logger.info('Installer created', { installerId, email });

    res.status(201).json(
      success({ id: installerId, email }, 201, 'Installer created successfully')
    );
  } catch (err) {
    logger.error('Installer creation error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const updateInstaller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, availability } = req.body;
    const tenantId = req.tenantId!;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (firstName) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (availability !== undefined) {
      updates.push(`availability = $${paramCount++}`);
      values.push(availability);
    }

    updates.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(id);
    values.push(tenantId);

    await query(
      `UPDATE installers SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}`,
      values
    );

    logger.info('Installer updated', { installerId: id });

    res.json(success({ id }, 200, 'Installer updated successfully'));
  } catch (err) {
    logger.error('Installer update error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const assignInstaller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dealId } = req.body;
    const tenantId = req.tenantId!;

    const deal = await query(
      'SELECT * FROM deals WHERE id = $1 AND tenant_id = $2',
      [dealId, tenantId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    await query(
      'UPDATE deals SET installer_id = $1 WHERE id = $2',
      [id, dealId]
    );

    logger.info('Installer assigned', { installerId: id, dealId });

    res.json(success({ installerId: id, dealId }, 200, 'Installer assigned'));
  } catch (err) {
    logger.error('Installer assignment error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  getInstallers,
  getInstaller,
  createInstaller,
  updateInstaller,
  assignInstaller,
};
