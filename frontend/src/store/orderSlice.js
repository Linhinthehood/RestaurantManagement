import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../services/orderService';

export const fetchArrivedAndServingReservations = createAsyncThunk(
  'orders/fetchArrivedAndServingReservations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getArrivedAndServingReservations();
      // response.data: [ { reservation, order } ]
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error loading reservations list');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating order');
    }
  }
);

const initialState = {
  arrivedReservations: [], // reservations without orders
  servingReservations: [], // reservations with Serving status orders
  loading: false,
  error: null,
  success: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArrivedAndServingReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArrivedAndServingReservations.fulfilled, (state, action) => {
        state.loading = false;
        // Classify: no orders and orders with Serving status
        state.arrivedReservations = [];
        state.servingReservations = [];
        (action.payload || []).forEach(item => {
          if (!item.order) {
            state.arrivedReservations.push(item.reservation);
          } else if (item.order.orderStatus === 'Serving') {
            state.servingReservations.push({ ...item.reservation, order: item.order });
          }
        });
      })
      .addCase(fetchArrivedAndServingReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Order created successfully';
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccess
} = orderSlice.actions;

export default orderSlice.reducer;
