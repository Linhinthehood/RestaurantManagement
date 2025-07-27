import axios from 'axios';

// Service URLs from environment variables
const TABLE_SERVICE_URL = process.env.TABLE_SERVICE_URL || 'http://localhost:3005';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Table Service API calls
export const tableService = {
  // Get all tables
  getAllTables: async () => {
    try {
      console.log('Calling table service at:', `${TABLE_SERVICE_URL}/api/v1/tables`);
      const response = await axios.get(`${TABLE_SERVICE_URL}/api/v1/tables`);
      console.log('Table service response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tables from table service:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw new Error('Failed to fetch tables from table service');
    }
  },

  // Get available tables based on capacity and time
  getAvailableTables: async (capacity, checkInTime, expectedCheckOutTime) => {
    try {
      const response = await axios.get(`${TABLE_SERVICE_URL}/api/v1/tables`, {
        params: {
          capacity: capacity,
          checkInTime: checkInTime,
          expectedCheckOutTime: expectedCheckOutTime
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available tables:', error.message);
      throw new Error('Failed to fetch available tables');
    }
  },

  // Check if table is available for specific time
  checkTableAvailability: async (tableId, checkInTime, expectedCheckOutTime) => {
    try {
      const response = await axios.get(`${TABLE_SERVICE_URL}/api/v1/tables/${tableId}/availability`, {
        params: {
          checkInTime: checkInTime,
          expectedCheckOutTime: expectedCheckOutTime
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking table availability:', error.message);
      throw new Error('Failed to check table availability');
    }
  },

  // Assign table to reservation
  assignTable: async (tableId, reservationId, checkInTime, expectedCheckOutTime, staffId) => {
    try {
      const response = await axios.put(`${TABLE_SERVICE_URL}/api/v1/tables/${tableId}/assign`, {
        reservationId: reservationId,
        checkInTime: checkInTime,
        expectedCheckOutTime: expectedCheckOutTime,
        assignedBy: staffId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning table:', error.message);
      throw new Error('Failed to assign table');
    }
  },

  // Release table
  releaseTable: async (tableId, reservationId) => {
    try {
      const response = await axios.put(`${TABLE_SERVICE_URL}/api/v1/tables/${tableId}/release`, {
        reservationId: reservationId
      });
      return response.data;
    } catch (error) {
      console.error('Error releasing table:', error.message);
      throw new Error('Failed to release table');
    }
  }
};

// User Service API calls - chỉ quản lý nhân viên
export const userService = {
  // Verify user token (nhân viên)
  verifyToken: async (token) => {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying token with user service:', error.message);
      throw new Error('Invalid token');
    }
  },

  // Get user by ID (nhân viên)
  getUserById: async (userId, token) => {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.message);
      throw new Error('Failed to fetch user');
    }
  }
}; 