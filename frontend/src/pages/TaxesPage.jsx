import React, { useState, useEffect } from 'react';
import { Percent, Plus, Search, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { taxApi } from '../services/api';
import Modal from '../components/Modal';

export default function TaxesPage() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    rate_percent: 0,
    is_active: true
  });

  const loadTaxes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taxApi.getAll();
      setTaxes(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load tax rates. Please check backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleCreateTax = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Tax name is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await taxApi.create({
        name: formData.name.trim(),
        rate_percent: Number(formData.rate_percent) || 0.0,
        is_active: Boolean(formData.is_active)
      });
      setIsModalOpen(false);
      setFormData({ name: '', rate_percent: 0, is_active: true });
      await loadTaxes();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to create tax rate rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTaxes = taxes.filter((t) => {
    const query = search.toLowerCase();
    return t.name?.toLowerCase().includes(query) || t.rate_percent.toString().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Percent className="w-6 h-6 text-amber-400" />
            Tax Rates
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure sales tax, VAT, GST, and withholding tax percentage rules.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', rate_percent: 0, is_active: true });
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-amber-600/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tax Rate</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tax rule name or rate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
        <button
          onClick={loadTaxes}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <p className="text-sm font-medium">Loading tax rates...</p>
          </div>
        ) : filteredTaxes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Percent className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-300">No Tax Rates Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search ? 'No results matched your search query.' : 'Click "Add Tax Rate" above to create tax rules.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Tax ID</th>
                  <th className="px-6 py-3.5 font-semibold">Tax Rule Name</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Tax Rate (%)</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTaxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{tax.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {tax.name}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-amber-400 text-base">
                      {tax.rate_percent}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tax.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-500 border border-slate-700 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inline Modal Form for Adding Tax Rate */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Tax Rate"
      >
        <form onSubmit={handleCreateTax} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tax Rule Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Standard VAT 15%"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Rate Percentage (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="rate_percent"
              required
              placeholder="15.00"
              value={formData.rate_percent}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="is_active" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
              Active tax rule (available for selection in invoices)
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Save Tax Rate</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
