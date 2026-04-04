import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import { query } from '../config/database';
import { cacheSet } from '../config/redis';
import logger from '../utils/logger';
import { success, error as errorResponse } from '../utils/apiResponse';
import { generateToken, generateMagicLinkToken } from '../middleware/auth';
import { sendEmail } from '../services/sendgrid';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!userResult.rows.length) {
      return res.status(401).json(errorResponse('Invalid credentials', 401));
    }

    const user = userResult.rows[0];

    const validPassword = await bcryptjs.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json(errorResponse('Invalid credentials', 401));
    }

    const token = generateToken(user.id, user.email);

    logger.info('User logged in', { userId: user.id, email });

    res.json(
      success(
        {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            tenantId: user.tenant_id,
          },
        },
        200,
        'Login successful'
      )
    );
  } catch (err) {
    logger.error('Login error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const sendMagicLink = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const magicToken = generateMagicLinkToken();
    const expirySeconds = 15 * 60;

    await cacheSet(`magic_link:${magicToken}`, email, expirySeconds);

    const magicLinkUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/magic-link?token=${magicToken}`;

    const html = `
      <h1>Your Magic Link</h1>
      <p>Click below to log in to Sunbull:</p>
      <a href="${magicLinkUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Login to Sunbull
      </a>
      <p>This link expires in 15 minutes.</p>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Your Sunbull Login Link',
        html,
      });
    } catch (emailErr) {
      logger.warn('Magic link email failed', { emailErr });
    }

    logger.info('Magic link sent', { email });

    res.json(
      success(
        { message: 'Magic link sent to email' },
        200,
        'Check your email for the login link'
      )
    );
  } catch (err) {
    logger.error('Magic link error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const verifyMagicLink = async (req: Request, res: Response) => {
  try {
    const email = req.magicLinkEmail!;

    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!userResult.rows.length) {
      return res.status(401).json(errorResponse('User not found', 401));
    }

    const user = userResult.rows[0];
    const token = generateToken(user.id, user.email);

    logger.info('Magic link verified', { userId: user.id, email });

    res.json(
      success(
        {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            tenantId: user.tenant_id,
          },
        },
        200,
        'Login successful'
      )
    );
  } catch (err) {
    logger.error('Magic link verification error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('Unauthorized', 401));
    }

    const token = generateToken(req.user.id, req.user.email);

    res.json(
      success({ token }, 200, 'Token refreshed successfully')
    );
  } catch (err) {
    logger.error('Token refresh error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  login,
  sendMagicLink,
  verifyMagicLink,
  refreshToken,
};
