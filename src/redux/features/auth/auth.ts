// src/features/auth/auth.ts (Likely in utils or similar)
import { baseApi } from "../../api/baseApi"
import { store } from "../../store" // Assuming your Redux store
import { logout, setLoading } from "./authSlice" // Added setLoading import
import { z } from "zod" // Assuming Zod is used for validation schemas

// Check if token exists and is valid
export const validateToken = async (): Promise<boolean> => {
  const state = store.getState()
  const token = state.auth.token

  if (!token) {
    return false
  }

  try {
    // Try to make a request to refresh token endpoint
    // This will automatically handle token refresh if needed via baseQueryWithReauth
    const response = await store.dispatch(
      baseApi.endpoints.refreshToken.initiate()
    )

    if (response.data && response.data.success) {
      return true
    }

    // If refresh failed, clear token
    store.dispatch(logout())
    return false
  } catch (error) {
    console.error("Token validation failed:", error)
    store.dispatch(logout())
    return false
  }
}

// Initialize auth state on app startup
export const initializeAuth = async (): Promise<void> => {
  store.dispatch(setLoading(true))

  try {
    await validateToken()
  } catch (error) {
    console.error("Auth initialization failed:", error)
    store.dispatch(logout())
  } finally {
    store.dispatch(setLoading(false))
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const state = store.getState()
  return !!state.auth.token && !!state.auth.user
}

// Get current user
export const getCurrentUser = () => {
  const state = store.getState()
  return state.auth.user
}

// Get current token
export const getCurrentToken = (): string | null => {
  const state = store.getState()
  return state.auth.token
}


// Zod Schemas for validation (likely in user.validation.ts or similar)
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>