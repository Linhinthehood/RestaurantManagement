import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const tableAPI = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: { 'Content-Type': 'application/json' },
});

tableAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

tableAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const tableService = {
  // Backend mounts at /api/v1/tables
  getTables: async () => (await tableAPI.get('/tables')).data,
  getTableById: async (id) => (await tableAPI.get(`/tables/${id}`)).data,
  // Create/Update/Delete use explicit suffixes per backend routes
  createTable: async (payload) => (await tableAPI.post('/tables/create', payload)).data,
  updateTable: async (id, payload) => (await tableAPI.put(`/tables/${id}/update`, payload)).data,
  deleteTable: async (id) => (await tableAPI.delete(`/tables/${id}/delete`)).data,
};

export default tableService;


