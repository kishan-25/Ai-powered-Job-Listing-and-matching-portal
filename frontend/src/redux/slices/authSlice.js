import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hydrated: false, // Track if we've checked localStorage
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.hydrated = true;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.hydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.hydrated = true;
    },
    setHydrated: (state) => {
      state.hydrated = true;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setHydrated } = authSlice.actions;
export default authSlice.reducer;
