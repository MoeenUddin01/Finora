import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerApi = {
  getAll: async () => (await api.get('/customers')).data,
  getById: async (id) => (await api.get(`/customers/${id}`)).data,
  create: async (data) => (await api.post('/customers', data)).data,
};

export const supplierApi = {
  getAll: async () => (await api.get('/suppliers')).data,
  getById: async (id) => (await api.get(`/suppliers/${id}`)).data,
  create: async (data) => (await api.post('/suppliers', data)).data,
};

export const itemApi = {
  getAll: async () => (await api.get('/items')).data,
  getById: async (id) => (await api.get(`/items/${id}`)).data,
  create: async (data) => (await api.post('/items', data)).data,
};

export const taxApi = {
  getAll: async () => (await api.get('/taxes')).data,
  create: async (data) => (await api.post('/taxes', data)).data,
};

export const invoiceApi = {
  getAll: async (type = null) => {
    const params = type ? { type } : {};
    return (await api.get('/invoices', { params })).data;
  },
  getById: async (id) => (await api.get(`/invoices/${id}`)).data,
  create: async (data) => (await api.post('/invoices', data)).data,
  updateStatus: async (id, status) => (await api.patch(`/invoices/${id}/status`, null, { params: { new_status: status } })).data,
};

export const reportApi = {
  getProfitLoss: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return (await api.get('/reports/profit-loss', { params })).data;
  },
};

export default api;
