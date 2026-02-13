import { Banknote, Smartphone, CreditCard, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/order'

interface PaymentSelectorProps {
  selected: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof Banknote; description: string }[] = [
  { value: 'CASH', label: 'Cash', icon: Banknote, description: 'Pay with cash on delivery' },
  { value: 'BKASH', label: 'bKash', icon: Smartphone, description: 'Pay via bKash mobile banking' },
  { value: 'BANK', label: 'Bank Card', icon: CreditCard, description: 'Pay with debit or credit card' },
  { value: 'OTHER', label: 'Other', icon: Wallet, description: 'Other payment methods' },
]

export function PaymentSelector({ selected, onChange }: PaymentSelectorProps) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-text-primary">
        Payment Method
      </label>
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const isActive = selected === method.value
          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onChange(method.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200',
                isActive
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-border bg-white hover:border-primary-400'
              )}
            >
              <method.icon className={cn(
                'h-6 w-6',
                isActive ? 'text-primary-600' : 'text-text-muted'
              )} />
              <span className={cn(
                'text-sm font-semibold',
                isActive ? 'text-primary-600' : 'text-text-primary'
              )}>
                {method.label}
              </span>
              <span className="text-xs text-text-muted">
                {method.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
