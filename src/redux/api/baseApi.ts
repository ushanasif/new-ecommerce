// src/api/baseApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { RootState } from "../store" // Assuming RootState type
import { logout, setUser } from "../features/auth/authSlice" // Assuming logout and setUser actions

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5009/api",
  credentials: "include", // Required for sending cookies (refreshToken)
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions)

  // If access token is expired, attempt to refresh it
  if (result.error && result.error.status === 401) {
    console.warn("Access token expired. Attempting to refresh...")

    const refreshResult = await baseQuery(
      {
        url: "/user/refresh-token",
        method: "POST",
      },
      api,
      extraOptions
    )

    if (refreshResult.data && (refreshResult.data as any).data) {
      const refreshData = refreshResult.data as {
        success: boolean
        data: string // The new access token
      }

      if (refreshData.success && refreshData.data) {
        const state = api.getState() as RootState
        const currentUser = state.auth.user

        if (currentUser) {
          api.dispatch(
            setUser({
              user: currentUser,
              token: refreshData.data,
            })
          )

          // Retry the original request with the new token
          result = await baseQuery(args, api, extraOptions)
        }
      } else {
        console.error("Refresh token failed (invalid data). Logging out.")
        api.dispatch(logout())
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    } else {
      // Refresh token itself is expired or invalid
      console.error("Refresh token error or expired. Logging out.")
      api.dispatch(logout())
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Category",
    "SubCategory",
    "SubSubCategory",
    "Product",
    "Order",
    "ShippingFee",
    "Banner",
    "Wishlist",
    "Refund"
  ],
  endpoints: (builder) => ({
    // This refreshToken mutation is used internally by baseQueryWithReauth
    refreshToken: builder.mutation<{ success: boolean; data: string }, void>({
      query: () => ({
        url: "/user/refresh-token",
        method: "POST",
      }),
    }),
  }),
})

export const {
  middleware: apiMiddleware,
  reducer: apiReducer,
  reducerPath: apiReducerPath,
  useRefreshTokenMutation, // Exported but primarily used internally
} = baseApi