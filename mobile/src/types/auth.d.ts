import type { User } from './user';

export interface LoginResponse {
  success?: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
  data?: {
    user: User;
    token: string;
  };
}

export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
};

export interface ForgotPasswordFormData {
  mobileNumber: string;
}

export interface VerifyOTPFormData {
  otp: string;
  mobileNumber?: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  mobileNumber?: string;
}

export interface AuthState {
  user: null | User;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
  mobileNumber?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  mobileNumber?: string;
  status?: string;  
  statusCode?: number;
  token?: string;
  canResend?: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
  status?: string;
  token?: string;
}

export interface AuthMeResponse {
  status: string;
  message: string;
  statusCode: number;
  data: User;
  timestamp: string;
}

export interface ForgotPasswordResponse {
  status: string;
  message?: string;
  statusCode: number;
  timestamp: string;
}