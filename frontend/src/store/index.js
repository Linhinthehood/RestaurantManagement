import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import reservationSlice from './reservationSlice';
import tableSlice from './tableSlice';
import orderSlice from './orderSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    reservation: reservationSlice,
    table: tableSlice,
    order: orderSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
