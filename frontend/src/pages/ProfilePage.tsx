import type { MetaFunction } from 'react-router'
import { PageBanner } from '@/components/ui/PageBanner'
import { ProfileForm } from '@/components/profile/ProfileForm'

export const meta: MetaFunction = () => [
  { title: 'My Profile | CoffeeClub' },
  { name: 'description', content: 'Manage your CoffeeClub account information and preferences.' },
  { property: 'og:title', content: 'My Profile | CoffeeClub' },
  { property: 'og:description', content: 'Manage your CoffeeClub account information and preferences.' },
  { property: 'og:type', content: 'website' },
]

export default function ProfilePage() {
  return (
    <>
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
