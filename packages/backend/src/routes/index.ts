import { Router } from 'express';
import leadsRouter from './leads';
import proposalsRouter from './proposals';
import dealsRouter from './deals';
import checkoutRouter from './checkout';
import installersRouter from './installers';
import authRouter from './auth';
import tenantsRouter from './tenants';
import webhooksRouter from './webhooks';
import lightreachRouter from './lightreach';

const router = Router();

router.use('/leads', leadsRouter);
router.use('/proposals', proposalsRouter);
router.use('/deals', dealsRouter);
router.use('/checkout', checkoutRouter);
router.use('/installers', installersRouter);
router.use('/auth', authRouter);
router.use('/tenants', tenantsRouter);
router.use('/webhooks', webhooksRouter);
router.use('/lightreach', lightreachRouter);

export default router;
