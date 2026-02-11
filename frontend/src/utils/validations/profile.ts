import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
