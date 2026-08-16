import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import ItemsPage from './pages/ItemsPage';
import TaxesPage from './pages/TaxesPage';
import { Clock, Rocket, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('customers');

  const tabTitles = {
    dashboard: 'Dashboard',
    'sales-invoices': 'Sales Invoices',
    'purchase-invoices': 'Purchase Invoices',
    customers: 'Customers',
    suppliers: 'Suppliers',
    items: 'Inventory Items',
    taxes: 'Tax Rates',
    'profit-loss': 'Profit & Loss Report',
  };

  const handleQuickInvoice = () => {
    setActiveTab('sales-invoices');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'items':
        return <ItemsPage />;
      case 'taxes':
        return <TaxesPage />;
      default:
        return (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto my-12">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {tabTitles[activeTab] || 'Feature'} - Coming in Phase 5
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Invoice builders, automatic live calculations, PDF preview modal, and Profit & Loss Analytics dashboard with charts will be implemented in the next phase!
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => setActiveTab('customers')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                Go to Customers
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                Go to Inventory Items
              </button>
            </div>
          </div>
        );
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTabTitle={tabTitles[activeTab]} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
