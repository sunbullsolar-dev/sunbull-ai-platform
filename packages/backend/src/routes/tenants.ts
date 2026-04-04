import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, validateUUID } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import {
  createTenant,
  getTenant,
  updateTenant,
  getTenantStats,
} from '../controllers/tenantController';

const router = Router();

router.post('/', [
  body('name').notEmpty(),
  body('subdomain').matches(/^[a-z0-9-]+$/),
  validateRequest,
], asyncHandler(createTenant));

router.get('/:id', validateUUID(), asyncHandler(getTenant));
router.patch('/:id', validateUUID(), validateRequest, asyncHandler(updateTenant));
router.get('/:id/stats', validateUUID(), asyncHandler(getTenantStats));

export default router;
