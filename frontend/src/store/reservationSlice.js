import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reservations: [],
  currentReservation: null,
  loading: false,
  error: null,
  success: null
};

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    setReservations: (state, action) => {
      state.reservations = action.payload;
    },
    setCurrentReservation: (state, action) => {
      state.currentReservation = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    }
  }
});

export const { 
  setReservations, 
  setCurrentReservation, 
  setLoading, 
  setError, 
  setSuccess, 
  clearError, 
  clearSuccess 
} = reservationSlice.actions;

export default reservationSlice.reducer;
