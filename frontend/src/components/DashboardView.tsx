import React from 'react';
import { Customer, Product, SalesChallan, StockLog } from '../types';
import {
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  FileCheck2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
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
  // Aggregate Metrics
  const totalRevenue = challans
    .filter((c) => c.status === 'Confirmed')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const activeCustomers = customers.filter((c) => c.status === 'Active').length;
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockAlert);
  const pendingChallans = challans.filter((c) => c.status === 'Draft');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-indigo-100 border border-white/20">
            Enterprise Management Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Wholesale Operations & CRM Overview
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Monitor real-time inventory levels, manage customer CRM follow-ups, and process sales challans with atomic stock validation.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-start sm:self-auto">
          <button
            onClick={onOpenNewChallan}
            className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>New Sales Order</span>
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="px-4 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Confirmed Sales Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>From confirmed sales challans</span>
            </div>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active CRM Accounts</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{activeCustomers} Accounts</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Out of {customers.length} total customer accounts
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Low Stock Reorders</span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                lowStockProducts.length > 0
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {lowStockProducts.length} Items
            </div>
            <div
              className={`text-[11px] font-semibold mt-1 ${
                lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-500'
              }`}
            >
              {lowStockProducts.length > 0 ? 'Requires stock deposit' : 'All stock levels healthy'}
            </div>
          </div>
        </div>

        {/* Pending Draft Challans */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Draft Challans</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {pendingChallans.length} Drafts
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Awaiting stock confirmation</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Low Stock Alert Banner & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Items Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-sm">Low Stock Inventory Warnings</h2>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Inventory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              All product stock levels are above minimum reorder thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                      {prod.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{prod.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        SKU: {prod.sku} | Location: {prod.location}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-extrabold text-amber-700">
                      {prod.currentStock} units remaining
                    </div>
                    <div className="text-[10px] text-amber-600 font-medium">
                      Min Alert: {prod.minStockAlert} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Stock Log Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Recent Stock Activity</h2>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              All Logs
            </button>
          </div>

          <div className="space-y-3">
            {stockLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate">{log.productName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.movementType === 'IN'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {log.movementType === 'IN' ? `+${log.quantityChanged}` : `${log.quantityChanged}`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{log.reason}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>By {log.createdByName}</span>
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
