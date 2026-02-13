import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema } from '@/utils/validations/auth'
import type { LoginFormData } from '@/utils/validations/auth'
import toast from 'react-hot-toast'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email or Phone"
        type="text"
        placeholder="your@email.com or 01712345678"
        icon={<Mail className="h-5 w-5" />}
        error={errors.emailOrPhone?.message}
        autoComplete="email"
        {...register('emailOrPhone')}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          icon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-coffee-light hover:text-primary-400"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-primary-800/40 bg-dark-card text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-coffee-light">Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-primary-400 hover:text-primary-300"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
        Login
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary-800/30" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-dark-card px-2 text-coffee-light">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-coffee-light">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300">
          Register
        </Link>
      </p>
    </form>
  )
}
