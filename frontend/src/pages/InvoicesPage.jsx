import React, { useState, useEffect } from 'react';
import { 
  Receipt, ShoppingCart, Plus, Search, Filter, RefreshCw, AlertCircle, 
  Eye, CheckCircle2, XCircle, FileText, Calendar, DollarSign, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { invoiceApi } from '../services/api';
import InvoiceBuilderModal from '../components/InvoiceBuilderModal';
import InvoiceViewModal from '../components/InvoiceViewModal';

export default function InvoicesPage({ type = 'SALES' }) {
  const isSales = type.toUpperCase() === 'SALES';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [builderOpen, setBuilderOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.getAll(type.toUpperCase());
      setInvoices(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load invoices. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [type]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await invoiceApi.updateStatus(id, newStatus);
      await loadInvoices();
    } catch (err) {
      console.error(err);
      alert('Failed to update invoice status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status?.toUpperCase() === statusFilter;
    const query = search.toLowerCase();
    const partyName = isSales ? inv.customer?.name : inv.supplier?.name;
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(query) ||
      partyName?.toLowerCase().includes(query) ||
      inv.notes?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // Calculate top metrics
  const totalVolume = invoices.reduce((acc, i) => acc + (i.status !== 'CANCELLED' ? i.grand_total : 0), 0);
  const paidCount = invoices.filter((i) => i.status === 'PAID').length;
  const draftCount = invoices.filter((i) => i.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {isSales ? (
              <Receipt className="w-6 h-6 text-indigo-400" />
            ) : (
              <ShoppingCart className="w-6 h-6 text-purple-400" />
            )}
            {isSales ? 'Sales Invoices' : 'Purchase Invoices'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isSales
              ? 'Issue customer invoices, track Accounts Receivable, and record sales revenue.'
              : 'Record vendor bills, track Accounts Payable, and log purchase expenses.'}
          </p>
        </div>

        <button
          onClick={() => setBuilderOpen(true)}
          className={`flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.98] ${
            isSales
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/20'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-600/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isSales ? 'Create Sales Invoice' : 'Create Purchase Invoice'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            {isSales ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Total Active Volume</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">${totalVolume.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Paid Invoices</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{paidCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Pending Drafts</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{draftCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, party or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'DRAFT', 'PAID', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={loadInvoices}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors ml-2"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-300">No Invoices Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'No invoices match your active filters.'
                : `Click "${isSales ? 'Create Sales Invoice' : 'Create Purchase Invoice'}" to issue your first invoice.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Invoice #</th>
                  <th className="px-6 py-3.5 font-semibold">{isSales ? 'Customer' : 'Supplier'}</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Subtotal</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Tax</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Grand Total</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => {
                  const partyName = isSales ? inv.customer?.name : inv.supplier?.name;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-300">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {partyName || <span className="text-slate-600 italic">Unknown</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-300">
                        ${Number(inv.subtotal).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-amber-400">
                        ${Number(inv.tax_total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-white">
                        ${Number(inv.grand_total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inv.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            PAID
                          </span>
                        )}
                        {inv.status === 'DRAFT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                            DRAFT
                          </span>
                        )}
                        {inv.status === 'CANCELLED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewInvoice(inv)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="View / Print Document"
                          >
                            <Eye className="w-4 h-4 text-indigo-400" />
                          </button>

                          {inv.status === 'DRAFT' && (
                            <button
                              onClick={() => handleUpdateStatus(inv.id, 'PAID')}
                              disabled={updatingId === inv.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Mark as Paid & post ledger entries"
                            >
                              {updatingId === inv.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>Pay</span>
                            </button>
                          )}

                          {inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleUpdateStatus(inv.id, 'CANCELLED')}
                              disabled={updatingId === inv.id}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                              title="Cancel Invoice"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Builder Modal */}
      <InvoiceBuilderModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        invoiceType={type}
        onSuccess={loadInvoices}
      />

      {/* Invoice View / Print Modal */}
      <InvoiceViewModal
        isOpen={Boolean(viewInvoice)}
        onClose={() => setViewInvoice(null)}
        invoice={viewInvoice}
      />
    </div>
  );
}
