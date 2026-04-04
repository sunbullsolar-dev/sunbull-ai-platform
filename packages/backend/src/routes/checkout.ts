import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validate';
import {
  selectPaymentOption,
  getCommitmentSummary,
  submitFinancingApplication,
  initiateDocuSignSigning,
  scheduleInspection,
  completeCheckout,
} from '../controllers/checkoutController';

const router = Router();

router.post('/select-payment', [
  body('dealId').isUUID(),
  body('paymentOptionId').notEmpty(),
  validateRequest,
], asyncHandler(selectPaymentOption));

router.post('/commitment-summary', [
  body('dealId').isUUID(),
  validateRequest,
], asyncHandler(getCommitmentSummary));

router.post('/financing-application', [
  body('dealId').isUUID(),
  body('lenderId').notEmpty(),
  validateRequest,
], asyncHandler(submitFinancingApplication));

router.post('/docusign', [
  body('dealId').isUUID(),
  validateRequest,
], asyncHandler(initiateDocuSignSigning));

router.post('/schedule-inspection', [
  body('dealId').isUUID(),
  body('inspectionDate').isISO8601(),
  body('inspectionTime').matches(/^\d{2}:\d{2}$/),
  validateRequest,
], asyncHandler(scheduleInspection));

router.post('/complete', [
  body('dealId').isUUID(),
  validateRequest,
], asyncHandler(completeCheckout));

export default router;
