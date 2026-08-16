import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, RefreshCw, AlertCircle, Calculator, Calendar, FileText } from 'lucide-react';
import Modal from './Modal';
import { customerApi, supplierApi, itemApi, taxApi, invoiceApi } from '../services/api';

export default function InvoiceBuilderModal({ isOpen, onClose, invoiceType = 'SALES', onSuccess }) {
  const isSales = invoiceType.toUpperCase() === 'SALES';

  // Master data state
  const [parties, setParties] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Invoice form state
  const [partyId, setPartyId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState('DRAFT');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState([
    { item_id: '', description: '', quantity: 1, unit_price: 0, tax_rate_percent: 0 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quick Party Modal state
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [quickPartyName, setQuickPartyName] = useState('');
  const [quickPartyEmail, setQuickPartyEmail] = useState('');
  const [quickPartyPhone, setQuickPartyPhone] = useState('');
  const [quickPartySubmitting, setQuickPartySubmitting] = useState(false);

  // Load dropdown master data
  const loadMasterData = async () => {
    setLoadingData(true);
    try {
      const [partiesData, itemsData, taxesData] = await Promise.all([
        isSales ? customerApi.getAll() : supplierApi.getAll(),
        itemApi.getAll(),
        taxApi.getAll(),
      ]);
      setParties(partiesData);
      setCatalogItems(itemsData);
      setTaxRates(taxesData);

      // Auto-select first party if available
      if (partiesData.length > 0 && !partyId) {
        setPartyId(partiesData[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load master data. Please refresh.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen, invoiceType]);

  // Handle item selection change in a line item row
  const handleItemSelect = (index, selectedItemId) => {
    const foundItem = catalogItems.find((i) => i.id.toString() === selectedItemId.toString());
    const defaultPrice = foundItem ? (isSales ? foundItem.sales_price : foundItem.purchase_price) : 0;

    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        item_id: selectedItemId,
        description: foundItem ? foundItem.name : '',
        unit_price: defaultPrice,
      };
      return updated;
    });
  };

  const handleLineChange = (index, field, value) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { item_id: catalogItems[0]?.id?.toString() || '', description: '', quantity: 1, unit_price: 0, tax_rate_percent: 0 }
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedLines = lineItems.map((line) => {
    const qty = Number(line.quantity) || 0;
    const price = Number(line.unit_price) || 0;
    const taxRate = Number(line.tax_rate_percent) || 0;
    const lineSubtotal = qty * price;
    const lineTax = lineSubtotal * (taxRate / 100.0);
    const lineTotal = lineSubtotal + lineTax;
    return { ...line, lineSubtotal, lineTax, lineTotal };
  });

  const subtotalSum = calculatedLines.reduce((acc, l) => acc + l.lineSubtotal, 0);
  const taxTotalSum = calculatedLines.reduce((acc, l) => acc + l.lineTax, 0);
  const grandTotalSum = subtotalSum + taxTotalSum;

  // Handle Quick Party Creation inside builder
  const handleQuickCreateParty = async (e) => {
    e.preventDefault();
    if (!quickPartyName.trim()) return;
    setQuickPartySubmitting(true);
    try {
      const payload = {
        name: quickPartyName.trim(),
        email: quickPartyEmail.trim() || null,
        phone: quickPartyPhone.trim() || null,
      };
      const created = isSales
        ? await customerApi.create(payload)
        : await supplierApi.create(payload);

      setParties((prev) => [created, ...prev]);
      setPartyId(created.id.toString());
      setIsPartyModalOpen(false);
      setQuickPartyName('');
      setQuickPartyEmail('');
      setQuickPartyPhone('');
    } catch (err) {
      console.error(err);
      alert('Failed to quick-add party.');
    } finally {
      setQuickPartySubmitting(false);
    }
  };

  // Handle Main Invoice Submission
  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    if (!partyId) {
      setError(`Please select a ${isSales ? 'Customer' : 'Supplier'}.`);
      return;
    }

    const validItems = lineItems.filter((i) => i.item_id && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      setError('Please add at least one valid line item with quantity > 0.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        invoice_type: isSales ? 'SALES' : 'PURCHASE',
        party_type: isSales ? 'CUSTOMER' : 'SUPPLIER',
        customer_id: isSales ? Number(partyId) : null,
        supplier_id: !isSales ? Number(partyId) : null,
        issue_date: issueDate ? new Date(issueDate).toISOString() : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        status: status.toUpperCase(),
        notes: notes.trim() || null,
        items: validItems.map((item) => ({
          item_id: Number(item.item_id),
          description: item.description.trim() || null,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          tax_rate_percent: Number(item.tax_rate_percent),
        })),
      };

      await invoiceApi.create(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isSales ? 'Create Sales Invoice' : 'Create Purchase Invoice'}
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Top Party & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {isSales ? 'Customer' : 'Supplier'} <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsPartyModalOpen(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> Quick Add
                </button>
              </div>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select {isSales ? 'Customer' : 'Supplier'}...</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Invoice Line Items
              </h4>
              <button
                type="button"
                onClick={addLineItem}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {calculatedLines.map((line, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-4">
                    <select
                      value={line.item_id}
                      onChange={(e) => handleItemSelect(idx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Item...</option>
                      {catalogItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (${isSales ? item.sales_price : item.purchase_price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Description"
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-slate-200 text-center font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={line.unit_price}
                      onChange={(e) => handleLineChange(idx, 'unit_price', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 text-right font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <select
                      value={line.tax_rate_percent}
                      onChange={(e) => handleLineChange(idx, 'tax_rate_percent', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-1 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={0}>0%</option>
                      {taxRates.map((t) => (
                        <option key={t.id} value={t.rate_percent}>
                          {t.rate_percent}%
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length <= 1}
                      className="text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal & Calculations Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Invoice Notes / Terms
              </label>
              <textarea
                rows={2}
                placeholder="Payment due within 30 days. Thank you for your business!"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="w-full sm:w-5/12 space-y-1.5 text-right font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-slate-200">${subtotalSum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax Total:</span>
                <span className="text-amber-400">${taxTotalSum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="text-emerald-400">${grandTotalSum.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Selection & Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400">Status:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('DRAFT')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    status === 'DRAFT'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('PAID')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    status === 'PAID'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Paid Immediately
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Invoice</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Quick Party Creation Modal */}
      <Modal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        title={isSales ? 'Quick Add Customer' : 'Quick Add Supplier'}
      >
        <form onSubmit={handleQuickCreateParty} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Full Name / Business Name"
              value={quickPartyName}
              onChange={(e) => setQuickPartyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="contact@company.com"
              value={quickPartyEmail}
              onChange={(e) => setQuickPartyEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={quickPartyPhone}
              onChange={(e) => setQuickPartyPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPartyModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={quickPartySubmitting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              Save & Select
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
