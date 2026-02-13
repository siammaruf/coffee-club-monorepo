import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

type Step = 'email' | 'otp' | 'password'

export function ForgotPasswordForm() {
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
      // Backend returns a reset token that must be used in the reset-password step
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
    <div>
      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, index) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                index < currentStepIndex
                  ? 'bg-primary-600 text-white'
                  : index === currentStepIndex
                    ? 'bg-primary-500 text-white'
                    : 'bg-warm-surface text-text-muted'
              }`}
            >
              {index < currentStepIndex ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                s.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 ${
                  index < currentStepIndex ? 'bg-primary-500' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="mb-6 text-center text-sm text-text-body">
        {step === 'email' && 'Enter your email or phone number to receive an OTP.'}
        {step === 'otp' && 'Enter the OTP sent to your email/phone.'}
        {step === 'password' && 'Create a new password for your account.'}
      </p>

      {/* Step 1: Email/Phone */}
      {step === 'email' && (
        <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-5">
          <Input
            label="Email or Phone"
            type="text"
            placeholder="your@email.com or 01712345678"
            icon={<Mail className="h-5 w-5" />}
            error={emailForm.formState.errors.emailOrPhone?.message}
            {...emailForm.register('emailOrPhone')}
          />

          <Button type="submit" isLoading={emailForm.formState.isSubmitting} className="w-full" size="lg">
            Send OTP
          </Button>

          <p className="text-center text-sm text-text-body">
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </p>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-5">
          <Input
            label="OTP Code"
            type="text"
            placeholder="Enter 6-digit OTP"
            icon={<KeyRound className="h-5 w-5" />}
            error={otpForm.formState.errors.otp?.message}
            maxLength={6}
            {...otpForm.register('otp')}
          />

          <Button type="submit" isLoading={otpForm.formState.isSubmitting} className="w-full" size="lg">
            Verify OTP
          </Button>

          <p className="text-center text-sm text-text-body">
            Did not receive the code?{' '}
            <button
              type="button"
              onClick={() => setStep('email')}
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Resend
            </button>
          </p>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 'password' && (
        <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-5">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              icon={<Lock className="h-5 w-5" />}
              error={resetForm.formState.errors.password?.message}
              {...resetForm.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-text-muted hover:text-primary-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat your password"
            icon={<Lock className="h-5 w-5" />}
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register('confirmPassword')}
          />

          <Button type="submit" isLoading={resetForm.formState.isSubmitting} className="w-full" size="lg">
            Reset Password
          </Button>
        </form>
      )}
    </div>
  )
}
