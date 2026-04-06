import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateLead, validateRequest, validatePagination, validateUUID } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import {
  createLead,
  getLeads,
  getLead,
  updateLeadStatus,
  updateLeadContact,
} from '../controllers/leadController';

const router = Router();

// Tesla-style ghost lead: address + bill only, no validateLead name/email constraints
router.post('/', asyncHandler(createLead));
router.get('/', validatePagination(), optionalAuth, asyncHandler(getLeads));
router.get('/:id', validateUUID(), asyncHandler(getLead));
router.patch('/:id/contact', validateUUID(), asyncHandler(updateLeadContact));
router.patch('/:id/status', validateUUID(), validateRequest, asyncHandler(updateLeadStatus));

export default router;
