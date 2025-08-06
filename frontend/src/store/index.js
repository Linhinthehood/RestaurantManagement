import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import reservationSlice from './reservationSlice';
import tableSlice from './tableSlice';
import orderSlice from './orderSlice';
import foodSlice from './foodSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    reservation: reservationSlice,
    table: tableSlice,
    order: orderSlice,
    food: foodSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
