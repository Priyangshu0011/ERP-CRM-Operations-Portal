import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // Clean existing data
  await prisma.challanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.followUpNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users for all 4 required roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Admin)',
      email: 'admin@erp.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Sales)',
      email: 'sales@erp.com',
      password: hashedPassword,
      role: 'SALES',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Marcus Wright (Warehouse)',
      email: 'warehouse@erp.com',
      password: hashedPassword,
      role: 'WAREHOUSE',
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Elena Vance (Accounts)',
      email: 'accounts@erp.com',
      password: hashedPassword,
      role: 'ACCOUNTS',
    },
  });

  console.log('✅ Users created: Admin, Sales, Warehouse, Accounts');

  // 2. Create Products
  const productsData = [
    {
      name: 'Industrial Bolt Set M8 (100pcs)',
      sku: 'PRD-BLT-M8',
      category: 'Fasteners',
      unitPrice: 450.0,
      currentStock: 120,
      minStockAlert: 20,
      location: 'Warehouse A - Bay 3 - Shelf B',
      imageUrl: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300',
    },
    {
      name: 'Heavy Duty Steel Valve 2-Inch',
      sku: 'PRD-VLV-02',
      category: 'Plumbing',
      unitPrice: 2850.0,
      currentStock: 15, // Low stock!
      minStockAlert: 20,
      location: 'Warehouse A - Bay 1 - Shelf D',
      imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=300',
    },
    {
      name: 'Copper Wiring Cable Spool 100m',
      sku: 'PRD-CBL-100',
      category: 'Electrical',
      unitPrice: 3400.0,
      currentStock: 45,
      minStockAlert: 10,
      location: 'Warehouse B - Bay 4 - Rack 2',
      imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=300',
    },
    {
      name: 'Hydraulic Sealant Fluid 5L',
      sku: 'PRD-HYD-05L',
      category: 'Chemicals',
      unitPrice: 1250.0,
      currentStock: 8, // Low stock!
      minStockAlert: 15,
      location: 'Warehouse C - Hazmat Rack 1',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300',
    },
    {
      name: 'Stainless Steel Bearing 6204',
      sku: 'PRD-BRG-6204',
      category: 'Mechanical',
      unitPrice: 620.0,
      currentStock: 250,
      minStockAlert: 50,
      location: 'Warehouse A - Bay 2 - Bin 12',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300',
    },
  ];

  const products = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    products.push(prod);
  }
  console.log('✅ Products created with initial inventory levels');

  // 3. Initial Stock Movement Logs for products
  for (const prod of products) {
    await prisma.stockLog.create({
      data: {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantityChanged: prod.currentStock,
        movementType: 'IN',
        reason: 'Initial Opening Stock Deposit',
        createdById: warehouseUser.id,
        createdByName: warehouseUser.name,
      },
    });
  }

  // 4. Create Customers
  const cust1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Sharma',
      mobile: '+91 98765 43210',
      email: 'rajesh@apexindustrial.com',
      businessName: 'Apex Industrial Solutions',
      gstNumber: '27AAACA123411Z5',
      type: 'Wholesale',
      address: 'Plot 42, MIDC Industrial Area, Pune, Maharashtra - 411026',
      status: 'Active',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Key wholesale buyer for fasteners and fittings.',
      createdById: salesUser.id,
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      name: 'Vikram Mehta',
      mobile: '+91 98123 98765',
      email: 'vikram@metrohardware.in',
      businessName: 'Metro Hardware Stores',
      gstNumber: '07BBBCC5678D2Z9',
      type: 'Retail',
      address: 'Shop 14, Main Market, Chandni Chowk, New Delhi - 110006',
      status: 'Lead',
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'Interested in bulk copper cable order for new metro project.',
      createdById: salesUser.id,
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      name: 'Ananya Roy',
      mobile: '+91 99001 12233',
      email: 'ananya@easterntraders.co.in',
      businessName: 'Eastern Traders Pvt Ltd',
      gstNumber: '19CCCCD9012E3Z1',
      type: 'Distributor',
      address: '15 Park Street, 4th Floor, Kolkata, West Bengal - 700016',
      status: 'Active',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Regional distributor for Eastern India.',
      createdById: salesUser.id,
    },
  });

  console.log('✅ Customers created (Lead, Active, Wholesale, Retail, Distributor)');

  // 5. Create Follow Up Notes
  await prisma.followUpNote.createMany({
    data: [
      {
        customerId: cust1.id,
        note: 'Sent revised wholesale price catalog for Q3 orders.',
        authorName: salesUser.name,
      },
      {
        customerId: cust2.id,
        note: 'Customer requested sample spec sheet for copper cables.',
        authorName: salesUser.name,
      },
      {
        customerId: cust3.id,
        note: 'Discussed annual distribution targets. Agreed to 15% bulk rebate.',
        authorName: admin.name,
      },
    ],
  });

  // 6. Create Sales Challans
  // Challan 1: Confirmed
  const challan1 = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: cust1.id,
      customerName: cust1.businessName,
      totalQuantity: 20,
      totalAmount: 9000.0,
      status: 'Confirmed',
      createdById: salesUser.id,
      createdByName: salesUser.name,
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: products[0].id,
            productNameSnapshot: products[0].name,
            skuSnapshot: products[0].sku,
            unitPriceSnapshot: products[0].unitPrice,
            quantity: 20,
            subtotal: 9000.0,
          },
        ],
      },
    },
  });

  // Log stock reduction for Confirmed Challan 1
  await prisma.stockLog.create({
    data: {
      productId: products[0].id,
      productName: products[0].name,
      sku: products[0].sku,
      quantityChanged: -20,
      movementType: 'OUT',
      reason: `Sales Challan Confirmation: ${challan1.challanNumber}`,
      createdById: salesUser.id,
      createdByName: salesUser.name,
    },
  });

  // Challan 2: Draft
  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: cust2.id,
      customerName: cust2.businessName,
      totalQuantity: 5,
      totalAmount: 17000.0,
      status: 'Draft',
      createdById: salesUser.id,
      createdByName: salesUser.name,
      items: {
        create: [
          {
            productId: products[2].id,
            productNameSnapshot: products[2].name,
            skuSnapshot: products[2].sku,
            unitPriceSnapshot: products[2].unitPrice,
            quantity: 5,
            subtotal: 17000.0,
          },
        ],
      },
    },
  });

  console.log('✅ Seed complete! Seeded users, products, stock logs, customers, notes, and challans.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
