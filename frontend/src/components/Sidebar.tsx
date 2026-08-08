import React from 'react';
import { LayoutDashboard, Users, Package, FileText, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type TabType = 'dashboard' | 'customers' | 'inventory' | 'challans';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lowStockCount: number;
  pendingChallanCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  pendingChallanCount,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'ADMIN';

  // Role-based visibility map
  const isTabAllowed = (tab: TabType): boolean => {
    if (role === 'ADMIN') return true;
    if (role === 'SALES') return tab === 'dashboard' || tab === 'customers' || tab === 'challans';
    if (role === 'WAREHOUSE') return tab === 'dashboard' || tab === 'inventory';
    if (role === 'ACCOUNTS') return tab === 'dashboard' || tab === 'challans';
    return false;
  };

  const allMenuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'customers' as TabType,
      label: 'Customer CRM',
      icon: Users,
    },
    {
      id: 'inventory' as TabType,
      label: 'Products & Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'challans' as TabType,
      label: 'Sales Challans',
      icon: FileText,
      badge: pendingChallanCount > 0 ? `${pendingChallanCount} Draft` : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
  ];

  const visibleMenuItems = allMenuItems.filter((item) => isTabAllowed(item.id));

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-6 flex-shrink-0">
      <div className="space-y-1">
        <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Role Navigation</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
            {role}
          </span>
        </div>

        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>RBAC Privilege Scope</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {role === 'ADMIN' && 'Full system administrator privileges across CRM, Stock Inventory & Sales Invoices.'}
          {role === 'SALES' && 'Managing Customer accounts, CRM follow-ups, & creating/confirming Sales Orders.'}
          {role === 'WAREHOUSE' && 'Managing Inventory catalog, warehouse locations, & Stock IN/OUT audit adjustments.'}
          {role === 'ACCOUNTS' && 'Auditing financial Sales Challans, Customer Billing, & Tax Invoice records.'}
        </p>
      </div>
    </aside>
  );
};
