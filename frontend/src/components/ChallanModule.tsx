import React, { useState } from 'react';
import { Customer, Product, SalesChallan } from '../types';
import {
  FileText,
  Search,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChallanModuleProps {
  challans: SalesChallan[];
  customers: Customer[];
  products: Product[];
  onCreateChallan: (data: {
    customerId: string;
    status: 'Draft' | 'Confirmed';
    items: { productId: string; quantity: number }[];
  }) => Promise<void>;
  onUpdateChallanStatus: (id: string, status: 'Confirmed' | 'Cancelled') => Promise<void>;
  onRefresh: () => void;
  openCreateModal: boolean;
  setOpenCreateModal: (open: boolean) => void;
}

export const ChallanModule: React.FC<ChallanModuleProps> = ({
  challans,
  customers,
  products,
  onCreateChallan,
  onUpdateChallanStatus,
  onRefresh,
  openCreateModal,
  setOpenCreateModal,
}) => {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [previewChallan, setPreviewChallan] = useState<SalesChallan | null>(null);

  // Form State for Creating Challan
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [lineItems, setLineItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: '', quantity: 1 },
  ]);
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredChallans = challans.filter((c) => {
    const matchesSearch =
      c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.createdByName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...lineItems];
    if (field === 'productId') {
      updated[index].productId = value;
    } else {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    }
    setLineItems(updated);
  };

  const handleSubmitChallan = async (status: 'Draft' | 'Confirmed') => {
    setFormError('');
    if (!selectedCustomerId) {
      setFormError('Please select a customer.');
      return;
    }

    const validItems = lineItems.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setFormError('Please add at least one valid product line item.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateChallan({
        customerId: selectedCustomerId,
        status,
        items: validItems,
      });
      setOpenCreateModal(false);
      setSelectedCustomerId('');
      setLineItems([{ productId: '', quantity: 1 }]);
      onRefresh();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save challan';
      setFormError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, targetStatus: 'Confirmed' | 'Cancelled') => {
    try {
      await onUpdateChallanStatus(id, targetStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to update status');
    }
  };

  const formProductMap = new Map(products.map((p) => [p.id, p]));
  const formGrandTotal = lineItems.reduce((sum, item) => {
    const prod = formProductMap.get(item.productId);
    return sum + (prod ? prod.unitPrice * item.quantity : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Sales Challan & Invoice Flow</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create sales orders, confirm challans with automatic stock reduction & product snapshot retention.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setFormError('');
              if (customers.length > 0) setSelectedCustomerId(customers[0].id);
              if (products.length > 0) setLineItems([{ productId: products[0].id, quantity: 1 }]);
              setOpenCreateModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Challan</span>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Challan #, Customer Name, Author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 text-xs text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
        >
          <option value="ALL">All Statuses (Draft, Confirmed, Cancelled)</option>
          <option value="Draft">Draft Orders</option>
          <option value="Confirmed">Confirmed Orders</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Challan Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Challan Number</th>
                <th className="p-4">Customer Account</th>
                <th className="p-4">Total Qty & Line Items</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No sales challans recorded.
                  </td>
                </tr>
              ) : (
                filteredChallans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold font-mono text-indigo-600">{c.challanNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{c.customerName}</div>
                      <div className="text-[11px] text-slate-500">By {c.createdByName}</div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {c.totalQuantity} items ({c.items?.length || 0} line items)
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      ₹{c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                          c.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'Draft'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'Draft' && canCreate && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'Confirmed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Order</span>
                          </button>
                        )}
                        <button
                          onClick={() => setPreviewChallan(c)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200/60"
                          title="View / Print Tax Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sales Challan Interactive Builder Modal */}
      {openCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Sales Order Generator
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Create New Sales Challan</h3>
              </div>
              <button onClick={() => setOpenCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Execution Blocked: </span>
                  <span>{formError}</span>
                </div>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Customer Account *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((cust) => (
                    <option key={cust.id} value={cust.id}>
                      {cust.businessName} ({cust.name}) - {cust.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] uppercase">
                  <span>Product Line Items</span>
                  <span>Live Stock & Subtotal</span>
                </div>

                {lineItems.map((item, idx) => {
                  const prod = formProductMap.get(item.productId);
                  const subtotal = prod ? prod.unitPrice * item.quantity : 0;

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3"
                    >
                      <div className="flex-1 w-full">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku}) — ₹{p.unitPrice} | Stock: {p.currentStock}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-center text-slate-900 text-xs font-semibold"
                          />
                        </div>

                        <div className="w-28 text-right font-bold text-slate-900">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </div>

                        <button
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-indigo-600 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product Line Item</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">Total Challan Amount</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  ₹{formGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitChallan('Draft')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold rounded-xl"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitChallan('Confirmed')}
                    className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Deduct Stock</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice / Sales Challan Preview Modal */}
      {previewChallan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Sales Challan & Tax Invoice</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Download PDF</span>
                </button>
                <button onClick={() => setPreviewChallan(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printable-challan" className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-indigo-600">NEXUSERP WHOLESALE DISTRIBUTORS</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">MIDC Industrial Complex, Block B-42, Pune, MH</p>
                  <p className="text-[11px] text-slate-500">GSTIN: 27AAACN998811Z2 | Phone: +91 20 4000 8800</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold font-mono text-slate-900">{previewChallan.challanNumber}</div>
                  <div className="mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        previewChallan.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {previewChallan.status} Challan
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Date: {new Date(previewChallan.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Billed To (Customer):</span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{previewChallan.customerName}</div>
                  <div className="text-slate-600 mt-0.5">{previewChallan.customer?.address}</div>
                  <div className="text-slate-500 mt-1">Phone: {previewChallan.customer?.mobile}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Issued By:</span>
                  <div className="font-bold text-slate-800 mt-1">{previewChallan.createdByName}</div>
                  <div className="text-slate-500 mt-0.5">Department: Wholesale Sales Team</div>
                  {previewChallan.confirmedAt && (
                    <div className="text-emerald-600 font-semibold mt-2 text-[11px]">
                      Confirmed: {new Date(previewChallan.confirmedAt).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <th className="p-3">#</th>
                      <th className="p-3">Product Description (Snapshot)</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {previewChallan.items?.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="p-3 text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">
                          <div>{item.productNameSnapshot}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.skuSnapshot}</div>
                        </td>
                        <td className="p-3 text-right text-slate-700">
                          ₹{item.unitPriceSnapshot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center font-extrabold text-slate-900">{item.quantity}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Quantity:</span>
                    <span className="font-bold text-slate-900">{previewChallan.totalQuantity} items</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold border-t border-slate-200 pt-2 text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-emerald-600">
                      ₹{previewChallan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
