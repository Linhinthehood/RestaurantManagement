import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

// Create axios instance with default config
const orderAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token to header
orderAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Order Service - Simplified
export const orderService = {
  // Get list of arrived reservations with serving orders (if any)
  getArrivedAndServingReservations: async () => {
    try {
      const response = await orderAPI.get("/orders/arrived-reservations");
      return response.data;
    } catch (error) {
      console.error("Error fetching arrived/serving reservations:", error);
      throw error;
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await orderAPI.post("/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await orderAPI.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order by id:", error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await orderAPI.patch(`/orders/${orderId}/status`, { orderStatus: status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, orderStatus) => {
    try {
      const response = await orderAPI.patch(`/orders/${orderId}/status`, { orderStatus });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
};

// Order Item Service
export const orderItemService = {
  createOrderItem: async ({ orderId, foodId, quantity, note }) => {
    try {
      const response = await orderAPI.post("/order-items", {
        orderId,
        foodId,
        quantity,
        note,
      });
      return response.data;
    } catch (error) {
      // Handle specific error for insufficient quantity
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      console.error('Error creating order item:', error);
      throw error;
    }
  },

  // Get all order items for kitchen
  getAllOrderItems: async () => {
    try {
      const response = await orderAPI.get('/order-items');
      return response.data;
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  },

  // Get order item by ID
  getOrderItemById: async (id) => {
    try {
      const response = await orderAPI.get(`/order-items/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order item by id:", error);
      throw error;
    }
  },

  // Update order item status
  updateOrderItemStatus: async (id, status) => {
    try {
      const response = await orderAPI.patch(`/order-items/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order item status:', error);
      throw error;
    }
  },

  // Update order item (note, quantity)
  updateOrderItem: async (id, updateData) => {
    try {
      const response = await orderAPI.put(`/order-items/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating order item:", error);
      throw error;
    }
  },

  // Delete order item
  deleteOrderItem: async (id) => {
    try {
      const response = await orderAPI.delete(`/order-items/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting order item:", error);
      throw error;
    }
  },
};

export default orderService;
