import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Tag, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { itemApi } from '../services/api';
import Modal from '../components/Modal';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    sales_price: 0,
    purchase_price: 0,
    unit: 'pcs'
  });

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemApi.getAll();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory items. Please check backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Item name is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await itemApi.create({
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        description: formData.description.trim() || null,
        sales_price: Number(formData.sales_price) || 0.0,
        purchase_price: Number(formData.purchase_price) || 0.0,
        unit: formData.unit.trim() || 'pcs'
      });
      setIsModalOpen(false);
      setFormData({ name: '', code: '', description: '', sales_price: 0, purchase_price: 0, unit: 'pcs' });
      await loadItems();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to create item record.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.code?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            Inventory Items
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain product catalog, service offerings, default prices, and stock units.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', code: '', description: '', sales_price: 0, purchase_price: 0, unit: 'pcs' });
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search item name, code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <button
          onClick={loadItems}
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
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <p className="text-sm font-medium">Loading inventory items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-300">No Items Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search ? 'No results matched your search query.' : 'Click "Add Item" above to add products or services to your catalog.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Item Code</th>
                  <th className="px-6 py-3.5 font-semibold">Item Name</th>
                  <th className="px-6 py-3.5 font-semibold">Description</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Sales Price</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Purchase Price</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400">
                      {item.code ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <Tag className="w-3 h-3" />
                          {item.code}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {item.description || <span className="text-slate-600 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400">
                      ${Number(item.sales_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                      ${Number(item.purchase_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                        {item.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inline Modal Form for Adding Item */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Inventory Item"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Item Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Cloud Hosting Plan"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SKU / Code
              </label>
              <input
                type="text"
                name="code"
                placeholder="PROD-001"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-xs uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sales Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sales_price"
                value={formData.sales_price}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Purchase Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unit of Measure
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="pcs">pcs</option>
                <option value="hrs">hrs</option>
                <option value="kg">kg</option>
                <option value="box">box</option>
                <option value="unit">unit</option>
                <option value="month">month</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="High performance managed server instance with 99.9% SLA"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Save Item</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
