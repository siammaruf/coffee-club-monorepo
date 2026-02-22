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
  bulkDelete: (ids: string[]) => httpService.delete('/reservations/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/reservations/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/reservations/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/reservations/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/reservations/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/reservations/bulk/permanent', { data: { ids } }),
};
