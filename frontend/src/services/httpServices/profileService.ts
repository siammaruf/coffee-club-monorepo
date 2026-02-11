import { get, put } from '../httpMethods'
import httpService from '../httpService'
import type { Customer, UpdateProfilePayload, ChangePasswordPayload } from '@/types/customer'

export const profileService = {
  getProfile: () =>
    get<{ data: Customer }>('/customer/profile').then((res) => res.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    put<{ data: Customer }>('/customer/profile', payload).then((res) => res.data),

  changePassword: (payload: ChangePasswordPayload) =>
    put<{ message: string }>('/customer/profile/password', payload),

  uploadPicture: async (file: File): Promise<Customer> => {
    const formData = new FormData()
    formData.append('picture', file)
    const response = await httpService.put<{ data: Customer }>('/customer/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },
}
