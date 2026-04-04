import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateDocuSignWebhook, validateRequest } from '../middleware/validate';
import {
  handleDocuSignWebhook,
  handleLenderWebhook,
  handleTwilioWebhook,
  handleStripeWebhook,
} from '../controllers/webhookController';

const router = Router();

router.post('/docusign', validateDocuSignWebhook(), asyncHandler(handleDocuSignWebhook));
router.post('/lender', validateRequest, asyncHandler(handleLenderWebhook));
router.post('/twilio', asyncHandler(handleTwilioWebhook));
router.post('/stripe', asyncHandler(handleStripeWebhook));

export default router;
