import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowUpNote,
} from '../controllers/customerController';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', requireRole(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getCustomers);
router.get('/:id', requireRole(['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE']), getCustomerById);
router.post('/', requireRole(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', requireRole(['ADMIN', 'SALES']), updateCustomer);
router.post('/:id/notes', requireRole(['ADMIN', 'SALES', 'ACCOUNTS']), addFollowUpNote);

export default router;
