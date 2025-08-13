// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export type TUser = {
  _id: string
  name: string
  email: string
  googleId?: string
  phone?: string
  profileImg?: string
  address?: string
  role: "admin" | "owner" | "user"
  isEmailVerified: boolean
}

type TAuthState = {
  user: null | TUser
  token: string | null
  isLoading: boolean
}

// Function to safely get token from localStorage
const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("token")
  }
  return null
}

// Function to safely store token in localStorage
const storeToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("token", token)
  }
}

// Function to safely remove token from localStorage
const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token")
  }
}

const initialState: TAuthState = {
  user: null,
  token: getStoredToken(), // Initialize from localStorage
  isLoading: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: TUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isLoading = false
      // Store token in localStorage
      storeToken(action.payload.token)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isLoading = false
      // Remove token from localStorage
      removeToken()
    },
    updateUser: (state, action: PayloadAction<Partial<TUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    // New action to update only token (for refresh token flow)
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      storeToken(action.payload)
    },
  },
})

export const { setUser, setLoading, logout, updateUser, updateToken } = authSlice.actions
export default authSlice.reducer