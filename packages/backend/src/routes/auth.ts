import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validate';
import { authMiddleware, magicLinkAuth } from '../middleware/auth';
import {
  login,
  sendMagicLink,
  verifyMagicLink,
  refreshToken,
} from '../controllers/authController';

const router = Router();

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
  validateRequest,
], asyncHandler(login));

router.post('/magic-link', [
  body('email').isEmail(),
  validateRequest,
], asyncHandler(sendMagicLink));

router.post('/verify-magic-link', magicLinkAuth, asyncHandler(verifyMagicLink));

router.post('/refresh', authMiddleware, asyncHandler(refreshToken));

export default router;
