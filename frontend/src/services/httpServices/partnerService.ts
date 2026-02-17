import { get } from '../httpMethods'
import type { Partner } from '@/types/partner'

export const partnerService = {
  getPartners: () =>
    get<{ data: Partner[] }>('/public/partners').then((res) => res.data),
}
