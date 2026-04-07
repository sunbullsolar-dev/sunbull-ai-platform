import { Router } from 'express';
import { relayDequeue, relayResult, relayOptions, relayStatus } from '../controllers/lightreachController';

const router = Router();

router.options('/dequeue', relayOptions);
router.options('/result', relayOptions);
router.get('/dequeue', relayDequeue);
router.post('/result', relayResult);
router.get('/status', relayStatus);

export default router;
