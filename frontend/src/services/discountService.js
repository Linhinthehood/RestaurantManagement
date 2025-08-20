import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const discountAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

discountAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

discountAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const discountService = {
  getAll: async () => {
    const res = await discountAPI.get('/discounts');
    return res.data;
  },
  getActive: async () => {
    const res = await discountAPI.get('/discounts/active');
    return res.data;
  },
  getById: async (id) => {
    const res = await discountAPI.get(`/discounts/${id}`);
    return res.data;
  },
  getByCode: async (code) => {
    const res = await discountAPI.get(`/discounts/code/${encodeURIComponent(code)}`);
    return res.data;
  },
  create: async ({ discountPercentage, quantity }) => {
    const res = await discountAPI.post('/discounts', { discountPercentage, quantity });
    return res.data;
  },
  update: async (id, payload) => {
    const res = await discountAPI.put(`/discounts/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await discountAPI.delete(`/discounts/${id}`);
    return res.data;
  },
};

export default discountService;


