import axios from 'axios';
import { Customer, Product, SalesChallan, StockLog, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Auth APIs
export const loginApi = async (email: string, password: string) => {
  const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get<{ user: User }>('/auth/me');
  return res.data.user;
};

// Customer APIs
export const getCustomersApi = async (params?: { search?: string; status?: string; type?: string; page?: number }) => {
  const res = await api.get<{ data: Customer[]; pagination: any }>('/customers', { params });
  return res.data;
};

export const getCustomerByIdApi = async (id: string) => {
  const res = await api.get<{ customer: Customer }>(`/customers/${id}`);
  return res.data.customer;
};

export const createCustomerApi = async (data: Partial<Customer>) => {
  const res = await api.post<{ customer: Customer }>('/customers', data);
  return res.data.customer;
};

export const updateCustomerApi = async (id: string, data: Partial<Customer>) => {
  const res = await api.put<{ customer: Customer }>(`/customers/${id}`, data);
  return res.data.customer;
};

export const addFollowUpNoteApi = async (id: string, note: string, followUpDate?: string, newStatus?: string) => {
  const res = await api.post(`/customers/${id}/notes`, { note, followUpDate, newStatus });
  return res.data;
};

// Product & Inventory APIs
export const getProductsApi = async (params?: { search?: string; category?: string; lowStock?: boolean; page?: number }) => {
  const res = await api.get<{ data: Product[]; pagination: any }>('/products', { params });
  return res.data;
};

export const getProductByIdApi = async (id: string) => {
  const res = await api.get<{ product: Product }>(`/products/${id}`);
  return res.data.product;
};

export const createProductApi = async (data: Partial<Product>) => {
  const res = await api.post<{ product: Product }>('/products', data);
  return res.data.product;
};

export const updateProductApi = async (id: string, data: Partial<Product>) => {
  const res = await api.put<{ product: Product }>(`/products/${id}`, data);
  return res.data.product;
};

export const adjustStockApi = async (id: string, quantityChanged: number, movementType: 'IN' | 'OUT', reason: string) => {
  const res = await api.post<{ product: Product; stockLog: StockLog }>(`/products/${id}/adjust-stock`, {
    quantityChanged,
    movementType,
    reason,
  });
  return res.data;
};

export const getStockLogsApi = async (params?: { productId?: string; movementType?: string; page?: number }) => {
  const res = await api.get<{ data: StockLog[]; pagination: any }>('/products/stock-logs', { params });
  return res.data;
};

// Sales Challan APIs
export const getChallansApi = async (params?: { search?: string; status?: string; customerId?: string; page?: number }) => {
  const res = await api.get<{ data: SalesChallan[]; pagination: any }>('/challans', { params });
  return res.data;
};

export const getChallanByIdApi = async (id: string) => {
  const res = await api.get<{ challan: SalesChallan }>(`/challans/${id}`);
  return res.data.challan;
};

export const createChallanApi = async (data: { customerId: string; status: 'Draft' | 'Confirmed'; items: { productId: string; quantity: number }[] }) => {
  const res = await api.post<{ challan: SalesChallan; message: string }>('/challans', data);
  return res.data;
};

export const updateChallanStatusApi = async (id: string, status: 'Confirmed' | 'Cancelled') => {
  const res = await api.patch<{ challan: SalesChallan; message: string }>(`/challans/${id}/status`, { status });
  return res.data;
};
