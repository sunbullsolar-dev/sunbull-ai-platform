import { Request, Response } from 'express';
import { dequeue, deliverResult, stats } from '../services/lightreachRelay';
import logger from '../utils/logger';

/**
 * Endpoints used by the in-browser relay loop to pump jobs through the user's
 * authenticated Palmetto tab. All endpoints require a shared secret in the
 * `x-relay-token` header matching LIGHTREACH_RELAY_TOKEN.
 */

const requireToken = (req: Request, res: Response): boolean => {
  const expected = process.env.LIGHTREACH_RELAY_TOKEN;
  if (!expected) {
    res.status(503).json({ success: false, error: 'LIGHTREACH_RELAY_TOKEN not set' });
    return false;
  }
  const got = req.headers['x-relay-token'] || req.query.token;
  if (got !== expected) {
    res.status(401).json({ success: false, error: 'invalid relay token' });
    return false;
  }
  return true;
};

// Browser relay polls this endpoint. If a job is waiting, returns it.
export const relayDequeue = async (req: Request, res: Response) => {
  if (!requireToken(req, res)) return;
  const job = dequeue();
  if (!job) {
    res.setHeader('Access-Control-Allow-Origin', 'https://palmetto.finance');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }
  res.setHeader('Access-Control-Allow-Origin', 'https://palmetto.finance');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.json({ id: job.id, ...job.request });
};

// Browser relay POSTs results back to this endpoint.
export const relayResult = async (req: Request, res: Response) => {
  if (!requireToken(req, res)) return;
  const { id, status, body } = req.body || {};
  if (!id || typeof status !== 'number') {
    return res.status(400).json({ success: false, error: 'id and status required' });
  }
  const ok = deliverResult(id, { status, body });
  res.setHeader('Access-Control-Allow-Origin', 'https://palmetto.finance');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.json({ success: ok });
};

// CORS preflight — the browser tab runs on palmetto.finance and calls this backend cross-origin
export const relayOptions = async (_req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://palmetto.finance');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,x-relay-token');
  res.status(204).end();
};

export const relayStatus = async (req: Request, res: Response) => {
  if (!requireToken(req, res)) return;
  res.json({ success: true, data: stats() });
};
