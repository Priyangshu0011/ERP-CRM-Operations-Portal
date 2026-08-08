import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU code is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
  currentStock: z.number().int().min(0, 'Stock cannot be negative'),
  minStockAlert: z.number().int().min(0, 'Minimum alert quantity cannot be negative'),
  location: z.string().min(2, 'Location/Warehouse is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const stockAdjustmentSchema = z.object({
  quantityChanged: z.number().int().refine((val) => val !== 0, 'Quantity change cannot be 0'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(3, 'Reason for stock adjustment is required'),
});

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  const { search, category, lowStock, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { sku: { contains: search as string } },
      { category: { contains: search as string } },
      { location: { contains: search as string } },
    ];
  }

  if (category) {
    where.category = category as string;
  }

  let products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  if (lowStock === 'true') {
    products = products.filter((p) => p.currentStock <= p.minStockAlert);
  }

  const total = products.length;
  const paginatedProducts = products.slice(skip, skip + limitNum);

  return res.json({
    data: paginatedProducts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json({ product });
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  const data = productSchema.parse(req.body);

  const existingSku = await prisma.product.findUnique({
    where: { sku: data.sku },
  });

  if (existingSku) {
    return res.status(400).json({ error: `Product with SKU '${data.sku}' already exists.` });
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      currentStock: data.currentStock,
      minStockAlert: data.minStockAlert,
      location: data.location,
      imageUrl: data.imageUrl || null,
    },
  });

  // Record initial stock log if currentStock > 0
  if (data.currentStock > 0) {
    await prisma.stockLog.create({
      data: {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantityChanged: data.currentStock,
        movementType: 'IN',
        reason: 'Initial Opening Stock Entry',
        createdById: req.user!.id,
        createdByName: req.user!.name,
      },
    });
  }

  return res.status(201).json({
    message: 'Product created successfully',
    product,
  });
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = productSchema.parse(req.body);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (data.sku !== existing.sku) {
    const skuCheck = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (skuCheck) {
      return res.status(400).json({ error: `Product with SKU '${data.sku}' already exists.` });
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      minStockAlert: data.minStockAlert,
      location: data.location,
      imageUrl: data.imageUrl || null,
      // Note: currentStock is adjusted via stock movement endpoint or challans
    },
  });

  return res.json({
    message: 'Product updated successfully',
    product: updatedProduct,
  });
};

export const adjustStock = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { quantityChanged, movementType, reason } = stockAdjustmentSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  let qtyChange = Math.abs(quantityChanged);
  if (movementType === 'OUT') {
    if (product.currentStock < qtyChange) {
      return res.status(400).json({
        error: `Insufficient stock for product '${product.name}'. Available: ${product.currentStock}, Requested reduction: ${qtyChange}`,
      });
    }
    qtyChange = -qtyChange;
  }

  const newStock = product.currentStock + qtyChange;

  const [updatedProduct, stockLog] = await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { currentStock: newStock },
    }),
    prisma.stockLog.create({
      data: {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantityChanged: qtyChange,
        movementType,
        reason,
        createdById: req.user!.id,
        createdByName: req.user!.name,
      },
    }),
  ]);

  return res.json({
    message: 'Stock updated successfully',
    product: updatedProduct,
    stockLog,
  });
};

export const getStockLogs = async (req: AuthenticatedRequest, res: Response) => {
  const { productId, movementType, page = '1', limit = '15' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (productId) {
    where.productId = productId as string;
  }

  if (movementType) {
    where.movementType = movementType as string;
  }

  const [total, stockLogs] = await Promise.all([
    prisma.stockLog.count({ where }),
    prisma.stockLog.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return res.json({
    data: stockLogs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};
