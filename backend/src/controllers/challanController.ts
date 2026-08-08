import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const challanItemSchema = z.object({
  productId: z.string().uuid('Valid product ID required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

const createChallanSchema = z.object({
  customerId: z.string().uuid('Valid customer ID required'),
  status: z.enum(['Draft', 'Confirmed']).default('Draft'),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least one product item'),
});

const updateChallanStatusSchema = z.object({
  status: z.enum(['Confirmed', 'Cancelled']),
});

export const getChallans = async (req: AuthenticatedRequest, res: Response) => {
  const { search, status, customerId, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { challanNumber: { contains: search as string } },
      { customerName: { contains: search as string } },
      { createdByName: { contains: search as string } },
    ];
  }

  if (status) {
    where.status = status as string;
  }

  if (customerId) {
    where.customerId = customerId as string;
  }

  const [total, challans] = await Promise.all([
    prisma.salesChallan.count({ where }),
    prisma.salesChallan.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, businessName: true, email: true, mobile: true, gstNumber: true, address: true } },
        items: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return res.json({
    data: challans,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getChallanById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const challan = await prisma.salesChallan.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!challan) {
    return res.status(404).json({ error: 'Sales Challan not found' });
  }

  return res.json({ challan });
};

export const createChallan = async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, status, items } = createChallanSchema.parse(req.body);

  // 1. Verify Customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    return res.status(404).json({ error: 'Selected customer not found' });
  }

  // 2. Fetch all requested products and snapshot data
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Check if all requested product IDs exist
  for (const item of items) {
    if (!productMap.has(item.productId)) {
      return res.status(400).json({ error: `Product with ID '${item.productId}' not found` });
    }
  }

  // 3. Stock validation if status is Confirmed
  if (status === 'Confirmed') {
    const insufficientItems: Array<{ productName: string; sku: string; available: number; requested: number }> = [];

    for (const item of items) {
      const prod = productMap.get(item.productId)!;
      if (prod.currentStock < item.quantity) {
        insufficientItems.push({
          productName: prod.name,
          sku: prod.sku,
          available: prod.currentStock,
          requested: item.quantity,
        });
      }
    }

    if (insufficientItems.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock to confirm challan',
        insufficientItems,
        message: insufficientItems
          .map((i) => `'${i.productName}' (SKU: ${i.sku}): Requested ${i.requested}, but only ${i.available} in stock`)
          .join('; '),
      });
    }
  }

  // 4. Generate Auto Challan Number: e.g. CH-20260808-1001
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await prisma.salesChallan.count();
  const nextNum = (count + 1).toString().padStart(4, '0');
  const challanNumber = `CH-${todayStr}-${nextNum}`;

  // 5. Prepare item snapshot data
  let totalQuantity = 0;
  let totalAmount = 0;

  const itemSnapshots = items.map((item) => {
    const prod = productMap.get(item.productId)!;
    const subtotal = prod.unitPrice * item.quantity;
    totalQuantity += item.quantity;
    totalAmount += subtotal;

    return {
      productId: prod.id,
      productNameSnapshot: prod.name,
      skuSnapshot: prod.sku,
      unitPriceSnapshot: prod.unitPrice,
      quantity: item.quantity,
      subtotal,
    };
  });

  // 6. Execute atomic creation & stock reduction in DB transaction if Confirmed
  const result = await prisma.$transaction(async (tx) => {
    const challan = await tx.salesChallan.create({
      data: {
        challanNumber,
        customerId: customer.id,
        customerName: customer.businessName,
        totalQuantity,
        totalAmount,
        status,
        createdById: req.user!.id,
        createdByName: req.user!.name,
        confirmedAt: status === 'Confirmed' ? new Date() : null,
        items: {
          create: itemSnapshots,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // If Confirmed, reduce stock and record stock movement log
    if (status === 'Confirmed') {
      for (const item of items) {
        const prod = productMap.get(item.productId)!;
        await tx.product.update({
          where: { id: prod.id },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        await tx.stockLog.create({
          data: {
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            quantityChanged: -item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan Confirmation: ${challan.challanNumber}`,
            createdById: req.user!.id,
            createdByName: req.user!.name,
          },
        });
      }
    }

    return challan;
  });

  return res.status(201).json({
    message: `Sales Challan created successfully in ${status} status`,
    challan: result,
  });
};

export const updateChallanStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status: targetStatus } = updateChallanStatusSchema.parse(req.body);

  const existingChallan = await prisma.salesChallan.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existingChallan) {
    return res.status(404).json({ error: 'Sales Challan not found' });
  }

  if (existingChallan.status === targetStatus) {
    return res.status(400).json({ error: `Challan is already in '${targetStatus}' status.` });
  }

  if (existingChallan.status === 'Cancelled') {
    return res.status(400).json({ error: 'Cannot change status of a Cancelled challan.' });
  }

  // 1. If transitioning from Draft -> Confirmed
  if (existingChallan.status === 'Draft' && targetStatus === 'Confirmed') {
    const productIds = existingChallan.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const insufficientItems: Array<{ productName: string; sku: string; available: number; requested: number }> = [];

    for (const item of existingChallan.items) {
      const prod = productMap.get(item.productId);
      if (!prod || prod.currentStock < item.quantity) {
        insufficientItems.push({
          productName: item.productNameSnapshot,
          sku: item.skuSnapshot,
          available: prod ? prod.currentStock : 0,
          requested: item.quantity,
        });
      }
    }

    if (insufficientItems.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock to confirm draft challan',
        insufficientItems,
        message: insufficientItems
          .map((i) => `'${i.productName}' (SKU: ${i.sku}): Requested ${i.requested}, but only ${i.available} in stock`)
          .join('; '),
      });
    }

    // Atomic confirmation transaction
    const updatedChallan = await prisma.$transaction(async (tx) => {
      const updated = await tx.salesChallan.update({
        where: { id },
        data: {
          status: 'Confirmed',
          confirmedAt: new Date(),
        },
        include: { items: true, customer: true },
      });

      for (const item of existingChallan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            productName: item.productNameSnapshot,
            sku: item.skuSnapshot,
            quantityChanged: -item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan Confirmation: ${existingChallan.challanNumber}`,
            createdById: req.user!.id,
            createdByName: req.user!.name,
          },
        });
      }

      return updated;
    });

    return res.json({
      message: 'Challan confirmed successfully and inventory stock reduced.',
      challan: updatedChallan,
    });
  }

  // 2. If cancelling a Confirmed challan (restores stock)
  if (existingChallan.status === 'Confirmed' && targetStatus === 'Cancelled') {
    const updatedChallan = await prisma.$transaction(async (tx) => {
      const updated = await tx.salesChallan.update({
        where: { id },
        data: { status: 'Cancelled' },
        include: { items: true, customer: true },
      });

      for (const item of existingChallan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });

        await tx.stockLog.create({
          data: {
            productId: item.productId,
            productName: item.productNameSnapshot,
            sku: item.skuSnapshot,
            quantityChanged: item.quantity,
            movementType: 'IN',
            reason: `Challan Cancellation Reversal: ${existingChallan.challanNumber}`,
            createdById: req.user!.id,
            createdByName: req.user!.name,
          },
        });
      }

      return updated;
    });

    return res.json({
      message: 'Challan cancelled successfully and inventory stock restored.',
      challan: updatedChallan,
    });
  }

  // 3. Draft -> Cancelled
  const updatedChallan = await prisma.salesChallan.update({
    where: { id },
    data: { status: 'Cancelled' },
    include: { items: true, customer: true },
  });

  return res.json({
    message: 'Draft challan cancelled successfully.',
    challan: updatedChallan,
  });
};
