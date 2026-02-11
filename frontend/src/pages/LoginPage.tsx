import { Coffee } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <>
      <title>Login | CoffeeClub</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="flex min-h-[80vh] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Coffee className="h-10 w-10 text-primary-500" />
            <span className="text-2xl font-bold text-coffee">
              Coffee<span className="text-primary-500">Club</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-coffee">Welcome Back</h1>
          <p className="mt-1 text-sm text-coffee-light">
            Sign in to your account to continue ordering.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-lg sm:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
    </>
  )
}
