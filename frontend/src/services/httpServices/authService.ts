import { get, post } from '../httpMethods'
import type {
  Customer,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
} from '@/types/customer'

export const authService = {
  login: (payload: LoginPayload) =>
    post<{ data: Customer }>('/customer-auth/login', payload).then((res) => res.data),

  register: (payload: RegisterPayload) =>
    post<{ data: Customer }>('/customer-auth/register', payload).then((res) => res.data),

  logout: () => post<void>('/customer-auth/logout'),

  getMe: () =>
    get<{ data: Customer }>('/customer-auth/me').then((res) => res.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    post<{ message: string }>('/customer-auth/forgot-password', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    post<{ message: string; token: string }>('/customer-auth/verify-otp', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    post<{ message: string }>('/customer-auth/reset-password', payload),
}
