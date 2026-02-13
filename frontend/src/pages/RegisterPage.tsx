import { Coffee } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <>
      <title>Create Account | CoffeeClub</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="flex min-h-[80vh] items-center justify-center bg-dark px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Coffee className="h-10 w-10 text-primary-400" />
            <span className="font-heading text-2xl font-bold text-cream">
              Coffee<span className="text-primary-400">Club</span>
            </span>
          </Link>
          <h1 className="font-heading mt-4 text-2xl font-bold text-cream">Create Account</h1>
          <p className="mt-1 text-sm text-coffee-light">
            Join CoffeeClub and start ordering your favorites.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-primary-800/30 bg-dark-card p-6 shadow-lg sm:p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
    </>
  )
}
