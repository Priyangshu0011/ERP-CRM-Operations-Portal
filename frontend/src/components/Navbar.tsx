import React from 'react';
import { useAuth, ROLE_PRESETS } from '../context/AuthContext';
import { Role } from '../types';
import { Shield, UserCheck, LogOut, Layers, AlertCircle } from 'lucide-react';

const roleBadgeColors: Record<Role, string> = {
  ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SALES: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  WAREHOUSE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ACCOUNTS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const Navbar: React.FC = () => {
  const { user, quickSwitchRole, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      {/* Quick Evaluator Role Switcher Banner */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-300">Quick Role Evaluator:</span>
          <span className="hidden sm:inline text-slate-400">Switch user roles instantly to evaluate RBAC permissions</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[]).map((r) => {
            const isCurrent = user?.role === r;
            return (
              <button
                key={r}
                onClick={() => quickSwitchRole(r)}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all flex items-center gap-1 border ${
                  isCurrent
                    ? `${roleBadgeColors[r]} ring-2 ring-blue-500/40 shadow-sm font-bold scale-105`
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/50'
                }`}
                title={`Switch to ${ROLE_PRESETS[r].name} (${r})`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-current animate-pulse' : 'bg-slate-500'}`} />
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                NexusERP
              </span>
              <span className="hidden md:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Wholesale Portal
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/60 px-3 py-1.5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${roleBadgeColors[user.role]}`}
                >
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
