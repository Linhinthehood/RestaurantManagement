const axios = require('axios');

// Base URLs cho từng service (trong Docker network)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

class ExternalService {
  // Lấy thông tin user từ user-service
  static async getUserById(userId, token) {
    try {
      console.log(`Fetching user from: ${USER_SERVICE_URL}/api/auth/users/${userId}`);
      const response = await axios.get(`${USER_SERVICE_URL}/api/auth/users/${userId}`, {
        headers: {
          Authorization: token
        }
      });
      console.log('User data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }

  // Lấy thông tin reservation từ reservation-service
  static async getReservationById(reservationId, token) {
    try {
      console.log(`Fetching reservation from: ${RESERVATION_SERVICE_URL}/api/v1/reservations/${reservationId}`);
      const response = await axios.get(`${RESERVATION_SERVICE_URL}/api/v1/reservations/${reservationId}`, {
        headers: {
          Authorization: token
        }
      });
      console.log('Reservation data received:', response.data);
      return response.data.reservation || response.data;
    } catch (error) {
      console.error('Error fetching reservation:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }

  // Lấy thông tin order theo reservationId từ order-service
  static async getOrdersByReservationId(reservationId, token) {
    try {
      console.log(`Fetching orders from: ${ORDER_SERVICE_URL}/api/orders/by-reservation/${reservationId}`);
      const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/by-reservation/${reservationId}`, {
        headers: {
          Authorization: token
        }
      });
      console.log('Orders data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }

  // Lấy thông tin order theo ID từ order-service
  static async getOrderById(orderId, token) {
    try {
      console.log(`Fetching order from: ${ORDER_SERVICE_URL}/api/orders/${orderId}`);
      const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: token
        }
      });
      console.log('Order data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }

  // Lấy thông tin customer từ reservation-service
  static async getCustomerById(customerId, token) {
    try {
      console.log(`Fetching customer from: ${RESERVATION_SERVICE_URL}/api/v1/customers/${customerId}`);
      const response = await axios.get(`${RESERVATION_SERVICE_URL}/api/v1/customers/${customerId}`, {
        headers: {
          Authorization: token
        }
      });
      console.log('Customer data received:', response.data);
      return response.data.customer || response.data;
    } catch (error) {
      console.error('Error fetching customer:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }

  // Lấy thông tin user profile từ token (để lấy thông tin user hiện tại)
  static async getUserProfile(token) {
    try {
      console.log(`Fetching user profile from: ${USER_SERVICE_URL}/api/auth/profile`);
      const response = await axios.get(`${USER_SERVICE_URL}/api/auth/profile`, {
        headers: {
          Authorization: token
        }
      });
      console.log('User profile received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }
}

module.exports = ExternalService;
