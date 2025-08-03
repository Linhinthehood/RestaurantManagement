import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Tạo axios instance với config mặc định
const orderAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header (tạm thời bỏ qua)
orderAPI.interceptors.request.use(
  (config) => {
    // Tạm thời bỏ qua authentication để test
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response (tạm thời bỏ qua)
orderAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tạm thời bỏ qua redirect login
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

// Order APIs
export const orderService = {
  // Lấy tất cả orders
  getAllOrders: async () => {
    try {
      const response = await orderAPI.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Lấy order theo ID
  getOrderById: async (orderId) => {
    try {
      const response = await orderAPI.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Lấy orders theo reservation ID
  getOrdersByReservationId: async (reservationId) => {
    try {
      const response = await orderAPI.get(`/orders/by-reservation/${reservationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by reservation:', error);
      throw error;
    }
  },

  // Tạo order mới
  createOrder: async (orderData) => {
    try {
      const response = await orderAPI.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Cập nhật order
  updateOrder: async (orderId, orderData) => {
    try {
      const response = await orderAPI.put(`/orders/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái order
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await orderAPI.patch(`/orders/${orderId}/status`, { orderStatus: status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Xóa order
  deleteOrder: async (orderId) => {
    try {
      const response = await orderAPI.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },
};

// Order Item APIs
export const orderItemService = {
  // Lấy tất cả order items
  getAllOrderItems: async () => {
    try {
      const response = await orderAPI.get('/order-items');
      return response.data;
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  },

  // Lấy order item theo ID
  getOrderItemById: async (orderItemId) => {
    try {
      const response = await orderAPI.get(`/order-items/${orderItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order item:', error);
      throw error;
    }
  },

  // Tạo order item mới
  createOrderItem: async (orderItemData) => {
    try {
      const response = await orderAPI.post('/order-items', orderItemData);
      return response.data;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  },

  // Cập nhật order item
  updateOrderItem: async (orderItemId, orderItemData) => {
    try {
      const response = await orderAPI.put(`/order-items/${orderItemId}`, orderItemData);
      return response.data;
    } catch (error) {
      console.error('Error updating order item:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái order item
  updateOrderItemStatus: async (orderItemId, status) => {
    try {
      const response = await orderAPI.patch(`/order-items/${orderItemId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order item status:', error);
      throw error;
    }
  },

  // Xóa order item
  deleteOrderItem: async (orderItemId) => {
    try {
      const response = await orderAPI.delete(`/order-items/${orderItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order item:', error);
      throw error;
    }
  },
};

export default orderService;
