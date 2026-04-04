import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, validateUUID } from '../middleware/validate';
import {
  createDeal,
  getDeal,
  updateDeal,
  getDealDashboard,
} from '../controllers/dealController';

const router = Router();

router.post('/', [
  body('leadId').isUUID(),
  body('paymentOptionId').notEmpty(),
  body('systemSize').isFloat({ min: 0 }),
  body('systemCost').isFloat({ min: 0 }),
  validateRequest,
], asyncHandler(createDeal));

router.get('/:id', validateUUID(), asyncHandler(getDeal));
router.patch('/:id', validateUUID(), validateRequest, asyncHandler(updateDeal));
router.get('/dashboard/:leadId', validateUUID(), asyncHandler(getDealDashboard));

export default router;
