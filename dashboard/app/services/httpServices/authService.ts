import { createAsyncThunk } from '@reduxjs/toolkit';
import { httpService } from '../httpService';
import type { AuthMeResponse, ForgotPasswordResponse, LoginFormData, LoginResponse, ResetPasswordResponse, VerifyOTPResponse } from '~/types/auth';

// Auth service with methods for authentication operations
const BASE = '/auth';
export const authService = {
  login: (credentials: LoginFormData) => httpService.post<LoginResponse>(`${BASE}/login`, credentials),
  forgotPassword: (identifier: string) => httpService.post<ForgotPasswordResponse>(`${BASE}/forgot-password`, { identifier }),
  verifyOTP: (identifier: string, otp: string,) => httpService.post<VerifyOTPResponse>(`${BASE}/verify-otp`, { identifier, otp }),
  resetPassword: (token: string, password: string) => httpService.post<ResetPasswordResponse>(`${BASE}/reset-password`, { token, password }),
  newUserPassword: (token: string, password: string) => httpService.post<ResetPasswordResponse>(`${BASE}/new-user-password`, { token, password }),
  checkAuthStatus: () => httpService.get<AuthMeResponse>(`${BASE}/me`),

  logout: () => {
    return httpService.post(`${BASE}/logout`);
  }
};

// Redux async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.message) {
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response;
      }
      return rejectWithValue(response.error || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const forgotPasswordRequest = createAsyncThunk(
  'auth/forgotPassword',
  async (mobileNumber: string, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(mobileNumber);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTPRequest = createAsyncThunk(
  'auth/verifyOTP',
  async ({ otp, mobileNumber }: { otp: string; mobileNumber: string }, { rejectWithValue }) => {
    try {
      return await authService.verifyOTP(otp, mobileNumber);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify OTP');
    }
  }
);

export const resetPasswordRequest = createAsyncThunk(
  'auth/resetPassword',
  async ({ password, mobileNumber }: { password: string; mobileNumber: string }, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(password, mobileNumber);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset password');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.checkAuthStatus();
            if (response.status === "success" && response.data) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Not authenticated');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Not authenticated');
        }
    }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.logout();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);