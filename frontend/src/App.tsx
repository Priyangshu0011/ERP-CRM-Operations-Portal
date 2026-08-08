import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CustomerModule } from './components/CustomerModule';
import { InventoryModule } from './components/InventoryModule';
import { ChallanModule } from './components/ChallanModule';
import { LoginPage } from './components/LoginPage';
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
import { RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Core Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string>('');

  // Modal Control Triggers
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [openChallanModal, setOpenChallanModal] = useState(false);

  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    setIsDataLoading(true);
    setDataError('');

    try {
      const [custRes, prodRes, chalRes, logsRes] = await Promise.all([
        getCustomersApi(),
        getProductsApi(),
        getChallansApi(),
        getStockLogsApi(),
      ]);

      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
      setChallans(chalRes.data || []);
      setStockLogs(logsRes.data || []);
    } catch (err: any) {
      console.error('Data Fetching Failed:', err);
      setDataError(err.response?.data?.error || err.message || 'Failed to sync live operations data');
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Initializing NexusERP System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;
  const pendingChallanCount = challans.filter((c) => c.status === 'Draft').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
          pendingChallanCount={pendingChallanCount}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 space-y-4 overflow-hidden">
          {dataError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center justify-between font-medium">
              <span>{dataError}</span>
              <button
                onClick={fetchAllData}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

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
              }}
              onUpdateCustomer={async (id, data) => {
                await updateCustomerApi(id, data);
              }}
              onAddFollowUpNote={async (id, note, followUpDate, newStatus) => {
                await addFollowUpNoteApi(id, note, followUpDate, newStatus);
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
              }}
              onUpdateProduct={async (id, data) => {
                await updateProductApi(id, data);
              }}
              onAdjustStock={async (id, quantityChanged, movementType, reason) => {
                await adjustStockApi(id, quantityChanged, movementType, reason);
              }}
              onRefresh={fetchAllData}
              openAddModal={openInventoryModal}
              setOpenAddModal={setOpenInventoryModal}
            />
          )}

          {activeTab === 'challans' && (
            <ChallanModule
              challans={challans}
              customers={customers}
              products={products}
              onCreateChallan={async (data) => {
                await createChallanApi(data);
              }}
              onUpdateChallanStatus={async (id, status) => {
                await updateChallanStatusApi(id, status);
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
