import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { foodService } from '../services/foodService';

// Async thunks
export const fetchAllFoods = createAsyncThunk(
  'foods/fetchAllFoods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await foodService.getAllFoods();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error loading foods');
    }
  }
);

export const fetchFoodsByCategory = createAsyncThunk(
  'foods/fetchFoodsByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await foodService.getFoodsByCategory(categoryId);
      return { categoryId, data: response.data || response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error loading foods by category');
    }
  }
);

const initialState = {
  foods: [],
  foodsByCategory: {},
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null
};

const foodSlice = createSlice({
  name: 'foods',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Foods
      .addCase(fetchAllFoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload.map(food => ({
          ...food,
          category: food.categoryId,
          price: food.pricePerUnit && food.pricePerUnit.$numberDecimal ? Number(food.pricePerUnit.$numberDecimal) : 0
        }));
        // Extract unique categories from foods
        const categoryMap = new Map();
        state.foods.forEach(food => {
          if (food.category) {
            if (!categoryMap.has(food.category._id)) {
              categoryMap.set(food.category._id, food.category);
            }
          }
        });
        state.categories = Array.from(categoryMap.values());
      })
      .addCase(fetchAllFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Foods by Category
      .addCase(fetchFoodsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoodsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, data } = action.payload;
        state.foodsByCategory[categoryId] = data;
      })
      .addCase(fetchFoodsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setSelectedCategory,
  clearSelectedCategory
} = foodSlice.actions;

export default foodSlice.reducer; 