import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService, orderItemService } from '../services/orderService';

export const fetchArrivedAndServingReservations = createAsyncThunk(
  'orders/fetchArrivedAndServingReservations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getArrivedAndServingReservations();
      // response.data: [ { reservation, order, orderItems? } ]
      const data = response.data || response;
      
      // If orderItems are not included in the response, fetch them for each order
      if (data && data.length > 0) {
        const enhancedData = await Promise.all(
          data.map(async (item) => {
            if (item.order && !item.orderItems) {
              try {
                // Fetch order details including orderItems
                const orderResponse = await orderService.getOrderById(item.order._id);
                return {
                  ...item,
                  orderItems: orderResponse.data?.orderItems || []
                };
              } catch (err) {
                console.error('Failed to fetch order items for order:', item.order._id, err);
                return {
                  ...item,
                  orderItems: []
                };
              }
            }
            return item;
          })
        );
        return enhancedData;
      }
      
      return data;
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

export const fetchOrderItems = createAsyncThunk(
  'orders/fetchOrderItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderItemService.getAllOrderItems();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error loading order items');
    }
  }
);

export const updateOrderItemStatus = createAsyncThunk(
  'orders/updateOrderItemStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await orderItemService.updateOrderItemStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating order item status');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating order status');
    }
  }
);

const initialState = {
  arrivedReservations: [], // reservations without orders
  servingReservations: [], // reservations with Serving status orders
  orderItems: [], // all order items for kitchen
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
        console.log('API Response payload:', action.payload);
        
        // Classify: no orders and orders with Serving status
        state.arrivedReservations = [];
        state.servingReservations = [];
        (action.payload || []).forEach(item => {
          console.log('Processing item:', item);
          if (!item.order) {
            // Reservation chưa có order
            state.arrivedReservations.push(item.reservation);
          } else if (item.order.orderStatus === 'Serving' || item.order.orderStatus === 'Completed') {
            // Reservation có order đang Serving hoặc Completed
            // Merge order with orderItems for serving reservations
            // orderItems is at the same level as order in the response
            // Check if orderItems exists at the same level as order
            const orderItems = item.orderItems || item.order.orderItems || [];
            console.log('Found orderItems:', orderItems);
            
            const orderWithItems = {
              ...item.order,
              orderItems: orderItems
            };
            console.log('Order with items:', orderWithItems);
            state.servingReservations.push({ 
              ...item.reservation, 
              order: orderWithItems 
            });
          }
          // Các trạng thái khác không xử lý
        });
        
        console.log('Final arrived reservations:', state.arrivedReservations);
        console.log('Final serving reservations:', state.servingReservations);
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
      })
      // Fetch Order Items
      .addCase(fetchOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out Served and Cancelled orders
        const filteredOrderItems = (action.payload || []).filter(item => item.status !== 'Served' && item.status !== 'Cancelled');
        state.orderItems = filteredOrderItems;
      })
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Item Status
      .addCase(updateOrderItemStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderItemStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order item in the list
        const index = state.orderItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.orderItems[index] = action.payload;
        }
        state.success = 'Order item status updated successfully';
      })
      .addCase(updateOrderItemStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Order status updated successfully';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
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
