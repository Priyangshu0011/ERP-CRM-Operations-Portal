import React, { useState } from 'react';
import { Product, StockLog } from '../types';
import {
  Package,
  Search,
  Plus,
  Edit2,
  AlertTriangle,
  MapPin,
  X,
  History,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface InventoryModuleProps {
  products: Product[];
  stockLogs: StockLog[];
  onAddProduct: (data: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  onAdjustStock: (id: string, quantityChanged: number, movementType: 'IN' | 'OUT', reason: string) => Promise<void>;
  onRefresh: () => void;
  openAddModal: boolean;
  setOpenAddModal: (open: boolean) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  products,
  stockLogs,
  onAddProduct,
  onUpdateProduct,
  onAdjustStock,
  onRefresh,
  openAddModal,
  setOpenAddModal,
}) => {
  const { user } = useAuth();
  const canManageWarehouse = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [activeTab, setActiveTab] = useState<'catalog' | 'logs'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Edit Product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'Fasteners',
    unitPrice: 100,
    currentStock: 50,
    minStockAlert: 10,
    location: 'Warehouse A - Rack 1',
    imageUrl: '',
  });

  // Adjust Stock state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustReason, setAdjustReason] = useState('Manual Stock Reorder Deposit');
  const [adjustError, setAdjustError] = useState('');

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesLowStock = !lowStockOnly || p.currentStock <= p.minStockAlert;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Fasteners',
      unitPrice: 500,
      currentStock: 50,
      minStockAlert: 10,
      location: 'Warehouse A - Shelf B',
      imageUrl: '',
    });
    setOpenAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice,
      currentStock: p.currentStock,
      minStockAlert: p.minStockAlert,
      location: p.location,
      imageUrl: p.imageUrl || '',
    });
    setOpenAddModal(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productForm);
    } else {
      await onAddProduct(productForm);
    }
    setOpenAddModal(false);
    onRefresh();
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    setAdjustError('');

    try {
      await onAdjustStock(adjustingProduct.id, adjustQty, adjustType, adjustReason);
      setAdjustingProduct(null);
      onRefresh();
    } catch (err: any) {
      setAdjustError(err.response?.data?.error || err.message || 'Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>Product & Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track stock levels, minimum reorder alerts, warehouse locations & stock audit logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Inventory
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Stock Audit Logs</span>
            </button>
          </div>

          {canManageWarehouse && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search name, SKU, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 text-xs text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Product Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                lowStockOnly
                  ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Filter Low Stock Only</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Product details</th>
                    <th className="p-4">SKU / Category</th>
                    <th className="p-4">Unit Price</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Warehouse Location</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No inventory products match criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLowStock = p.currentStock <= p.minStockAlert;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                  {p.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                                {isLowStock && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-extrabold mt-0.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Min Alert ({p.minStockAlert})</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-mono text-slate-800 font-semibold">{p.sku}</div>
                            <div className="text-[11px] text-slate-500">{p.category}</div>
                          </td>
                          <td className="p-4 font-bold text-slate-900">
                            ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4">
                            <span
                              className={`font-bold text-sm ${
                                isLowStock ? 'text-amber-700 font-extrabold' : 'text-emerald-600'
                              }`}
                            >
                              {p.currentStock} units
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-slate-700 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{p.location}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canManageWarehouse && (
                                <>
                                  <button
                                    onClick={() => setAdjustingProduct(p)}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                  >
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span>Adjust Stock</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenEdit(p)}
                                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock Audit Log Table */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Movement Type</th>
                  <th className="p-4">Qty Changed</th>
                  <th className="p-4">Reason / Reference</th>
                  <th className="p-4">Logged By</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stockLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No stock movement logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div>{log.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.sku}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            log.movementType === 'IN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          Stock {log.movementType}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold">
                        <span className={log.movementType === 'IN' ? 'text-emerald-600' : 'text-rose-600'}>
                          {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">{log.reason}</td>
                      <td className="p-4 font-medium text-slate-600">{log.createdByName}</td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product Item' : 'Add New Inventory Product'}
              </h3>
              <button onClick={() => setOpenAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Industrial Bolt Set M8"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="PRD-BLT-M8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={productForm.unitPrice}
                    onChange={(e) => setProductForm({ ...productForm, unitPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {!editingProduct && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Initial Opening Stock</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.currentStock}
                      onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value, 10) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Min Stock Alert Qty</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.minStockAlert}
                      onChange={(e) => setProductForm({ ...productForm, minStockAlert: parseInt(e.target.value, 10) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Warehouse Location *</label>
                <input
                  type="text"
                  required
                  value={productForm.location}
                  onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Warehouse A - Bay 3 - Rack B"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Manual Inventory Movement
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{adjustingProduct.name}</h3>
                <p className="text-xs text-slate-500">Current Stock: {adjustingProduct.currentStock} units</p>
              </div>
              <button onClick={() => setAdjustingProduct(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Movement Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as 'IN' | 'OUT')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IN">Stock IN (+)</option>
                    <option value="OUT">Stock OUT (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason / Reference *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Purchase order arrival PO-4002"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Confirm Movement Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
