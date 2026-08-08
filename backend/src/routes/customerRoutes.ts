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

// Customer CRM is accessible to ADMIN and SALES
router.get('/', requireRole(['ADMIN', 'SALES']), getCustomers);
router.get('/:id', requireRole(['ADMIN', 'SALES']), getCustomerById);
router.post('/', requireRole(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', requireRole(['ADMIN', 'SALES']), updateCustomer);
router.post('/:id/notes', requireRole(['ADMIN', 'SALES']), addFollowUpNote);

export default router;
