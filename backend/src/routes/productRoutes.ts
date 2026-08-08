import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockLogs,
} from '../controllers/productController';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

// Read-only products & stock activity logs (Required for Dashboard widgets across all roles)
router.get('/', getProducts);
router.get('/stock-logs', getStockLogs);
router.get('/:id', getProductById);

// Write/Mutate inventory & stock adjustments: ONLY ADMIN and WAREHOUSE
router.post('/', requireRole(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', requireRole(['ADMIN', 'WAREHOUSE']), updateProduct);
router.post('/:id/adjust-stock', requireRole(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
