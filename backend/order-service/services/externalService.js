const axios = require('axios');

// Base URLs cho từng service (trong Docker network)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL ;
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL ;
const FOOD_SERVICE_URL = process.env.FOOD_SERVICE_URL ;
const TABLE_SERVICE_URL = process.env.TABLE_SERVICE_URL ;

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
      // Trả về reservation object từ response
      return response.data.reservation || response.data;
    } catch (error) {
      console.error('Error fetching reservation:', error.message);
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
      // Trả về customer object từ response
      return response.data.customer || response.data;
    } catch (error) {
      console.error('Error fetching customer:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }

  // Lấy thông tin table từ table-service
  static async getTableById(tableId, token) {
    try {
      console.log(`Fetching table from: ${TABLE_SERVICE_URL}/api/v1/tables/${tableId}`);
      const response = await axios.get(`${TABLE_SERVICE_URL}/api/v1/tables/${tableId}`, {
        headers: {
          Authorization: token
        }
      });
      console.log('Table data received:', response.data);
      // Trả về table object từ response
      return response.data.table || response.data;
    } catch (error) {
      console.error('Error fetching table:', error.message);
      console.error('Full error:', error.response?.data || error);
      return null;
    }
  }

  // Lấy thông tin food từ food-service
  static async getFoodById(foodId) {
    try {
      const response = await axios.get(`${FOOD_SERVICE_URL}/api/foods/${foodId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching food:', error.message);
      return null;
    }
  }

  // Cập nhật quantity của food
  static async updateFoodQuantity(foodId, quantity) {
    try {
      const response = await axios.put(`${FOOD_SERVICE_URL}/api/foods/${foodId}`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating food quantity:', error.message);
      throw error;
    }
  }

  // Lấy danh sách tất cả tables
  static async getAllTables() {
    try {
      const response = await axios.get(`${TABLE_SERVICE_URL}/api/v1/tables`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tables:', error.message);
      return [];
    }
  }

  // Lấy danh sách tất cả users
  static async getAllUsers() {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/auth/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error.message);
      return [];
    }
  }

  // Lấy danh sách tất cả reservations
  static async getAllReservations() {
    try {
      const response = await axios.get(`${RESERVATION_SERVICE_URL}/api/v1/reservations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reservations:', error.message);
      return [];
    }
  }
}

module.exports = ExternalService; 