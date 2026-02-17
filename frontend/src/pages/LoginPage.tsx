import { useState } from 'react'
import type { MetaFunction } from 'react-router'
import { Link, useNavigate, useLocation } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '@/utils/validations/auth'
import type { LoginFormData } from '@/utils/validations/auth'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Login | CoffeeClub' },
  {
    name: 'description',
    content: 'Sign in to your CoffeeClub account to continue ordering.',
  },
  { name: 'robots', content: 'noindex, nofollow' },
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login({
        identifier: data.emailOrPhone,
        password: data.password,
      })
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-bg-primary px-4 py-16">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 text-center">
          <h2>Login</h2>
          <div className="mx-auto mt-4">
            <img src="/img/separator_dark.png" alt="" className="mx-auto" />
          </div>
          <p className="mt-4 text-sm text-text-muted">
            Sign in to your account to continue ordering.
          </p>
        </div>

        {/* Form Card */}
        <div className="border-2 border-border bg-bg-card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email or Phone */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                Email or Phone
              </label>
              <input
                type="text"
                placeholder="your@email.com or 01712345678"
                autoComplete="email"
                {...register('emailOrPhone')}
              />
              {errors.emailOrPhone?.message && (
                <p className="mt-1 text-xs text-error">
                  {errors.emailOrPhone.message}
                </p>
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs uppercase tracking-[2px] text-text-muted transition-colors hover:text-link-hover"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-vincent-filled w-full text-center disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>

            {/* Register Link */}
            <p className="text-center text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-accent transition-colors hover:text-link-hover"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
