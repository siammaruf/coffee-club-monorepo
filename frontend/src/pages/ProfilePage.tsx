import { SEO } from '@/components/SEO'
import { PageBanner } from '@/components/ui/PageBanner'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default function ProfilePage() {
  return (
    <>
      <SEO title="My Profile" description="Manage your CoffeeClub account information and preferences." />

      <PageBanner
        title="My Profile"
        subtitle="Manage your account information and preferences."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Profile' }]}
      />

      <div className="bg-warm-bg">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Profile Form */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <ProfileForm />
          </div>
        </div>
      </div>
    </>
  )
}
