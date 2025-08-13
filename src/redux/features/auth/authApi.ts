// src/features/auth/authApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../api/baseApi"
import type { ChangePasswordData } from "./auth" // Assuming ChangePasswordData is defined here or in auth.ts

// Define user role types
type UserRole = "admin" | "owner" | "user"

// Define core user interface
interface IUser {
  _id: string
  name: string
  email: string
  role: UserRole
  isEmailVerified: boolean
  profileImg?: string
  phone?: string
  address?: string
  googleId?: string
}

// Request interfaces
export interface LoginRequest {
  identifier: string
  password: string
}

export type RegisterRequest = {
  method: "email" | "phone";
  email?: string;
  phone?: string;
  password: string;
  name: string;
  confirmPassword: string;
};

export type VerifyOtpRequest = {
  phone: string;
  code: string;
};

export type VerifyOtpResponse = {
  message: string;
  accessToken: string;
  refreshToken: string; // The backend response should ideally return this
  user: IUser
};

export interface GoogleAuthRequest {
  authCode: string
}

export interface ForgotPasswordRequestF {
  identifier: string
}

export interface VerifyOTPRequestF {
  identifier: string
  code: string
}

export interface ResetPasswordRequestF {
  identifier: string
  password: string
}

export interface ActivateAccountRequest {
  token: string
}

export interface UpdateProfileRequest {
  id: string
  updateData: Partial<IUser>
}

// Response interfaces - Updated to match backend format
export interface AuthResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    user: IUser
    accessToken: string
    // The backend should also set refreshToken as an HttpOnly cookie
  }
}

export interface RegisterResponse {
  success: boolean
  statusCode: number
  message: string
  requestId: string // token for email verification
}

export interface BasicResponse {
  success: boolean
  statusCode: number
  message: string
  data: any
}

export interface TokenResponse {
  success: boolean
  statusCode: number
  message: string
  data: string // access token
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export interface GetProfileResponse {
  success: boolean;
  data: IUser;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (userInfo) => ({
        url: "/user/signin",
        method: "POST",
        body: userInfo,
      }),
    }),

    // Register mutation
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userInfo) => ({
        url: "/user/register",
        method: "POST",
        body: userInfo,
      }),
    }),

      verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/user/verify-otp",
        method: "POST",
        body,
      }),
    }),

    // Google authentication mutation
    googleAuth: builder.mutation<AuthResponse, GoogleAuthRequest>({
      query: (authData) => ({
        url: "/user/google-login",
        method: "POST",
        body: authData,
      }),
    }),

    // Account activation mutation
    activateAccount: builder.mutation<AuthResponse, ActivateAccountRequest>({
      query: (data) => ({
        url: "/user/verify-account",
        method: "POST",
        body: data,
      }),
    }),

    // Logout mutation
    logoutUser: builder.mutation<BasicResponse, void>({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
    }),

    // Refresh token mutation (this is used by baseQueryWithReauth)
    refreshToken: builder.mutation<TokenResponse, void>({
      query: () => ({
        url: "/user/refresh-token",
        method: "POST",
      }),
    }),

      forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequestF>({
      query: ({identifier}) => ({
        url: '/user/forgot-password',
        method: 'POST',
        body: {identifier},
      }),
    }),

    // Verify OTP
    verifyOTP: builder.mutation<ApiResponse, VerifyOTPRequestF>({
      query: (data) => ({
        url: '/user/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password after OTP verification
    resetPassword: builder.mutation<ApiResponse, ResetPasswordRequestF>({
      query: (data) => ({
        url: '/user/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Get user profile query
    getProfile: builder.query<GetProfileResponse, string>({
      query: (id) => `/user/get-single-user/${id}`,
      providesTags: ["User"],
    }),


   // in authApi.ts or wherever you define it
    updateProfile: builder.mutation<
      { success: boolean; data: any }, // your actual response
      Partial<{
        name: string;
        email: string;
        phone: string;
        address: string;
        profileImg: string;
        id: string; // The ID of the user to update
      }>
    >({
      query: (body) => ({
        url: "/user/update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),


    changePassword: builder.mutation<{ message: string }, ChangePasswordData>({
      query: (data) => ({
        url: "/user/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
    uploadProfileImage: builder.mutation<{ profileImg: string }, FormData>({
      query: (formData) => ({
        url: "/user/upload-profile-image",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
})

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useGoogleAuthMutation,
  useActivateAccountMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useVerifyOTPMutation,
  useChangePasswordMutation,
  useUploadProfileImageMutation,
} = authApi

export default authApi