import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  /** Parent user id from login (same as `user.id` when present). */
  parentId: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      const { user, token, parentId } = action.payload;
      state.user = user ?? null;
      state.token = token ?? null;
      state.parentId = parentId ?? user?.id ?? user?._id ?? null;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.parentId = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    stopLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const { setAuthData, logout, stopLoading } = authSlice.actions;

export default authSlice.reducer;
