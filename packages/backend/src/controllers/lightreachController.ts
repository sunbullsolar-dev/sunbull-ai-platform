import { Request, Response } from 'express';
import { dequeue, deliverResult, stats, RelayTarget } from '../services/lightreachRelay';
import { setTokens as setGoodleapTokens, tokenStats as goodleapTokenStats } from '../services/goodleapTokens';
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
  const target = ((req.query.target as string) || 'palmetto') as RelayTarget;
  const origin = target === 'goodleap' ? 'https://origin.goodleap.com' : 'https://palmetto.finance';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const job = dequeue(target);
  if (!job) return res.status(204).end();
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
  const origin = (req.headers.origin as string) || 'https://palmetto.finance';
  if (origin === 'https://origin.goodleap.com' || origin === 'https://palmetto.finance') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://palmetto.finance');
  }
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
  res.json({ success: true, data: { ...stats(), goodleapTokens: goodleapTokenStats() } });
};

// Browser capture snippet POSTs captured GoodLeap auth headers here.
export const goodleapCaptureTokens = async (req: Request, res: Response) => {
  if (!requireToken(req, res)) return;
  const origin = (req.headers.origin as string) || 'https://origin.goodleap.com';
  if (origin === 'https://origin.goodleap.com') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const { authorization, xClientMetadata, organizationId } = req.body || {};
  if (!authorization || typeof authorization !== 'string') {
    return res.status(400).json({ success: false, error: 'authorization required' });
  }
  setGoodleapTokens({ authorization, xClientMetadata, organizationId });
  res.json({ success: true });
};
