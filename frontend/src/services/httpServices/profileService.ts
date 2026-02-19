import { get, put } from '../httpMethods'
import httpService from '../httpService'
import type { Customer, UpdateProfilePayload, ChangePasswordPayload } from '@/types/customer'

export const profileService = {
  /** GET /customer-auth/me -- reuses the auth "me" endpoint for profile */
  getProfile: () =>
    get<{ data: Customer }>('/customer-auth/me').then((res) => res.data),

  /** PUT /customer-auth/profile -- update name, email, phone, address */
  updateProfile: (payload: UpdateProfilePayload) =>
    put<{ data: Customer }>('/customer-auth/profile', payload).then((res) => res.data),

  /** PUT /customer-auth/profile/password -- change password */
  changePassword: (payload: ChangePasswordPayload) =>
    put<{ message: string }>('/customer-auth/profile/password', payload),

  /** PUT /customer-auth/profile/picture with multipart form data for picture upload */
  uploadPicture: async (file: File): Promise<Customer> => {
    const formData = new FormData()
    formData.append('picture', file)
    const response = await httpService.put<{ data: Customer }>('/customer-auth/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },
}
