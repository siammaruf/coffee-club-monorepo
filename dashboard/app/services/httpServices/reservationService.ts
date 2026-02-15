import { httpService } from '../httpService';
import type {
  Reservation,
  ReservationListResponse,
  GetAllReservationsParams,
  UpdateReservationPayload,
} from '~/types/reservation';

export const reservationService = {
  getAll: (params?: GetAllReservationsParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<ReservationListResponse>('/reservations', config);
  },
  getById: (id: string) => httpService.get<{ data: Reservation }>(`/reservations/${id}`),
  update: (id: string, data: UpdateReservationPayload) =>
    httpService.put<{ data: Reservation }>(`/reservations/${id}`, data),
  delete: (id: string) => httpService.delete(`/reservations/${id}`),
};
