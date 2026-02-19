
import { AuthMeResponse, ForgotPasswordResponse, LoginFormData, LoginResponse, ResetPasswordResponse, VerifyOTPResponse } from '../../types/auth';
import { httpService } from '../httpService';

export const authService = {
  login: (credentials: LoginFormData) => httpService.post<LoginResponse>('/auth/login', credentials),
  forgotPassword: (identifier: string) => httpService.post<ForgotPasswordResponse>('/auth/forgot-password', { identifier }),
  verifyOTP: (identifier: string, otp: string) => httpService.post<VerifyOTPResponse>('/auth/verify-otp', { identifier, otp }),
  resetPassword: (token: string, password: string) => httpService.post<ResetPasswordResponse>('/auth/reset-password', { token, password }),
  newUserPassword: (token: string, password: string) => httpService.post<ResetPasswordResponse>('/auth/new-user-password', { token, password }),
  checkAuthStatus: () => httpService.get<AuthMeResponse>('/auth/me'),
  logout: () => httpService.post('/auth/logout'),
};