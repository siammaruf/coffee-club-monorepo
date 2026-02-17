import { useState, useEffect } from 'react'
import type { MetaFunction } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { profileService } from '@/services/httpServices/profileService'
import { profileSchema } from '@/utils/validations/profile'
import type { ProfileFormData } from '@/utils/validations/profile'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'My Profile | CoffeeClub' },
  {
    name: 'description',
    content: 'Manage your CoffeeClub account information and preferences.',
  },
  { name: 'robots', content: 'noindex, nofollow' },
]

export default function ProfilePage() {
  const { customer, updateCustomer } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
    },
  })

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
      })
    }
  }, [customer, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      const updated = await profileService.updateProfile({
        name: data.name.trim(),
        email: data.email || undefined,
        phone: data.phone,
        address: data.address || undefined,
      })
      updateCustomer(updated)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    try {
      const updated = await profileService.uploadPicture(file)
      updateCustomer(updated)
      toast.success('Profile picture updated!')
    } catch {
      toast.error('Failed to upload picture')
    }
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>My Profile</h1>
      </div>

      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="mx-auto max-w-2xl">
            {/* Points & Balance */}
            {customer && (
              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="border-2 border-border bg-bg-card p-5 text-center">
                  <p className="text-xs uppercase tracking-[2px] text-text-muted">
                    Loyalty Points
                  </p>
                  <p className="mt-2 text-2xl text-accent">
                    {customer?.points ?? 0}
                  </p>
                </div>
                <div className="border-2 border-border bg-bg-card p-5 text-center">
                  <p className="text-xs uppercase tracking-[2px] text-text-muted">
                    Balance
                  </p>
                  <p className="mt-2 text-2xl text-success">
                    {formatPrice(customer?.balance ?? 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Profile Card */}
            <div className="border-2 border-border bg-bg-card p-6 sm:p-8">
              {/* Avatar */}
              <div className="mb-8 flex items-center gap-6">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden border-2 border-accent">
                    {customer?.picture ? (
                      <img
                        src={customer.picture}
                        alt={customer?.name ?? 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-accent">
                        {customer?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center border border-border bg-bg-lighter text-text-muted transition-colors hover:text-link-hover">
                    <span className="text-xs">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h4>{customer?.name || 'User'}</h4>
                  <p className="mt-1 text-sm text-text-muted">
                    {customer?.phone || ''}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    {...register('name')}
                  />
                  {errors.name?.message && (
                    <p className="mt-1 text-xs text-error">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                  />
                  {errors.email?.message && (
                    <p className="mt-1 text-xs text-error">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="01712345678"
                    {...register('phone')}
                  />
                  {errors.phone?.message && (
                    <p className="mt-1 text-xs text-error">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[2px] text-text-muted">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Your delivery address"
                    {...register('address')}
                  />
                  {errors.address?.message && (
                    <p className="mt-1 text-xs text-error">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-vincent-filled disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
