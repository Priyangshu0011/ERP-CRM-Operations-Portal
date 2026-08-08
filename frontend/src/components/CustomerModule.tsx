import React, { useState } from 'react';
import { Customer, CustomerStatus, CustomerType } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Eye,
  Calendar,
  Phone,
  Mail,
  Building,
  FileText,
  Clock,
  Send,
  X,
  CheckCircle2,
  UserCheck,
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
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Selected customer for Drawer Detail View
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Edit Modal State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    type: 'Wholesale',
    address: '',
    status: 'Lead',
    followUpDate: '',
    notes: '',
  });

  // Follow up composer state inside drawer
  const [newNote, setNewNote] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [newStatus, setNewStatus] = useState<CustomerStatus>('Lead');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      type: 'Wholesale',
      address: '',
      status: 'Lead',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: '',
    });
    setOpenAddModal(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email,
      businessName: cust.businessName,
      gstNumber: cust.gstNumber || '',
      type: cust.type,
      address: cust.address,
      status: cust.status,
      followUpDate: cust.followUpDate ? new Date(cust.followUpDate).toISOString().slice(0, 10) : '',
      notes: cust.notes || '',
    });
    setOpenAddModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      await onUpdateCustomer(editingCustomer.id, formData);
    } else {
      await onAddCustomer(formData);
    }
    setOpenAddModal(false);
    onRefresh();
  };

  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      await onAddFollowUpNote(selectedCustomer.id, newNote, newFollowUpDate || undefined, newStatus);
      setNewNote('');
      onRefresh();
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Customer CRM Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage wholesale leads, active accounts, contact logs & follow-up schedules.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, company, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Statuses (Lead, Active, Inactive)</option>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 text-xs text-slate-300 px-3 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Customer Types</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Customer / Business</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Next Follow-Up</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{c.name}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-blue-400" />
                        <span>{c.businessName}</span>
                        {c.gstNumber && (
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                            GST: {c.gstNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{c.email}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{c.mobile}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {c.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                          c.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : c.status === 'Lead'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {c.followUpDate ? (
                        <div className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>{new Date(c.followUpDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="View Customer Detail Drawer & Follow-ups"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Customer Details"
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

      {/* Add / Edit Customer Modal */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer Account'}
              </h3>
              <button onClick={() => setOpenAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Rajesh Sharma"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Apex Industrial Solutions"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="rajesh@apex.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Customer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Wholesale">Wholesale</option>
                    <option value="Retail">Retail</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstNumber || ''}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="27AAACA123411Z5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Business Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Plot 42, MIDC Industrial Area..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate || ''}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Initial Notes</label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="Key account details..."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail & Follow-up Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 max-w-xl w-full h-full flex flex-col p-6 space-y-6 overflow-y-auto shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Customer Profile & CRM
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedCustomer.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>{selectedCustomer.businessName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Email & Phone</span>
                <div className="font-semibold text-slate-200 mt-1">{selectedCustomer.email}</div>
                <div className="text-slate-400 mt-0.5">{selectedCustomer.mobile}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Type & GST</span>
                <div className="font-semibold text-slate-200 mt-1">{selectedCustomer.type}</div>
                <div className="text-slate-400 mt-0.5">{selectedCustomer.gstNumber || 'No GST Provided'}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Address</span>
              <p className="text-slate-300 mt-1">{selectedCustomer.address}</p>
            </div>

            {/* Follow-up Notes Timeline */}
            <div className="space-y-4 flex-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Follow-Up Notes & Activity Log</span>
              </h3>

              {/* Note Composer */}
              <form onSubmit={handleSubmitFollowUp} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <textarea
                  rows={2}
                  required
                  placeholder="Record follow-up notes (call details, quote sent, payment discussion)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as CustomerStatus)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Next Follow-Up Date</label>
                    <input
                      type="date"
                      value={newFollowUpDate}
                      onChange={(e) => setNewFollowUpDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Saving...' : 'Add Note'}</span>
                  </button>
                </div>
              </form>

              {/* Timeline Items */}
              <div className="space-y-3 pt-2">
                {(!selectedCustomer.followUpNotes || selectedCustomer.followUpNotes.length === 0) ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No follow-up notes logged yet.</p>
                ) : (
                  selectedCustomer.followUpNotes.map((n) => (
                    <div key={n.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-400">{n.authorName}</span>
                        <span className="text-slate-500">
                          {new Date(n.createdAt).toLocaleDateString('en-IN')} at{' '}
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{n.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
