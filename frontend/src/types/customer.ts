export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  picture?: string
  points: number
  balance: number
  is_active: boolean
}

export interface LoginPayload {
  email?: string
  phone?: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

export interface ForgotPasswordPayload {
  email?: string
  phone?: string
}

export interface VerifyOtpPayload {
  email?: string
  phone?: string
  otp: string
}

export interface ResetPasswordPayload {
  email?: string
  phone?: string
  otp: string
  password: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  phone?: string
  address?: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}
