import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Package, 
  Receipt, 
  ShoppingCart, 
  Percent, 
  TrendingUp, 
  DollarSign,
  PlusCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onQuickInvoice }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales-invoices', label: 'Sales Invoices', icon: Receipt },
    { id: 'purchase-invoices', label: 'Purchase Invoices', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'items', label: 'Inventory Items', icon: Package },
    { id: 'taxes', label: 'Tax Rates', icon: Percent },
    { id: 'profit-loss', label: 'Profit & Loss Report', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen select-none">
      <div>
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              Finora
            </h1>
            <p className="text-xs text-slate-400 font-medium">Accounting & Ledger</p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <button
            onClick={onQuickInvoice}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Sales Invoice</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ledger Engine Active</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-600">v1.0.0 • SQLite & FastAPI</p>
      </div>
    </aside>
  );
}
