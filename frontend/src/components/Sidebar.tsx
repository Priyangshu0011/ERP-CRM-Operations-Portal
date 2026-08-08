import React from 'react';
import { LayoutDashboard, Users, Package, FileText, Activity } from 'lucide-react';

export type TabType = 'dashboard' | 'customers' | 'inventory' | 'challans';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lowStockCount?: number;
  pendingChallanCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount = 0,
  pendingChallanCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'customers' as TabType,
      label: 'Customer CRM',
      icon: Users,
      badge: null,
    },
    {
      id: 'inventory' as TabType,
      label: 'Products & Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'challans' as TabType,
      label: 'Sales Challans',
      icon: FileText,
      badge: pendingChallanCount > 0 ? `${pendingChallanCount} Draft` : null,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800 p-4 shrink-0">
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/5 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="hidden md:block mt-8 p-4 rounded-xl bg-gradient-to-b from-slate-800/40 to-slate-950/60 border border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>System Status</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Wholesale Distribution System operational. REST APIs active with full JWT & stock lock validation.
        </p>
      </div>
    </aside>
  );
};
