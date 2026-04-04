import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateProposalGeneration, validateRequest, validateUUID } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import {
  generateProposal,
  getProposal,
  getProposalByLead,
} from '../controllers/proposalController';

const router = Router();

router.post('/generate', validateProposalGeneration(), asyncHandler(generateProposal));
router.get('/:id', validateUUID(), asyncHandler(getProposal));
router.get('/lead/:leadId', validateUUID(), asyncHandler(getProposalByLead));

export default router;
