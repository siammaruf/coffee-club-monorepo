import { useMutation, useQuery } from '@tanstack/react-query'
import { reservationService } from '../reservationService'
import type { CreateReservationPayload } from '@/types/reservation'

export const reservationKeys = {
  all: ['reservations'] as const,
  myList: (params: { page?: number; limit?: number }) =>
    [...reservationKeys.all, 'my', params] as const,
}

export function useCreateReservation() {
  return useMutation({
    mutationFn: (data: CreateReservationPayload) =>
      reservationService.createReservation(data),
  })
}

export function useMyReservations(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: reservationKeys.myList(params ?? {}),
    queryFn: () => reservationService.getMyReservations(params),
  })
}
