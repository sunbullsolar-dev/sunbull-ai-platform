import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateInstaller, validateRequest, validatePagination, validateUUID } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import {
  getInstallers,
  getInstaller,
  createInstaller,
  updateInstaller,
  assignInstaller,
} from '../controllers/installerController';

const router = Router();

router.get('/', validatePagination(), asyncHandler(getInstallers));
router.get('/:id', validateUUID(), asyncHandler(getInstaller));
router.post('/', validateInstaller(), asyncHandler(createInstaller));
router.patch('/:id', validateUUID(), validateRequest, asyncHandler(updateInstaller));
router.post('/:id/assign', validateUUID(), validateRequest, asyncHandler(assignInstaller));

export default router;
