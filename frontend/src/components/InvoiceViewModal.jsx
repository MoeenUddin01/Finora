import React from 'react';
import { Printer, X, DollarSign, Calendar, User, Hash, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import Modal from './Modal';

export default function InvoiceViewModal({ isOpen, onClose, invoice }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSales = invoice.invoice_type?.toUpperCase() === 'SALES';
  const party = isSales ? invoice.customer : invoice.supplier;

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> PAID
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" /> DRAFT
          </span>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice Document #${invoice.invoice_number}`}>
      <div className="space-y-6 select-text printable-area">
        {/* Top Header Bar with Print Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Finora Ledger Solutions</h2>
              <p className="text-xs text-slate-400">Automated Accounting & Invoicing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(invoice.status)}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="grid grid-cols-2 gap-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider font-bold block mb-1">
              Billed To ({isSales ? 'Customer' : 'Supplier'})
            </span>
            <p className="text-sm font-bold text-white mb-0.5">{party?.name || 'N/A'}</p>
            {party?.email && <p className="text-slate-400">{party.email}</p>}
            {party?.phone && <p className="text-slate-400">{party.phone}</p>}
            {party?.tax_number && (
              <p className="text-indigo-400 font-mono mt-1">Tax ID: {party.tax_number}</p>
            )}
            {party?.address && <p className="text-slate-400 mt-1 max-w-xs">{party.address}</p>}
          </div>

          <div className="text-right space-y-1">
            <span className="text-slate-500 uppercase tracking-wider font-bold block mb-1">
              Invoice Details
            </span>
            <p className="text-sm font-mono font-bold text-indigo-300">
              {invoice.invoice_number}
            </p>
            <p className="text-slate-400">
              <span className="text-slate-500">Type:</span> {invoice.invoice_type}
            </p>
            <p className="text-slate-400">
              <span className="text-slate-500">Issue Date:</span>{' '}
              {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-slate-400">
              <span className="text-slate-500">Due Date:</span>{' '}
              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-center">Qty</th>
                <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                <th className="px-4 py-3 font-semibold text-right">Tax %</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-white">
                    {item.item?.name || `Item #${item.item_id}`}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.description || item.item?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-400">
                    {item.tax_rate_percent}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                    ${Number(item.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="max-w-xs text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 flex-1">
            <span className="font-semibold text-slate-300 block mb-1">Notes & Terms</span>
            <p className="italic text-slate-500">{invoice.notes || 'No special terms specified.'}</p>
          </div>

          <div className="w-full sm:w-64 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-right">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="text-slate-200">${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax Total:</span>
              <span className="text-amber-400">${Number(invoice.tax_total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>Grand Total:</span>
              <span className="text-emerald-400">${Number(invoice.grand_total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
