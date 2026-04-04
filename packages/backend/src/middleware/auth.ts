import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../utils/logger';
import { error as errorResponse } from '../utils/apiResponse';
import { User } from '../types';
import { query } from '../config/database';
import { cacheGet } from '../config/redis';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      magicLinkEmail?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json(errorResponse('Missing authorization token', 401));
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!userResult.rows.length) {
      return res.status(401).json(errorResponse('User not found', 401));
    }

    req.user = userResult.rows[0];
    next();
  } catch (err) {
    logger.error('Auth middleware error', { err });
    return res.status(401).json(errorResponse('Invalid or expired token', 401));
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const userResult = await query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (userResult.rows.length) {
        req.user = userResult.rows[0];
      }
    }
  } catch (err) {
    logger.debug('Optional auth failed, continuing without user');
  }
  next();
};

export const magicLinkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(errorResponse('Magic link token required', 400));
    }

    const cachedEmail = await cacheGet(`magic_link:${token}`);

    if (!cachedEmail) {
      return res.status(401).json(errorResponse('Invalid or expired magic link', 401));
    }

    req.magicLinkEmail = cachedEmail;
    next();
  } catch (err) {
    logger.error('Magic link auth error', { err });
    return res.status(401).json(errorResponse('Invalid magic link', 401));
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as any
  );
};

export const generateMagicLinkToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};
