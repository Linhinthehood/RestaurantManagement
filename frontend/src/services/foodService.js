import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const foodAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to header
foodAPI.interceptors.request.use(
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
foodAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Food Service
export const foodService = {
  // Get all foods
  getAllFoods: async () => {
    try {
      const response = await foodAPI.get('/foods');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get foods by category
  getFoodsByCategory: async (categoryId) => {
    try {
      const response = await foodAPI.get(`/foods/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get food by ID
  getFoodById: async (foodId) => {
    try {
      const response = await foodAPI.get(`/foods/${foodId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new food
  createFood: async (foodData) => {
    try {
      const response = await foodAPI.post('/foods', foodData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update food (supports both with and without image)
  updateFood: async (foodId, foodData) => {
    try {
      const response = await foodAPI.put(`/foods/${foodId}`, foodData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete food
  deleteFood: async (foodId) => {
    try {
      const response = await foodAPI.delete(`/foods/${foodId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await foodAPI.get('/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await foodAPI.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await foodAPI.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await foodAPI.put(`/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    try {
      const response = await foodAPI.delete(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default foodService; 