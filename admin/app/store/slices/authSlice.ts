import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  totalProperties: number;
  totalFavorites: number;
}

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  totalProperties: 0,
  totalFavorites: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        role: string;
        totalProperties: number;
        totalFavorites: number;
      }>,
    ) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.totalProperties = action.payload.totalProperties;
      state.totalFavorites = action.payload.totalFavorites;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.role = null;
      state.totalProperties = 0;
      state.totalFavorites = 0;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
