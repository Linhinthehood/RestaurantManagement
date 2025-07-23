// import { createSlice } from "@reduxjs/toolkit";

// // Lấy user từ localStorage nếu có
// const storedUser = JSON.parse(localStorage.getItem("user"));

// const initialState = {
//   user: storedUser || null,
//   isAuthenticated: !!storedUser,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     loginSuccess(state, action) {
//       state.user = action.payload;
//       state.isAuthenticated = true;
//       localStorage.setItem("user", JSON.stringify(action.payload));
//     },
//     logout(state) {
//       state.user = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem("user");
//     },
//   },
// });

// export const { loginSuccess, logout } = authSlice.actions;

// export default authSlice.reducer;
