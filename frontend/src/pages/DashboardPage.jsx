import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Receipt, ShoppingCart, Users, Package, TrendingUp, 
  PlusCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Eye, Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { reportApi, invoiceApi, customerApi, itemApi } from '../services/api';
import InvoiceViewModal from '../components/InvoiceViewModal';

export default function DashboardPage({ setActiveTab, onQuickInvoice }) {
  const [report, setReport] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedViewInvoice, setSelectedViewInvoice] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [pnlData, invoicesData, customersData, itemsData] = await Promise.all([
        reportApi.getProfitLoss(),
        invoiceApi.getAll(),
        customerApi.getAll(),
        itemApi.getAll(),
      ]);
      setReport(pnlData);
      setRecentInvoices(invoicesData.slice(0, 5));
      setCustomerCount(customersData.length);
      setItemCount(itemsData.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const chartTrend = report ? [
    { name: 'Start', revenue: 0, expense: 0, profit: 0 },
    { name: 'Purchases', revenue: 0, expense: report.total_purchase_expense, profit: -report.total_purchase_expense },
    { name: 'Current Total', revenue: report.total_sales_revenue, expense: report.total_purchase_expense, profit: report.net_profit },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Finora Accounting Core v1.0
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Financial Executive Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Real-time double-entry ledger oversight, active invoice pipeline, and profit analytics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onQuickInvoice}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Sales Invoice</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-xs border border-slate-700 transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Manage Customers</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-base font-medium">Loading executive dashboard...</p>
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Sales Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-2">
                ${report?.total_sales_revenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-indigo-400 mt-1 cursor-pointer" onClick={() => setActiveTab('sales-invoices')}>
                View Sales Invoices &rarr;
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Purchase Expenses
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-2">
                ${report?.total_purchase_expense?.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-purple-400 mt-1 cursor-pointer" onClick={() => setActiveTab('purchase-invoices')}>
                View Purchase Invoices &rarr;
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Net Ledger Profit
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-extrabold font-mono mt-2 ${
                (report?.net_profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                ${report?.net_profit?.toFixed(2) || '0.00'}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 cursor-pointer" onClick={() => setActiveTab('profit-loss')}>
                Open P&L Report &rarr;
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Master Records
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-2">
                {customerCount} Customers / {itemCount} Items
              </div>
              <p className="text-[11px] text-amber-400 mt-1 cursor-pointer" onClick={() => setActiveTab('items')}>
                Catalog & Stock &rarr;
              </p>
            </div>
          </div>

          {/* Chart & Recent Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Recharts Area Chart */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Financial Performance Trajectory
                </h3>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Sales Revenue" />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Net Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Invoices Feed */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-400" />
                  Recent Invoices
                </h3>
                <button
                  onClick={() => setActiveTab('sales-invoices')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View All &rarr;
                </button>
              </div>

              {recentInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No invoices created yet. Click "New Sales Invoice" above!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                    >
                      <div>
                        <span className="font-mono font-bold text-indigo-300 block">{inv.invoice_number}</span>
                        <span className="text-slate-400">
                          {inv.invoice_type === 'SALES' ? inv.customer?.name : inv.supplier?.name}
                        </span>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <span className="font-mono font-bold text-white block">${Number(inv.grand_total).toFixed(2)}</span>
                          <span className={`text-[10px] font-semibold ${
                            inv.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>{inv.status}</span>
                        </div>
                        <button
                          onClick={() => setSelectedViewInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Invoice View Modal */}
      <InvoiceViewModal
        isOpen={Boolean(selectedViewInvoice)}
        onClose={() => setSelectedViewInvoice(null)}
        invoice={selectedViewInvoice}
      />
    </div>
  );
}
