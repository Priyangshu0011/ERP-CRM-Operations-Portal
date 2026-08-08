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

// Read-only customer data (Required by all roles for dropdowns and dashboard counters)
router.get('/', getCustomers);
router.get('/:id', getCustomerById);

// Write/Mutate customer CRM data: ONLY ADMIN and SALES
router.post('/', requireRole(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', requireRole(['ADMIN', 'SALES']), updateCustomer);
router.post('/:id/notes', requireRole(['ADMIN', 'SALES']), addFollowUpNote);

export default router;
