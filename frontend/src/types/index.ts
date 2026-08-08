export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor';
export type CustomerStatus = 'Lead' | 'Active' | 'Inactive';

export interface FollowUpNote {
  id: string;
  customerId: string;
  note: string;
  authorName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string };
  followUpNotes?: FollowUpNote[];
  challans?: SalesChallan[];
  _count?: { followUpNotes: number; challans: number };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  createdBy?: { id: string; name: string; email: string };
}

export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdById: string;
  createdByName: string;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: ChallanItem[];
  createdBy?: { id: string; name: string; email: string };
}
