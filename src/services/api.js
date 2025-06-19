import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Services
export const akunAPI = {
  getAll: () => api.get('/akun'),
  getByNomor: (nomorAkun) => api.get(`/akun/${nomorAkun}`),
  create: (data) => api.post('/akun', data),
  update: (nomorAkun, data) => api.put(`/akun/${nomorAkun}`, data),
  delete: (nomorAkun) => api.delete(`/akun/${nomorAkun}`),
};

export const buktiTransaksiAPI = {
  getAll: () => api.get('/bukti-transaksi'),
  getById: (id) => api.get(`/bukti-transaksi/${id}`),
  create: (data) => api.post('/bukti-transaksi', data),
  update: (id, data) => api.put(`/bukti-transaksi/${id}`, data),
  delete: (id) => api.delete(`/bukti-transaksi/${id}`),
};

export const jurnalUmumAPI = {
  getAll: () => api.get('/jurnal-umum'),
  getById: (id) => api.get(`/jurnal-umum/${id}`),
  create: (data) => api.post('/jurnal-umum', data),
  update: (id, data) => api.put(`/jurnal-umum/${id}`, data),
  delete: (id) => api.delete(`/jurnal-umum/${id}`),
};

export const jurnalPenyesuaianAPI = {
  getAll: () => api.get('/jurnal-penyesuaian'),
  getById: (id) => api.get(`/jurnal-penyesuaian/${id}`),
  create: (data) => api.post('/jurnal-penyesuaian', data),
  update: (id, data) => api.put(`/jurnal-penyesuaian/${id}`, data),
  delete: (id) => api.delete(`/jurnal-penyesuaian/${id}`),
};

export default api;
