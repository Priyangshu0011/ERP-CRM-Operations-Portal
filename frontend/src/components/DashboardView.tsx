import React from 'react';
import { Customer, Product, SalesChallan, StockLog } from '../types';
import { DollarSign, Users, AlertTriangle, Package, FileText, ArrowUpRight, ArrowDownRight, Clock, PlusCircle } from 'lucide-react';
import { TabType } from './Sidebar';

interface DashboardViewProps {
  customers: Customer[];
  products: Product[];
  challans: SalesChallan[];
  stockLogs: StockLog[];
  setActiveTab: (tab: TabType) => void;
  onOpenNewCustomer: () => void;
  onOpenNewChallan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  products,
  challans,
  stockLogs,
  setActiveTab,
  onOpenNewCustomer,
  onOpenNewChallan,
}) => {
  // Calculated stats
  const totalRevenue = challans
    .filter((c) => c.status === 'Confirmed')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const activeCustomers = customers.filter((c) => c.status === 'Active').length;
  const leadCustomers = customers.filter((c) => c.status === 'Lead').length;
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockAlert);
  const draftChallans = challans.filter((c) => c.status === 'Draft').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time overview of Wholesale ERP, Customer Leads, Stock Levels & Sales Orders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewCustomer}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
          <button
            onClick={onOpenNewChallan}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>New Sales Challan</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>From confirmed sales challans</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Customers & Leads */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer CRM</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{customers.length} Accounts</div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-1 font-medium">
              <span className="text-emerald-400">{activeCustomers} Active</span>
              <span>•</span>
              <span className="text-amber-400">{leadCustomers} Leads</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Low Stock Warning */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Alerts</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{lowStockProducts.length} Low Stock</div>
            <div className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-medium">
              <span>At or below minimum threshold</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Sales Challans */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales Orders</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{challans.length} Total</div>
            <div className="text-xs text-indigo-400 flex items-center gap-2 mt-1 font-medium">
              <span>{draftChallans} Drafts Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">Inventory Alert: Low Stock Items Detected</h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {lowStockProducts.map((p) => p.name).join(', ')} require stock reordering.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all whitespace-nowrap shadow-sm"
          >
            Manage Inventory Stock
          </button>
        </div>
      )}

      {/* Main Grid: Recent Challans & Stock Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Challans Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Recent Sales Challans</span>
            </h3>
            <button
              onClick={() => setActiveTab('challans')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {challans.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span>{c.challanNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        c.status === 'Confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'Draft'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1">{c.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-100">
                    ₹{c.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{c.totalQuantity} items</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Movement Log Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Live Stock Movement Logs</span>
            </h3>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>View Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {stockLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      log.movementType === 'IN'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {log.movementType === 'IN' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{log.productName}</div>
                    <div className="text-slate-400 text-[11px]">{log.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      log.movementType === 'IN' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
