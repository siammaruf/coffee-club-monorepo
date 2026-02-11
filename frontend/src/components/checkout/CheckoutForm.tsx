import { useState, useEffect } from 'react'
import { Store, Package, Truck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DeliveryForm } from './DeliveryForm'
import { PaymentSelector } from './PaymentSelector'
import { useCart } from '@/hooks/useCart'
import { orderService } from '@/services/httpServices/orderService'
import { useTables } from '@/services/httpServices/queries'
import { deliverySchema } from '@/utils/validations/checkout'
import type { DeliveryFormData } from '@/utils/validations/checkout'
import type { OrderType, PaymentMethod } from '@/types/order'
import toast from 'react-hot-toast'

const orderTypes: { value: OrderType; label: string; icon: typeof Store }[] = [
  { value: 'DINEIN', label: 'Dine-in', icon: Store },
  { value: 'TAKEAWAY', label: 'Pickup', icon: Package },
  { value: 'DELIVERY', label: 'Delivery', icon: Truck },
]

interface CheckoutFormProps {
  onOrderTypeChange: (type: OrderType) => void
  onDeliveryAddressChange: (address: string) => void
  onOrderPlaced: () => void
}

export function CheckoutForm({ onOrderTypeChange, onDeliveryAddressChange, onOrderPlaced }: CheckoutFormProps) {
  const [orderType, setOrderType] = useState<OrderType>('DINEIN')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [selectedTable, setSelectedTable] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { items, clearCart } = useCart()

  const { data: tablesData = [] } = useTables()

  const {
    register: deliveryRegister,
    handleSubmit: handleDeliverySubmit,
    formState: { errors: deliveryErrors },
    reset: resetDeliveryForm,
    getValues: getDeliveryValues,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    mode: 'onChange',
  })

  useEffect(() => {
    onOrderTypeChange(orderType)
  }, [orderType, onOrderTypeChange])

  useEffect(() => {
    if (orderType === 'DELIVERY') {
      const values = getDeliveryValues()
      const fullAddress = [values.address, values.city].filter(Boolean).join(', ')
      onDeliveryAddressChange(fullAddress)
    }
  }, [orderType, onDeliveryAddressChange, getDeliveryValues])

  useEffect(() => {
    if (orderType !== 'DELIVERY') {
      resetDeliveryForm()
    }
  }, [orderType, resetDeliveryForm])

  const placeOrder = async (deliveryData?: DeliveryFormData) => {
    if (orderType === 'DINEIN' && !selectedTable) {
      toast.error('Please select a table')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        order_type: orderType,
        payment_method: paymentMethod,
        special_instructions: specialInstructions || undefined,
        delivery_address: orderType === 'DELIVERY' && deliveryData
          ? [deliveryData.address, deliveryData.city].filter(Boolean).join(', ')
          : undefined,
        table_ids: orderType === 'DINEIN' && selectedTable ? [selectedTable] : undefined,
        items: items.map((ci) => ({
          item_id: ci.item.id,
          quantity: ci.quantity,
        })),
      }

      await orderService.createOrder(payload)
      clearCart()
      toast.success('Order placed successfully!')
      onOrderPlaced()
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (orderType === 'DELIVERY') {
      // Trigger RHF validation for delivery fields, then place order
      handleDeliverySubmit((deliveryData) => placeOrder(deliveryData))()
    } else {
      placeOrder()
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Order Type Tabs */}
      <div>
        <label className="mb-3 block text-sm font-medium text-coffee">
          Order Type
        </label>
        <div className="flex gap-2 rounded-xl bg-cream p-1.5">
          {orderTypes.map((type) => {
            const isActive = orderType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setOrderType(type.value)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'text-coffee-light hover:text-coffee'
                )}
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dine-in: Table Selection */}
      {orderType === 'DINEIN' && (
        <div>
          <label className="mb-3 block text-sm font-medium text-coffee">
            Select Table
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {tablesData.map((table) => {
              const isAvailable = table.status === 'AVAILABLE'
              const isSelected = selectedTable === table.id
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => isAvailable && setSelectedTable(table.id)}
                  disabled={!isAvailable}
                  className={cn(
                    'rounded-lg border-2 p-3 text-center transition-all',
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : isAvailable
                        ? 'border-primary-100 bg-white hover:border-primary-300'
                        : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                  )}
                >
                  <p className={cn(
                    'text-sm font-bold',
                    isSelected ? 'text-primary-700' : isAvailable ? 'text-coffee' : 'text-gray-400'
                  )}>
                    {table.name}
                  </p>
                  <p className="text-xs text-coffee-light">
                    {table.capacity} seats
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Delivery: Address Form */}
      {orderType === 'DELIVERY' && (
        <DeliveryForm register={deliveryRegister} errors={deliveryErrors} />
      )}

      {/* Payment Method */}
      <PaymentSelector selected={paymentMethod} onChange={setPaymentMethod} />

      {/* Special Instructions */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-coffee">
          Special Instructions
        </label>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="Any special requests for your order..."
          rows={3}
          className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-coffee shadow-sm transition-colors placeholder:text-coffee-light/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Place Order Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
        disabled={items.length === 0}
      >
        Place Order
      </Button>
    </form>
  )
}
