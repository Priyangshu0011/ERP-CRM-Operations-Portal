import React, { useState } from 'react';
import { useAuth, ROLE_PRESETS } from '../context/AuthContext';
import { Role } from '../types';
import { Shield, KeyRound, Mail, Layers, CheckCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login, quickSwitchRole } = useAuth();
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">NexusERP Portal</h2>
          <p className="text-xs text-slate-400">Wholesale Distribution & CRM Operations System</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="admin@erp.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Role Tester Presets */}
        <div className="border-t border-slate-800 pt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Layers className="w-4 h-4" />
              <span>One-Click Test Logins</span>
            </span>
            <span className="text-[10px] text-slate-500">Password: password123</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => quickSwitchRole(r)}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all text-xs group"
              >
                <div className="font-bold text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                  <span>{r}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                </div>
                <div className="text-[10px] text-slate-500 truncate">{ROLE_PRESETS[r].email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
