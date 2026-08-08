import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/20">
            <Building2 className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">NexusERP</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Wholesale Distribution & Operations Platform
            </p>
          </div>
        </div>

        {/* User Profile & Actions */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">{user.name}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <span>{user.email}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 font-bold text-[10px] uppercase text-indigo-600">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                title="Sign Out of Portal"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
