import { ProfileForm } from '@/components/profile/ProfileForm'

export default function ProfilePage() {
  return (
    <>
      <title>My Profile | CoffeeClub</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-coffee sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-coffee-light">
          Manage your account information and preferences.
        </p>

        {/* Profile Form */}
        <div className="mt-8 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
          <ProfileForm />
        </div>
      </div>
    </div>
    </>
  )
}
