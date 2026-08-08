import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
} from '../controllers/challanController';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

// Read-only sales challans (Required for revenue metrics & billing audit)
router.get('/', getChallans);
router.get('/:id', getChallanById);

// Order creation & status confirmation: ONLY ADMIN and SALES
router.post('/', requireRole(['ADMIN', 'SALES']), createChallan);
router.patch('/:id/status', requireRole(['ADMIN', 'SALES']), updateChallanStatus);

export default router;
