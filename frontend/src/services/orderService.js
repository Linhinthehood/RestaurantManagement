import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const orderAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to header
orderAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle response
orderAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Order Service - Simplified
export const orderService = {
  // Get list of arrived reservations with serving orders (if any)
  getArrivedAndServingReservations: async () => {
    try {
      const response = await orderAPI.get('/orders/arrived-reservations');
      return response.data;
    } catch (error) {
      console.error('Error fetching arrived/serving reservations:', error);
      throw error;
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await orderAPI.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await orderAPI.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order by id:', error);
      throw error;
    }
  },
};

// Order Item Service
export const orderItemService = {
  createOrderItem: async ({ orderId, foodId, quantity, note }) => {
    try {
      const response = await orderAPI.post('/order-items', { orderId, foodId, quantity, note });
      return response.data;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }
};

export default orderService;
