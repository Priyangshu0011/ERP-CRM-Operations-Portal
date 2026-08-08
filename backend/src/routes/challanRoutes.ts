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

router.get('/', getChallans);
router.get('/:id', getChallanById);
router.post('/', requireRole(['ADMIN', 'SALES']), createChallan);
router.patch('/:id/status', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), updateChallanStatus);

export default router;
