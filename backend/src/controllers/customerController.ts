import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  mobile: z.string().min(5, 'Valid mobile number required'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  type: z.enum(['Retail', 'Wholesale', 'Distributor']),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['Lead', 'Active', 'Inactive']),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  const { search, status, type, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { businessName: { contains: search as string } },
      { email: { contains: search as string } },
      { mobile: { contains: search as string } },
    ];
  }

  if (status) {
    where.status = status as string;
  }

  if (type) {
    where.type = type as string;
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { followUpNotes: true, challans: true },
        },
      },
    }),
  ]);

  return res.json({
    data: customers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      followUpNotes: {
        orderBy: { createdAt: 'desc' },
      },
      challans: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.json({ customer });
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const data = customerSchema.parse(req.body);

  const customer = await prisma.customer.create({
    data: {
      ...data,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      createdById: req.user!.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return res.status(201).json({
    message: 'Customer created successfully',
    customer,
  });
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = customerSchema.parse(req.body);

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data: {
      ...data,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return res.json({
    message: 'Customer updated successfully',
    customer: updatedCustomer,
  });
};

export const addFollowUpNote = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { note, followUpDate, newStatus } = req.body;

  if (!note || typeof note !== 'string' || note.trim().length === 0) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const newFollowUpNote = await prisma.followUpNote.create({
    data: {
      customerId: id,
      note: note.trim(),
      authorName: req.user!.name,
    },
  });

  // Optionally update customer followUpDate and/or status
  const updateData: any = {};
  if (followUpDate) {
    updateData.followUpDate = new Date(followUpDate);
  }
  if (newStatus && ['Lead', 'Active', 'Inactive'].includes(newStatus)) {
    updateData.status = newStatus;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }

  return res.status(201).json({
    message: 'Follow-up note added successfully',
    note: newFollowUpNote,
  });
};
