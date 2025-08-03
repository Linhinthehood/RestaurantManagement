import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tables: [],
  currentTable: null,
  loading: false,
  error: null,
  success: null
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = action.payload;
    },
    setCurrentTable: (state, action) => {
      state.currentTable = action.payload;
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
  setTables, 
  setCurrentTable, 
  setLoading, 
  setError, 
  setSuccess, 
  clearError, 
  clearSuccess 
} = tableSlice.actions;

export default tableSlice.reducer;
