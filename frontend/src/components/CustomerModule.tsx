import React, { useState } from 'react';
import { Customer, CustomerStatus, CustomerType } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  FileText,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CustomerModuleProps {
  customers: Customer[];
  onAddCustomer: (data: Partial<Customer>) => Promise<void>;
  onUpdateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  onAddFollowUpNote: (id: string, note: string, followUpDate?: string, newStatus?: string) => Promise<void>;
  onRefresh: () => void;
  openAddModal: boolean;
  setOpenAddModal: (open: boolean) => void;
}

export const CustomerModule: React.FC<CustomerModuleProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onAddFollowUpNote,
  onRefresh,
  openAddModal,
  setOpenAddModal,
}) => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Follow up form state
  const [newNote, setNewNote] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  // Form State
  const [formState, setFormState] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    type: 'Wholesale',
    address: '',
    status: 'Lead',
    notes: '',
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.gstNumber && c.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormState({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      type: 'Wholesale',
      address: '',
      status: 'Lead',
      notes: '',
    });
    setOpenAddModal(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormState({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email || '',
      businessName: cust.businessName,
      gstNumber: cust.gstNumber || '',
      type: cust.type,
      address: cust.address,
      status: cust.status,
      notes: cust.notes || '',
    });
    setOpenAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      await onUpdateCustomer(editingCustomer.id, formState);
    } else {
      await onAddCustomer(formState);
    }
    setOpenAddModal(false);
    onRefresh();
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    await onAddFollowUpNote(selectedCustomer.id, newNote, nextDate || undefined, updateStatus || undefined);
    setNewNote('');
    setNextDate('');
    setUpdateStatus('');

    const updated = customers.find((c) => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Customer CRM Accounts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage wholesale clients, lead status pipelines, contact profiles & follow-up notes.
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search business name, contact, mobile, GST..."
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
          <option value="ALL">All Status Pipeline (Active, Lead, Inactive)</option>
          <option value="Active">Active Accounts</option>
          <option value="Lead">Sales Leads</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Business & Contact</th>
                <th className="p-4">Customer Type</th>
                <th className="p-4">GST Number</th>
                <th className="p-4">Status</th>
                <th className="p-4">Next Follow-Up</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No customer accounts match criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{cust.businessName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                        <span>{cust.name}</span>
                        <span>•</span>
                        <span>{cust.mobile}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{cust.type}</td>
                    <td className="p-4 font-mono text-slate-600">{cust.gstNumber || '—'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                          cust.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cust.status === 'Lead'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {cust.followUpDate ? (
                        <span className="font-semibold text-slate-800">
                          {new Date(cust.followUpDate).toLocaleDateString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not Scheduled</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <span>Timeline Drawer</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Follow-up Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto space-y-6 shadow-2xl border-l border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedCustomer.type} Account
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedCustomer.businessName}</h2>
                <p className="text-xs text-slate-500">{selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-slate-900">{selectedCustomer.mobile}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-bold text-slate-900">{selectedCustomer.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">GST Identification:</span>
                <span className="font-mono font-bold text-slate-800">{selectedCustomer.gstNumber || 'N/A'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                <span className="text-slate-500 font-medium block mb-0.5">Billing Address:</span>
                <span>{selectedCustomer.address}</span>
              </div>
            </div>

            {/* Add Follow-Up Note Composer */}
            {canManage && (
              <form onSubmit={handleAddNoteSubmit} className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                <h3 className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Log Sales Follow-up Activity</span>
                </h3>

                <div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter call notes, quotation details, or discussion summary..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Next Follow-Up Date</label>
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Pipeline Status</label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-slate-900 text-xs"
                    >
                      <option value="">Keep {selectedCustomer.status}</option>
                      <option value="Active">Mark Active</option>
                      <option value="Lead">Mark Lead</option>
                      <option value="Inactive">Mark Inactive</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Save Activity Log
                </button>
              </form>
            )}

            {/* Activity Notes History Timeline */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Activity Log Timeline</h3>
              {selectedCustomer.followUpNotes?.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">No follow-up notes logged yet.</div>
              ) : (
                selectedCustomer.followUpNotes?.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{n.authorName}</span>
                      <span className="text-slate-400">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="text-slate-700">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCustomer ? 'Edit Customer Account' : 'Add New Customer Account'}
              </h3>
              <button onClick={() => setOpenAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.businessName || ''}
                    onChange={(e) => setFormState({ ...formState, businessName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Apex Industrial Solutions"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name || ''}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Rajesh Kumar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={formState.mobile || ''}
                    onChange={(e) => setFormState({ ...formState, mobile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formState.email || ''}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="contact@apex.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formState.gstNumber || ''}
                    onChange={(e) => setFormState({ ...formState, gstNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="27AAACA..."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer Type</label>
                  <select
                    value={formState.type || 'Wholesale'}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value as CustomerType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status</label>
                  <select
                    value={formState.status || 'Lead'}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as CustomerStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Billing & Shipping Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formState.address || ''}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  placeholder="Full street address..."
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
