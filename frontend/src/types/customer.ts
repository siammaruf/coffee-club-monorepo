export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  picture?: string
  note?: string
  points: number
  balance: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Backend expects a single `identifier` field (email or phone) + password */
export interface LoginPayload {
  identifier: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

/** Backend expects a single `identifier` field (email or phone) */
export interface ForgotPasswordPayload {
  identifier: string
}

/** Backend expects `identifier` (email or phone) + `otp` */
export interface VerifyOtpPayload {
  identifier: string
  otp: string
}

/** Backend expects the `token` returned from verify-otp + new `password` */
export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  phone?: string
  address?: string
  picture?: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}
