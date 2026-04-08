import { Router, Request, Response, NextFunction } from 'express';
import { relayDequeue, relayResult, relayOptions, relayStatus, goodleapCaptureTokens } from '../controllers/lightreachController';

const router = Router();

// Per-router CORS middleware — browser relay runs on palmetto.finance cross-origin.
// This overrides the global cors() middleware's origin allowlist.
router.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  const allowed = origin === 'https://origin.goodleap.com' ? origin : 'https://palmetto.finance';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,x-relay-token');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

router.options('/dequeue', relayOptions);
router.options('/result', relayOptions);
router.get('/dequeue', relayDequeue);
router.post('/result', relayResult);
router.get('/status', relayStatus);
router.options('/goodleap-tokens', relayOptions);
router.post('/goodleap-tokens', goodleapCaptureTokens);

export default router;
