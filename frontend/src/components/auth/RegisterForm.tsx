import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema } from '@/utils/validations/auth'
import type { RegisterFormData } from '@/utils/validations/auth'
import toast from 'react-hot-toast'

export function RegisterForm() {
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
      await registerUser({ name: data.name.trim(), email: data.email, phone: data.phone, password: data.password })
      toast.success('Account created successfully!')
      navigate('/')
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        icon={<User className="h-5 w-5" />}
        error={errors.name?.message}
        autoComplete="name"
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        icon={<Mail className="h-5 w-5" />}
        error={errors.email?.message}
        autoComplete="email"
        {...register('email')}
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="01712345678"
        icon={<Phone className="h-5 w-5" />}
        error={errors.phone?.message}
        autoComplete="tel"
        {...register('phone')}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 8 characters"
          icon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          autoComplete="new-password"
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

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          icon={<Lock className="h-5 w-5" />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-[38px] text-coffee-light hover:text-primary-400"
          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-primary-800/40 bg-dark-card text-primary-500 focus:ring-primary-500"
            {...register('agreeTerms')}
          />
          <span className="text-sm text-coffee-light">
            I agree to the{' '}
            <a href="#" className="font-medium text-primary-400 hover:text-primary-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-primary-400 hover:text-primary-300">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="mt-1 text-sm text-error">{errors.agreeTerms.message}</p>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
        Create Account
      </Button>

      <p className="text-center text-sm text-coffee-light">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300">
          Login
        </Link>
      </p>
    </form>
  )
}
