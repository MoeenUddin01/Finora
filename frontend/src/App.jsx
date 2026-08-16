import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import ItemsPage from './pages/ItemsPage';
import TaxesPage from './pages/TaxesPage';
import ProfitLossPage from './pages/ProfitLossPage';
import InvoiceBuilderModal from './components/InvoiceBuilderModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalInvoiceOpen, setGlobalInvoiceOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabTitles = {
    dashboard: 'Dashboard Overview',
    'sales-invoices': 'Sales Invoices',
    'purchase-invoices': 'Purchase Invoices',
    customers: 'Customers',
    suppliers: 'Suppliers',
    items: 'Inventory Items',
    taxes: 'Tax Rates',
    'profit-loss': 'Profit & Loss Statement',
  };

  const handleQuickInvoice = () => {
    setGlobalInvoiceOpen(true);
  };

  const handleInvoiceSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage key={refreshKey} setActiveTab={setActiveTab} onQuickInvoice={handleQuickInvoice} />;
      case 'sales-invoices':
        return <InvoicesPage key={`sales-${refreshKey}`} type="SALES" />;
      case 'purchase-invoices':
        return <InvoicesPage key={`purchase-${refreshKey}`} type="PURCHASE" />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'items':
        return <ItemsPage />;
      case 'taxes':
        return <TaxesPage />;
      case 'profit-loss':
        return <ProfitLossPage key={refreshKey} />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} onQuickInvoice={handleQuickInvoice} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickInvoice={handleQuickInvoice}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTabTitle={tabTitles[activeTab]} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Quick Sales Invoice Builder Modal */}
      <InvoiceBuilderModal
        isOpen={globalInvoiceOpen}
        onClose={() => setGlobalInvoiceOpen(false)}
        invoiceType="SALES"
        onSuccess={handleInvoiceSuccess}
      />
    </div>
  );
}
