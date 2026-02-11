import { z } from 'zod'

// Login schema
export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register schema
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.literal(true, {
      error: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Forgot Password - Step 1: Email/Phone
export const forgotPasswordEmailSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone number is required'),
})

export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>

// Forgot Password - Step 2: OTP
export const forgotPasswordOtpSchema = z.object({
  otp: z.string().min(4, 'Please enter a valid OTP'),
})

export type ForgotPasswordOtpData = z.infer<typeof forgotPasswordOtpSchema>

// Forgot Password - Step 3: Reset Password
export const forgotPasswordResetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ForgotPasswordResetData = z.infer<typeof forgotPasswordResetSchema>
