import { get, post } from '../httpMethods'
import type { Reservation, CreateReservationPayload } from '@/types/reservation'

export const reservationService = {
  createReservation: (data: CreateReservationPayload) =>
    post<{ data: Reservation }>('/public/reservations', data).then((res) => res.data),

  getMyReservations: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.limit) searchParams.append('limit', String(params.limit))
    return get<{ data: Reservation[]; total: number; page: number; limit: number; totalPages: number }>(
      '/customer/reservations',
      { params: searchParams }
    )
  },
}
