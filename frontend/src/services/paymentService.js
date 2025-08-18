import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const paymentAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to header
paymentAPI.interceptors.request.use(
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
paymentAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Payment Service
export const paymentService = {
  // Create new payment
  createPayment: async (paymentData) => {
    try {
      const response = await paymentAPI.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await paymentAPI.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment by id:', error);
      throw error;
    }
  },

  // Get all payments
  getAllPayments: async () => {
    try {
      const response = await paymentAPI.get('/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw error;
    }
  },

  // Get payments by reservation ID
  getPaymentsByReservationId: async (reservationId) => {
    try {
      const response = await paymentAPI.get(`/payments/by-reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments by reservation id:', error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (paymentId, status) => {
    try {
      const response = await paymentAPI.patch(`/payments/${paymentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Delete payment
  deletePayment: async (paymentId) => {
    try {
      const response = await paymentAPI.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};

export default paymentService;
