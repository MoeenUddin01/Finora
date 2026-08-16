import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, AlertCircle, 
  PieChart as PieIcon, BarChart3, Receipt, ShoppingCart, Percent, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell 
} from 'recharts';
import { reportApi } from '../services/api';

export default function ProfitLossPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getProfitLoss(
        startDate || null,
        endDate || null
      );
      setReport(data);
    } catch (err) {
      console.error(err);
      setError('Failed to calculate Profit & Loss report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    loadReport();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    reportApi.getProfitLoss(null, null).then((d) => setReport(d));
  };

  // Prepare Recharts dataset
  const chartData = report ? [
    {
      name: 'Sales Revenue',
      amount: report.total_sales_revenue,
      fill: '#6366f1', // Indigo
    },
    {
      name: 'Purchase Expense',
      amount: report.total_purchase_expense,
      fill: '#a855f7', // Purple
    },
    {
      name: 'Net Profit',
      amount: report.net_profit,
      fill: report.net_profit >= 0 ? '#10b981' : '#ef4444', // Emerald or Red
    },
  ] : [];

  const profitMarginPercent = report?.total_sales_revenue > 0
    ? ((report.net_profit / report.total_sales_revenue) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Profit & Loss Financial Report
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time financial statement based on double-entry ledger postings.
          </p>
        </div>

        {/* Date Filter Controls */}
        <form onSubmit={handleApplyFilter} className="flex flex-wrap items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>From:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <span className="text-xs text-slate-500">to</span>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Apply
          </button>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-base font-medium">Calculating ledger statement...</p>
        </div>
      ) : report ? (
        <>
          {/* Executive Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Sales Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-2">
                ${report.total_sales_revenue.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">From active Sales Invoices</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Purchase Expense
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-2">
                ${report.total_purchase_expense.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">From active Purchase Bills</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Net Profit / (Loss)
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  report.net_profit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {report.net_profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
              </div>
              <div className={`text-2xl font-extrabold font-mono mt-2 ${
                report.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                ${report.net_profit.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Net Margin: {profitMarginPercent}%</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Net Tax Liability
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-300 mt-2">
                ${(report.total_tax_collected - report.total_tax_paid).toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Collected: ${report.total_tax_collected.toFixed(2)} | Paid: ${report.total_tax_paid.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Chart & Accounts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Recharts Bar Chart */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Financial Summary Visualization
                </h3>
                <span className="text-xs text-slate-500">Live Double-Entry Sync</span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Account Breakdown Tables */}
            <div className="lg:col-span-5 space-y-4">
              {/* Revenue Accounts */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Revenue Accounts</span>
                  <span className="text-indigo-400 font-mono">${report.total_sales_revenue.toFixed(2)}</span>
                </h4>
                <div className="space-y-2">
                  {report.revenue_accounts.map((acc, i) => (
                    <div key={i} className="flex justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-300">
                        <span className="font-mono text-indigo-400 mr-2">[{acc.code}]</span>
                        {acc.name}
                      </span>
                      <span className="font-mono font-semibold text-white">${acc.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Accounts */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Expense Accounts</span>
                  <span className="text-purple-400 font-mono">${report.total_purchase_expense.toFixed(2)}</span>
                </h4>
                <div className="space-y-2">
                  {report.expense_accounts.map((acc, i) => (
                    <div key={i} className="flex justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                      <span className="text-slate-300">
                        <span className="font-mono text-purple-400 mr-2">[{acc.code}]</span>
                        {acc.name}
                      </span>
                      <span className="font-mono font-semibold text-white">${acc.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
