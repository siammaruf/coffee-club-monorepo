import { MapPin, Phone, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { DeliveryFormData } from '@/utils/validations/checkout'

interface DeliveryFormProps {
  register: UseFormRegister<DeliveryFormData>
  errors: FieldErrors<DeliveryFormData>
}

export function DeliveryForm({ register, errors }: DeliveryFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Delivery Address"
        type="text"
        placeholder="House #, Road #, Area"
        icon={<MapPin className="h-5 w-5" />}
        error={errors.address?.message}
        {...register('address')}
      />

      <Input
        label="City"
        type="text"
        placeholder="Dhaka"
        error={errors.city?.message}
        {...register('city')}
      />

      <Input
        label="Contact Phone"
        type="tel"
        placeholder="01712345678"
        icon={<Phone className="h-5 w-5" />}
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-cream">
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-coffee-light" />
            Delivery Notes
          </span>
        </label>
        <textarea
          placeholder="Any special delivery instructions..."
          rows={3}
          className="w-full rounded-lg border border-primary-800/40 bg-dark-card px-4 py-2.5 text-sm text-cream shadow-sm transition-colors placeholder:text-coffee-light/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          {...register('notes')}
        />
      </div>
    </div>
  )
}
