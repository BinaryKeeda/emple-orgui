// src/redux/authSlice.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { AuthState } from '../reducers/userSlice'
import { BASE_URL } from '../../config/config'
import type { UserData } from '../../types/user'
export const loginUser = createAsyncThunk<
  { token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/auth/login`, credentials, {
      withCredentials: true
    })
    return { token: data.token }
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

// Fetch profile thunk
export const fetchProfile = createAsyncThunk<
  UserData,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>('auth/fetchProfile', async (_, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth
    const { data } = await axios.get(`${BASE_URL}/auth/user`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || 'Failed to fetch profile'
    )
  }
})

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  // Optionally, you can notify the server about logout
  try {
    await axios.get(`${BASE_URL}/auth/logout`, { withCredentials: true })
    return true
  } catch (err) {
    console.error('Logout failed on server:', err)
    return false
  }
})
