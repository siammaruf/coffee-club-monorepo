export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type EventType = 'DINING' | 'BIRTHDAY' | 'MEETING' | 'PRIVATE_EVENT' | 'OTHER';

export interface Reservation {
  id: string;
  customer_id: string | null;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  event_type: EventType;
  special_requests: string | null;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationListResponse {
  data: Reservation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
}

export interface GetAllReservationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReservationStatus;
}

export interface UpdateReservationPayload {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  party_size?: number;
  event_type?: EventType;
  special_requests?: string;
  status?: ReservationStatus;
}
