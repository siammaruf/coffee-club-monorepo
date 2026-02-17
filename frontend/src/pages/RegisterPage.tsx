import { useState } from 'react'
import type { MetaFunction } from 'react-router'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema } from '@/utils/validations/auth'
import type { RegisterFormData } from '@/utils/validations/auth'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Create Account | CoffeeClub' },
  {
    name: 'description',
    content: 'Join CoffeeClub and start ordering your favorites.',
  },
  { name: 'robots', content: 'noindex, nofollow' },
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    try {
      await registerUser({
        name: data.name.trim(),
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      toast.success('Account created successfully!')
      navigate('/')
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-bg-primary px-4 py-16">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 text-center">
          <h2>Create Account</h2>
          <div className="mx-auto mt-4">
            <img src="/img/separator_dark.png" alt="" className="mx-auto" />
          </div>
          <p className="mt-4 text-sm text-text-muted">
            Join CoffeeClub and start ordering your favorites.
          </p>
        </div>

        {/* Form Card */}
        <div className="border-2 border-border bg-bg-card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name?.message && (
                <p className="mt-1 text-xs text-error">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email?.message && (
                <p className="mt-1 text-xs text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="01712345678"
                autoComplete="tel"
                {...register('phone')}
              />
              {errors.phone?.message && (
                <p className="mt-1 text-xs text-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-link-hover"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password?.message && (
                <p className="mt-1 text-xs text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-link-hover"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword?.message && (
                <p className="mt-1 text-xs text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 border-2 border-border bg-transparent accent-accent"
                  {...register('agreeTerms')}
                />
                <span className="text-xs text-text-muted">
                  I agree to the{' '}
                  <a href="#" className="text-accent hover:text-link-hover">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-accent hover:text-link-hover">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-error">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-vincent-filled w-full text-center disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Sign Up'}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-accent transition-colors hover:text-link-hover"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
