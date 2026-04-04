import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../types';
import { query } from '../config/database';
import { cacheGet, cacheSet } from '../config/redis';
import logger from '../utils/logger';
import { error as errorResponse } from '../utils/apiResponse';

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      tenantId?: string;
    }
  }
}

// Paths that skip tenant resolution
const TENANT_SKIP_PATHS = ['/health', '/api/v1/auth', '/api/v1/webhooks'];

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip tenant check for health and auth endpoints
    if (TENANT_SKIP_PATHS.some(p => req.path.startsWith(p))) {
      return next();
    }

    let tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId && req.user) {
      tenantId = req.user.tenantId;
    }

    if (!tenantId) {
      const host = req.hostname;
      const subdomain = host.split('.')[0];

      // In dev mode, default to 'sunbull' tenant
      if (subdomain === 'localhost' || subdomain === '127') {
        tenantId = 'default';
      } else {
        const cached = await cacheGet(`tenant:subdomain:${subdomain}`);

        if (cached) {
          tenantId = cached;
        } else {
          const result = await query(
            'SELECT id FROM tenants WHERE subdomain = $1',
            [subdomain]
          );

          if (result.rows.length) {
            tenantId = result.rows[0].id;
            await cacheSet(`tenant:subdomain:${subdomain}`, tenantId, 86400);
          }
        }
      }
    }

    if (!tenantId) {
      // In development, allow requests without tenant
      if (process.env.NODE_ENV === 'development') {
        req.tenantId = 'default';
        return next();
      }
      return res.status(400).json(errorResponse('Tenant not found', 400));
    }

    const tenantCached = await cacheGet(`tenant:${tenantId}`);
    let tenant: Tenant;

    if (tenantCached) {
      tenant = JSON.parse(tenantCached);
    } else {
      const result = await query(
        'SELECT * FROM tenants WHERE id = $1',
        [tenantId]
      );
      
      if (!result.rows.length) {
        return res.status(404).json(errorResponse('Tenant not found', 404));
      }

      tenant = result.rows[0];
      await cacheSet(`tenant:${tenantId}`, JSON.stringify(tenant), 3600);
    }

    req.tenant = tenant;
    req.tenantId = tenantId;
    next();
  } catch (err) {
    logger.error('Tenant middleware error', { err });
    return res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const optionalTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user) {
      const result = await query(
        'SELECT * FROM tenants WHERE id = $1',
        [req.user.tenantId]
      );
      
      if (result.rows.length) {
        req.tenant = result.rows[0];
        req.tenantId = req.user.tenantId;
      }
    }
  } catch (err) {
    logger.debug('Optional tenant lookup failed', { err });
  }
  next();
};
