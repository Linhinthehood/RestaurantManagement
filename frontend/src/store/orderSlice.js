import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService, orderItemService } from '../services/orderService';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải thông tin đơn hàng');
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
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, orderData }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrder(orderId, orderData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderService.deleteOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa đơn hàng');
    }
  }
);

export const fetchOrdersByReservation = createAsyncThunk(
  'orders/fetchOrdersByReservation',
  async (reservationId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrdersByReservationId(reservationId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải đơn hàng theo reservation');
    }
  }
);

// Order Items async thunks
export const createOrderItem = createAsyncThunk(
  'orders/createOrderItem',
  async (orderItemData, { rejectWithValue }) => {
    try {
      const response = await orderItemService.createOrderItem(orderItemData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo order item');
    }
  }
);

export const updateOrderItem = createAsyncThunk(
  'orders/updateOrderItem',
  async ({ orderItemId, orderItemData }, { rejectWithValue }) => {
    try {
      const response = await orderItemService.updateOrderItem(orderItemId, orderItemData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật order item');
    }
  }
);

export const updateOrderItemStatus = createAsyncThunk(
  'orders/updateOrderItemStatus',
  async ({ orderItemId, status }, { rejectWithValue }) => {
    try {
      const response = await orderItemService.updateOrderItemStatus(orderItemId, status);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái order item');
    }
  }
);

export const deleteOrderItem = createAsyncThunk(
  'orders/deleteOrderItem',
  async (orderItemId, { rejectWithValue }) => {
    try {
      await orderItemService.deleteOrderItem(orderItemId);
      return orderItemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa order item');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  success: null,
  filters: {
    status: '',
    date: '',
    reservationId: '',
    tableId: '',
    search: ''
  }
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
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        date: '',
        reservationId: '',
        tableId: '',
        search: ''
      };
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
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
        state.orders.unshift(action.payload);
        state.success = 'Tạo đơn hàng thành công';
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
        state.success = 'Cập nhật đơn hàng thành công';
      })
      .addCase(updateOrder.rejected, (state, action) => {
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
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
        state.success = 'Cập nhật trạng thái đơn hàng thành công';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order._id !== action.payload);
        if (state.currentOrder && state.currentOrder._id === action.payload) {
          state.currentOrder = null;
        }
        state.success = 'Xóa đơn hàng thành công';
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Orders by Reservation
      .addCase(fetchOrdersByReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersByReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Order Item
      .addCase(createOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật order items trong current order nếu có
        if (state.currentOrder && state.currentOrder._id === action.payload.orderId) {
          if (!state.currentOrder.orderItems) {
            state.currentOrder.orderItems = [];
          }
          state.currentOrder.orderItems.push(action.payload);
        }
        state.success = 'Thêm món ăn thành công';
      })
      .addCase(createOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Order Item
      .addCase(updateOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật order item trong current order nếu có
        if (state.currentOrder && state.currentOrder.orderItems) {
          const index = state.currentOrder.orderItems.findIndex(item => item._id === action.payload._id);
          if (index !== -1) {
            state.currentOrder.orderItems[index] = action.payload;
          }
        }
        state.success = 'Cập nhật món ăn thành công';
      })
      .addCase(updateOrderItem.rejected, (state, action) => {
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
        // Cập nhật order item status trong current order nếu có
        if (state.currentOrder && state.currentOrder.orderItems) {
          const index = state.currentOrder.orderItems.findIndex(item => item._id === action.payload._id);
          if (index !== -1) {
            state.currentOrder.orderItems[index] = action.payload;
          }
        }
        state.success = 'Cập nhật trạng thái món ăn thành công';
      })
      .addCase(updateOrderItemStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Order Item
      .addCase(deleteOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        // Xóa order item khỏi current order nếu có
        if (state.currentOrder && state.currentOrder.orderItems) {
          state.currentOrder.orderItems = state.currentOrder.orderItems.filter(item => item._id !== action.payload);
        }
        state.success = 'Xóa món ăn thành công';
      })
      .addCase(deleteOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearSuccess,
  setFilters,
  clearFilters,
  setCurrentOrder,
  clearCurrentOrder
} = orderSlice.actions;

export default orderSlice.reducer;
