import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateLead, validateRequest, validatePagination, validateUUID } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import {
  createLead,
  getLeads,
  getLead,
  updateLeadStatus,
} from '../controllers/leadController';

const router = Router();

router.post('/', validateLead(), asyncHandler(createLead));
router.get('/', validatePagination(), optionalAuth, asyncHandler(getLeads));
router.get('/:id', validateUUID(), asyncHandler(getLead));
router.patch('/:id/status', validateUUID(), validateRequest, asyncHandler(updateLeadStatus));

export default router;
