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

// Read products (Required by ADMIN, SALES, WAREHOUSE, ACCOUNTS for catalog browsing)
router.get('/', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProducts);

// Audit Stock Movement Logs (ADMIN, WAREHOUSE, ACCOUNTS)
router.get('/stock-logs', requireRole(['ADMIN', 'WAREHOUSE', 'ACCOUNTS']), getStockLogs);

// Single Product Details
router.get('/:id', requireRole(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']), getProductById);

// Inventory Mutations: ONLY ADMIN and WAREHOUSE
router.post('/', requireRole(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', requireRole(['ADMIN', 'WAREHOUSE']), updateProduct);
router.post('/:id/adjust-stock', requireRole(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
