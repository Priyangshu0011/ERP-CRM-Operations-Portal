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

// Sales Challans Read Access: ADMIN, SALES, ACCOUNTS (Warehouse cannot access sales financial records)
router.get('/', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), getChallans);
router.get('/:id', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), getChallanById);

// Order Creation and Order Status Confirmation: ONLY ADMIN and SALES
router.post('/', requireRole(['ADMIN', 'SALES']), createChallan);
router.patch('/:id/status', requireRole(['ADMIN', 'SALES']), updateChallanStatus);

export default router;
