import { Router, Request, Response, NextFunction } from 'express';
import { relayDequeue, relayResult, relayOptions, relayStatus } from '../controllers/lightreachController';

const router = Router();

// Per-router CORS middleware — browser relay runs on palmetto.finance cross-origin.
// This overrides the global cors() middleware's origin allowlist.
router.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://palmetto.finance');
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

export default router;
