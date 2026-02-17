import { get, post } from '../httpMethods'
import type {
  Customer,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
} from '@/types/customer'

interface LoginResponse {
  data: {
    customer: Customer
    access_token: string
    refresh_token: string
  }
}

export const authService = {
  /**
   * Backend login returns { data: { customer, access_token, refresh_token } }.
   * We extract just the customer object for the auth state.
   */
  login: (payload: LoginPayload) =>
    post<LoginResponse>('/customer-auth/login', payload).then((res) => res.data.customer),

  /** Backend register returns { data: Customer } directly */
  register: (payload: RegisterPayload) =>
    post<{ data: Customer }>('/customer-auth/register', payload).then((res) => res.data),

  logout: () => post<void>('/customer-auth/logout'),

  getMe: () =>
    get<{ data: Customer }>('/customer-auth/me').then((res) => res.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    post<{ message: string }>('/customer-auth/forgot-password', payload),

  /** Backend returns { message, token } -- the token is needed for reset-password */
  verifyOtp: (payload: VerifyOtpPayload) =>
    post<{ message: string; token: string }>('/customer-auth/verify-otp', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    post<{ message: string }>('/customer-auth/reset-password', payload),
}
