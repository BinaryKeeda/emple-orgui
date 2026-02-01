// src/redux/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchProfile, logoutUser } from "../thunks/userThunks";
import type { UserData } from "../../types/user";



export interface AuthState {
  user: UserData | null
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// Login thunk
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<UserData>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Profile fetch failed";
      })
      .addCase(logoutUser.fulfilled, (state, action: PayloadAction<boolean>) => {
        if (action.payload) {
          state.user = null;
          state.loading = false;
        }
      })
      .addCase(logoutUser.pending, (state) => {
        // Optionally, you can set loading state
        state.loading = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails on server, clear local state
        state.user = null;
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
