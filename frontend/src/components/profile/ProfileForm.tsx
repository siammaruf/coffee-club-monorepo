import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Camera, Award, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { profileService } from '@/services/httpServices/profileService'
import { profileSchema } from '@/utils/validations/profile'
import type { ProfileFormData } from '@/utils/validations/profile'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export function ProfileForm() {
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

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="space-y-8">
      {/* Points & Balance Section */}
      {customer && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <Award className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-coffee-light">Loyalty Points</p>
              <p className="text-xl font-bold text-primary-600">{customer.points}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Wallet className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-coffee-light">Balance</p>
              <p className="text-xl font-bold text-success">{formatPrice(customer.balance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg">
            {customer?.picture ? (
              <img
                src={customer.picture}
                alt={customer.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-white">
                {customer?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-primary-50">
            <Camera className="h-4 w-4 text-primary-600" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePictureUpload}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-bold text-coffee">{customer?.name || 'User'}</h3>
          <p className="text-sm text-coffee-light">{customer?.phone || ''}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Your full name"
          icon={<User className="h-5 w-5" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="01712345678"
          icon={<Phone className="h-5 w-5" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Address"
          type="text"
          placeholder="Your delivery address"
          icon={<MapPin className="h-5 w-5" />}
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="pt-2">
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
