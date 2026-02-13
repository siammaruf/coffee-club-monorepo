import type { MetaFunction } from 'react-router'
import { Coffee } from 'lucide-react'
import { Link } from 'react-router'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const meta: MetaFunction = () => [
  { title: 'Reset Password | CoffeeClub' },
  { name: 'description', content: 'Reset your CoffeeClub account password.' },
  { property: 'og:title', content: 'Reset Password | CoffeeClub' },
  { property: 'og:description', content: 'Reset your CoffeeClub account password.' },
  { property: 'og:type', content: 'website' },
]

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-warm-bg px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Coffee className="h-10 w-10 text-primary-500" />
            <span className="font-heading text-2xl font-bold text-text-primary">
              Coffee<span className="text-primary-500">Club</span>
            </span>
          </Link>
          <h1 className="font-heading mt-4 text-2xl font-bold text-text-primary">Reset Password</h1>
          <p className="mt-1 text-sm text-text-body">
            We will help you get back into your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
