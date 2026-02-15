import { useState } from 'react'
import type { MetaFunction } from 'react-router'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/httpServices/authService'
import {
  forgotPasswordEmailSchema,
  forgotPasswordOtpSchema,
  forgotPasswordResetSchema,
} from '@/utils/validations/auth'
import type {
  ForgotPasswordEmailData,
  ForgotPasswordOtpData,
  ForgotPasswordResetData,
} from '@/utils/validations/auth'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Reset Password | CoffeeClub' },
  {
    name: 'description',
    content: 'Reset your CoffeeClub account password.',
  },
  { name: 'robots', content: 'noindex, nofollow' },
]

type Step = 'email' | 'otp' | 'password'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const steps: { key: Step; label: string; number: number }[] = [
    { key: 'email', label: 'Verify Identity', number: 1 },
    { key: 'otp', label: 'Enter OTP', number: 2 },
    { key: 'password', label: 'New Password', number: 3 },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  // Step 1 form
  const emailForm = useForm<ForgotPasswordEmailData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    mode: 'onChange',
  })

  // Step 2 form
  const otpForm = useForm<ForgotPasswordOtpData>({
    resolver: zodResolver(forgotPasswordOtpSchema),
    mode: 'onChange',
  })

  // Step 3 form
  const resetForm = useForm<ForgotPasswordResetData>({
    resolver: zodResolver(forgotPasswordResetSchema),
    mode: 'onChange',
  })

  const handleSendOtp = async (data: ForgotPasswordEmailData) => {
    setEmailOrPhone(data.emailOrPhone)
    try {
      await authService.forgotPassword({ identifier: data.emailOrPhone })
      toast.success('OTP sent to your email/phone!')
      setStep('otp')
    } catch {
      toast.error('Failed to send OTP. Please try again.')
    }
  }

  const handleVerifyOtp = async (data: ForgotPasswordOtpData) => {
    try {
      const response = await authService.verifyOtp({
        identifier: emailOrPhone,
        otp: data.otp,
      })
      setResetToken(response.token)
      toast.success('OTP verified successfully!')
      setStep('password')
    } catch {
      toast.error('Invalid OTP. Please try again.')
    }
  }

  const handleResetPassword = async (data: ForgotPasswordResetData) => {
    try {
      await authService.resetPassword({
        token: resetToken,
        password: data.password,
      })
      toast.success('Password reset successfully! Please login.')
      navigate('/login')
    } catch {
      toast.error('Failed to reset password. Please try again.')
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-bg-primary px-4 py-16">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 text-center">
          <Link to="/" className="text-accent transition-colors hover:text-accent-hover">
            <h3>CoffeeClub</h3>
          </Link>
          <h2 className="mt-6">Reset Password</h2>
          <div className="mx-auto mt-4">
            <img src="/img/separator_dark.png" alt="" className="mx-auto" />
          </div>
          <p className="mt-4 text-sm text-text-muted">
            We will help you get back into your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="border-2 border-border bg-bg-card p-6 sm:p-8">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center text-sm transition-colors ${
                    index <= currentStepIndex
                      ? 'border-2 border-accent text-accent'
                      : 'border-2 border-border text-text-muted'
                  }`}
                >
                  {s.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 ${
                      index < currentStepIndex ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="mb-6 text-center text-sm text-text-muted">
            {step === 'email' &&
              'Enter your email or phone number to receive an OTP.'}
            {step === 'otp' && 'Enter the OTP sent to your email/phone.'}
            {step === 'password' && 'Create a new password for your account.'}
          </p>

          {/* Step 1: Email/Phone */}
          {step === 'email' && (
            <form
              onSubmit={emailForm.handleSubmit(handleSendOtp)}
              className="space-y-5"
            >
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                  Email or Phone
                </label>
                <input
                  type="text"
                  placeholder="your@email.com or 01712345678"
                  {...emailForm.register('emailOrPhone')}
                />
                {emailForm.formState.errors.emailOrPhone?.message && (
                  <p className="mt-1 text-xs text-error">
                    {emailForm.formState.errors.emailOrPhone.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="btn-vincent-filled w-full text-center disabled:opacity-50"
              >
                {emailForm.formState.isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>

              <p className="text-center text-sm text-text-muted">
                <Link
                  to="/login"
                  className="text-accent transition-colors hover:text-accent-hover"
                >
                  Back to Login
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form
              onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
              className="space-y-5"
            >
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                  OTP Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  {...otpForm.register('otp')}
                />
                {otpForm.formState.errors.otp?.message && (
                  <p className="mt-1 text-xs text-error">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={otpForm.formState.isSubmitting}
                className="btn-vincent-filled w-full text-center disabled:opacity-50"
              >
                {otpForm.formState.isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>

              <p className="text-center text-sm text-text-muted">
                Did not receive the code?{' '}
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-accent transition-colors hover:text-accent-hover"
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form
              onSubmit={resetForm.handleSubmit(handleResetPassword)}
              className="space-y-5"
            >
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    {...resetForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-accent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {resetForm.formState.errors.password?.message && (
                  <p className="mt-1 text-xs text-error">
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  {...resetForm.register('confirmPassword')}
                />
                {resetForm.formState.errors.confirmPassword?.message && (
                  <p className="mt-1 text-xs text-error">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="btn-vincent-filled w-full text-center disabled:opacity-50"
              >
                {resetForm.formState.isSubmitting
                  ? 'Resetting...'
                  : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
