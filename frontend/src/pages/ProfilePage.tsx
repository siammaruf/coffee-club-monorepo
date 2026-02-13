import { PageBanner } from '@/components/ui/PageBanner'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default function ProfilePage() {
  return (
    <>
      <title>My Profile | CoffeeClub</title>
      <meta name="robots" content="noindex, nofollow" />
    <div className="min-h-screen bg-dark">
      <PageBanner
        title="My Profile"
        subtitle="Manage your account information and preferences."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Profile' }]}
      />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Form */}
        <div className="rounded-2xl border border-primary-800/30 bg-dark-card p-6 shadow-sm sm:p-8">
          <ProfileForm />
        </div>
      </div>
    </div>
    </>
  )
}
