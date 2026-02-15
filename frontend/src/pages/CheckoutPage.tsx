import { useState } from 'react'
import type { MetaFunction } from 'react-router'
import { Link } from 'react-router'
import { ShoppingCart, CheckCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch } from '@/redux/store/hooks'
import { createOrderThunk } from '@/redux/features/orderSlice'
import { formatPrice } from '@/lib/utils'
import type { PaymentMethod } from '@/types/order'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Checkout | CoffeeClub' },
  { name: 'description', content: 'Complete your order at CoffeeClub.' },
  { name: 'robots', content: 'noindex, nofollow' },
]

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required').or(z.literal('')).optional(),
  address: z.string().min(1, 'Delivery address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const { items, total, clearCart } = useCart()
  const { customer, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      address: customer?.address ?? '',
      city: '',
      state: '',
      zip: '',
      notes: '',
    },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (!items || items.length === 0) return

    setIsSubmitting(true)
    try {
      // Build delivery address from fields
      const addressParts = [data.address, data.city, data.state, data.zip].filter(Boolean)
      const deliveryAddress = addressParts.join(', ')

      await dispatch(
        createOrderThunk({
          order_type: 'DELIVERY',
          payment_method: paymentMethod,
          delivery_address: deliveryAddress,
          special_instructions: data.notes,
          items: items.map((ci) => ({
            item_id: ci?.item?.id ?? '',
            quantity: ci?.quantity ?? 1,
          })),
        })
      ).unwrap()

      clearCart()
      setIsOrderPlaced(true)
      toast.success('Order placed successfully!')
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to place order'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success State
  if (isOrderPlaced) {
    return (
      <>
        <div className="page-title-block">
          <h1>Order Confirmed</h1>
        </div>
        <div className="bg-bg-primary py-20">
          <div className="vincent-container text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-success">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h3 className="mt-8">Order Placed Successfully!</h3>
            <p className="mx-auto mt-4 max-w-md text-text-muted">
              Your order has been confirmed. You can track your order status from the orders page.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link to="/orders" className="btn-vincent-filled">
                View My Orders
              </Link>
              <Link to="/menu" className="btn-vincent">
                Order More
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Empty Cart State
  if (!items || items.length === 0) {
    return (
      <>
        <div className="page-title-block">
          <h1>Checkout</h1>
        </div>
        <div className="bg-bg-primary py-20">
          <div className="vincent-container text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-border">
              <ShoppingCart className="h-12 w-12 text-text-muted" />
            </div>
            <h3 className="mt-8">Your cart is empty</h3>
            <p className="mt-4 text-text-muted">
              Add some items to your cart before checking out.
            </p>
            <Link to="/menu" className="btn-vincent-filled mt-8 inline-block">
              Browse Menu
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Checkout</h1>
      </div>

      <div className="bg-bg-primary">
        <div className="vincent-container py-16">
          {/* Info Banners */}
          {!isAuthenticated && (
            <div className="mb-6 border border-border bg-bg-card px-6 py-3">
              <span className="text-sm text-text-body">
                Returning customer?{' '}
                <Link to="/login" className="text-accent hover:text-link-hover">
                  Click here to login
                </Link>
              </span>
            </div>
          )}
          <div className="mb-8 border border-border bg-bg-card px-6 py-3">
            <span className="text-sm text-text-body">
              Have a coupon?{' '}
              <button
                type="button"
                onClick={() => setShowCoupon(!showCoupon)}
                className="text-accent hover:text-link-hover"
              >
                Click here to enter your code
              </button>
            </span>
          </div>

          {/* Coupon Input (toggle) */}
          {showCoupon && (
            <div className="mb-8 flex gap-0">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="w-64 border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <button type="button" className="btn-vincent border-l-0">
                Apply coupon
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Billing & Additional Info - 2 column form */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {/* Left Column: Billing Details */}
              <div>
                <h3 className="mb-6">Billing Details</h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-text-muted">Name *</label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary focus:border-accent focus:outline-none"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-error">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-text-muted">Phone *</label>
                    <input
                      type="text"
                      {...register('phone')}
                      className="w-full border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary focus:border-accent focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-error">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-text-muted">Email address</label>
                    <input
                      type="text"
                      {...register('email')}
                      className="w-full border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary focus:border-accent focus:outline-none"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-error">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-text-muted">Street address *</label>
                    <input
                      type="text"
                      {...register('address')}
                      placeholder="House number and street name"
                      className="w-full border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-error">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-text-muted">Town / City</label>
                    <input
                      type="text"
                      {...register('city')}
                      className="w-full border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-text-muted">State / County</label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-text-muted">Postcode / ZIP</label>
                    <input
                      type="text"
                      {...register('zip')}
                      className="w-full border-2 border-border bg-transparent px-4 py-1.5 text-sm tracking-[3px] text-text-primary focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Additional Information */}
              <div>
                <h3 className="mb-6">Additional Information</h3>
                <div>
                  <p className="mb-2 text-sm text-text-muted">Order notes (optional)</p>
                  <textarea
                    {...register('notes')}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    className="h-32 w-full resize-none border-2 border-border bg-transparent px-4 py-2 text-sm tracking-[3px] text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Your Order Table */}
            <div className="mt-12">
              <h3 className="mb-6">Your Order</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                      Product
                    </th>
                    <th className="pb-3 text-right font-heading text-sm uppercase tracking-[3px] text-text-muted">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map((cartItem) => {
                    const price = cartItem?.item?.sale_price ?? cartItem?.item?.regular_price ?? 0
                    const lineTotal = price * (cartItem?.quantity ?? 0)
                    return (
                      <tr key={cartItem?.id} className="border-b border-border">
                        <td className="py-3 text-sm text-text-primary">
                          {cartItem?.item?.name ?? ''}{' '}
                          <strong className="text-text-muted">x {cartItem?.quantity ?? 0}</strong>
                        </td>
                        <td className="py-3 text-right text-sm text-text-primary">
                          {formatPrice(lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-b border-border">
                    <th className="py-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                      Subtotal
                    </th>
                    <td className="py-3 text-right text-sm text-text-primary">
                      {formatPrice(total)}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <th className="py-3 text-left font-heading text-sm uppercase tracking-[3px] text-text-muted">
                      Total
                    </th>
                    <td className="py-3 text-right text-sm font-bold text-accent">
                      {formatPrice(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment Method */}
            <div className="mt-10 border-t border-border pt-8">
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="text-sm text-text-primary">Cash on Delivery</span>
                </label>
                {paymentMethod === 'CASH' && (
                  <div className="ml-7 border-l-2 border-border pl-4">
                    <p className="text-xs text-text-muted">
                      Pay with cash upon delivery. Please make sure you have the exact amount ready.
                    </p>
                  </div>
                )}

                <label className="flex cursor-not-allowed items-center gap-3 opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    value="BKASH"
                    disabled
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="text-sm text-text-primary">Online Payment</span>
                  <span className="text-xs text-text-muted">(Coming soon)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-vincent-filled mt-8 flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Place Order
              </button>
            </div>
          </form>

          {/* Back to cart */}
          <div className="mt-8">
            <Link
              to="/cart"
              className="text-sm uppercase tracking-[2px] text-text-muted transition-colors hover:text-link-hover"
            >
              &larr; Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
