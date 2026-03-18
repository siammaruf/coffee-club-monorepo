import { useState, useEffect, useRef } from 'react'
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

type PhoneVerifyState = 'idle' | 'otp-sent' | 'verified'

export default function ProfilePage() {
  const { customer, updateCustomer } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Phone verification state
  const [phoneVerifyState, setPhoneVerifyState] = useState<PhoneVerifyState>('idle')
  const [phoneEditMode, setPhoneEditMode] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

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
      address: customer?.address || '',
    },
  })

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || '',
        email: customer.email || '',
        address: customer.address || '',
      })
    }
  }, [customer, reset])

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      const updated = await profileService.updateProfile({
        name: data.name.trim(),
        email: data.email || undefined,
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

  const handleSendOtp = async () => {
    if (!newPhone.trim()) {
      toast.error('Please enter a phone number')
      return
    }
    setPhoneLoading(true)
    try {
      await profileService.sendPhoneOtp(newPhone.trim())
      setPhoneVerifyState('otp-sent')
      setOtpDigits(['', '', '', '', '', ''])
      setResendTimer(30)
      toast.success('OTP sent to your phone number')
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('')
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }
    setPhoneLoading(true)
    try {
      const response = await profileService.verifyPhoneOtp(newPhone.trim(), otp)
      setPhoneVerifyState('verified')
      setPhoneEditMode(false)
      updateCustomer(response.data ?? { ...customer!, phone: newPhone.trim(), phone_verified: true })
      toast.success('Phone number verified successfully!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const updated = [...otpDigits]
    updated[index] = value.slice(-1)
    setOtpDigits(updated)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const updated = Array.from({ length: 6 }, (_, i) => text[i] || '')
    setOtpDigits(updated)
    const nextEmpty = updated.findIndex((d) => !d)
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()
  }

  const isPhoneVerified = customer?.phone_verified ?? false

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
            {customer && customer.customer_type === 'member' && (
              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="border-2 border-border bg-bg-card p-5 text-center">
                  <p className="text-xs uppercase tracking-[2px] text-text-muted">
                    Loyalty Points
                  </p>
                  <p className="mt-2 text-2xl text-accent">{customer?.points ?? 0}</p>
                </div>
                <div className="border-2 border-border bg-bg-card p-5 text-center">
                  <p className="text-xs uppercase tracking-[2px] text-text-muted">Balance</p>
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
                  <p className="mt-1 text-sm text-text-muted">{customer?.phone || ''}</p>
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
                    <p className="mt-1 text-xs text-error">{errors.name.message}</p>
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
                    <p className="mt-1 text-xs text-error">{errors.email.message}</p>
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
                    <p className="mt-1 text-xs text-error">{errors.address.message}</p>
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

            {/* Phone Verification Card */}
            <div className="mt-6 border-2 border-border bg-bg-card p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between">
                <h5 className="text-xs uppercase tracking-[2px] text-text-muted">
                  Phone Number
                </h5>
                {isPhoneVerified ? (
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <span>✓</span> Verified
                  </span>
                ) : (
                  <span className="text-xs text-amber-400">Not Verified</span>
                )}
              </div>

              {/* Current phone display */}
              {!phoneEditMode && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-primary">{customer?.phone || '—'}</p>
                  {phoneVerifyState !== 'otp-sent' && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneEditMode(true)
                        setNewPhone(customer?.phone || '')
                        setPhoneVerifyState('idle')
                      }}
                      className="btn-vincent text-xs"
                    >
                      Change &amp; Verify
                    </button>
                  )}
                </div>
              )}

              {/* Edit phone + send OTP */}
              {phoneEditMode && phoneVerifyState === 'idle' && (
                <div className="space-y-3">
                  <input
                    type="tel"
                    placeholder="Enter new phone number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={phoneLoading}
                      className="btn-vincent-filled disabled:opacity-50"
                    >
                      {phoneLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneEditMode(false)}
                      className="btn-vincent"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* OTP input */}
              {phoneVerifyState === 'otp-sent' && (
                <div className="space-y-4">
                  <p className="text-sm text-text-muted">
                    OTP sent to <span className="text-text-primary">{newPhone}</span>. Enter the
                    6-digit code below.
                  </p>
                  <div className="flex gap-2">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="h-11 w-10 border border-border bg-bg-lighter text-center text-lg text-text-primary focus:border-accent focus:outline-none"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={phoneLoading || otpDigits.join('').length < 6}
                      className="btn-vincent-filled disabled:opacity-50"
                    >
                      {phoneLoading ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0 || phoneLoading}
                      className="text-xs text-text-muted disabled:opacity-40 hover:text-link-hover disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
