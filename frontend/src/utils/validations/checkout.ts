import { z } from 'zod'

export const deliverySchema = z.object({
  address: z.string().min(1, 'Delivery address is required'),
  city: z.string().optional(),
  phone: z.string().min(1, 'Contact phone is required'),
  notes: z.string().optional(),
})

export type DeliveryFormData = z.infer<typeof deliverySchema>
