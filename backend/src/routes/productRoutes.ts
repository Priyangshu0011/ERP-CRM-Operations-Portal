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

router.get('/', getProducts);
router.get('/stock-logs', getStockLogs);
router.get('/:id', getProductById);
router.post('/', requireRole(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', requireRole(['ADMIN', 'WAREHOUSE']), updateProduct);
router.post('/:id/adjust-stock', requireRole(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
