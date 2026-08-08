import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CustomerModule } from './components/CustomerModule';
import { InventoryModule } from './components/InventoryModule';
import { ChallanModule } from './components/ChallanModule';
import { LoginModal } from './components/LoginModal';

import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  addFollowUpNoteApi,
  getProductsApi,
  createProductApi,
  updateProductApi,
  adjustStockApi,
  getStockLogsApi,
  getChallansApi,
  createChallanApi,
  updateChallanStatusApi,
} from './services/api';
import { Customer, Product, SalesChallan, StockLog } from './types';

export const AppContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

  // Modal open states triggered from anywhere
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openChallanModal, setOpenChallanModal] = useState(false);

  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    try {
      const [custRes, prodRes, challanRes, logRes] = await Promise.all([
        getCustomersApi(),
        getProductsApi(),
        getChallansApi(),
        getStockLogsApi(),
      ]);

      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setChallans(challanRes.data);
      setStockLogs(logRes.data);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-semibold text-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing NexusERP System...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  // Count low stock items & draft challans
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;
  const pendingChallanCount = challans.filter((c) => c.status === 'Draft').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
          pendingChallanCount={pendingChallanCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              customers={customers}
              products={products}
              challans={challans}
              stockLogs={stockLogs}
              setActiveTab={setActiveTab}
              onOpenNewCustomer={() => {
                setActiveTab('customers');
                setOpenCustomerModal(true);
              }}
              onOpenNewChallan={() => {
                setActiveTab('challans');
                setOpenChallanModal(true);
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerModule
              customers={customers}
              onAddCustomer={async (data) => {
                await createCustomerApi(data);
                fetchAllData();
              }}
              onUpdateCustomer={async (id, data) => {
                await updateCustomerApi(id, data);
                fetchAllData();
              }}
              onAddFollowUpNote={async (id, note, followUpDate, newStatus) => {
                await addFollowUpNoteApi(id, note, followUpDate, newStatus);
                fetchAllData();
              }}
              onRefresh={fetchAllData}
              openAddModal={openCustomerModal}
              setOpenAddModal={setOpenCustomerModal}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryModule
              products={products}
              stockLogs={stockLogs}
              onAddProduct={async (data) => {
                await createProductApi(data);
                fetchAllData();
              }}
              onUpdateProduct={async (id, data) => {
                await updateProductApi(id, data);
                fetchAllData();
              }}
              onAdjustStock={async (id, qty, type, reason) => {
                await adjustStockApi(id, qty, type, reason);
                fetchAllData();
              }}
              onRefresh={fetchAllData}
              openAddModal={openProductModal}
              setOpenAddModal={setOpenProductModal}
            />
          )}

          {activeTab === 'challans' && (
            <ChallanModule
              challans={challans}
              customers={customers}
              products={products}
              onCreateChallan={async (data) => {
                await createChallanApi(data);
                fetchAllData();
              }}
              onUpdateChallanStatus={async (id, status) => {
                await updateChallanStatusApi(id, status);
                fetchAllData();
              }}
              onRefresh={fetchAllData}
              openCreateModal={openChallanModal}
              setOpenCreateModal={setOpenChallanModal}
            />
          )}
        </main>
      </div>
    </div>
  );
};
