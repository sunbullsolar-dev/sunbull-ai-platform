import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param } from 'express-validator';
import { error as errorResponse } from '../utils/apiResponse';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      errorResponse(
        'Validation failed',
        400,
        errors.array().map(e => ({ field: 'type' in e ? (e as any).type : (e as any).param, message: e.msg }))
      )
    );
  }
  next();
};

export const validateLead = () => [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('tcpaConsent').isBoolean().withMessage('TCPA consent is required'),
  validateRequest,
];

export const validateProposalGeneration = () => [
  body('leadId').isUUID().withMessage('Valid lead ID required'),
  validateRequest,
];

export const validateCheckoutSelection = () => [
  body('dealId').isUUID().withMessage('Valid deal ID required'),
  body('paymentOptionId').notEmpty().withMessage('Payment option ID required'),
  validateRequest,
];

export const validatePagination = () => [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  validateRequest,
];

export const validateUUID = () => [
  param('id').isUUID().withMessage('Invalid ID format'),
  validateRequest,
];

export const validateInstaller = () => [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('state').isLength({ min: 2, max: 2 }).withMessage('Valid state code required'),
  body('availability').isBoolean().withMessage('Availability status required'),
  validateRequest,
];

export const validateDocuSignWebhook = () => [
  body('data').notEmpty().withMessage('Webhook data required'),
  validateRequest,
];
