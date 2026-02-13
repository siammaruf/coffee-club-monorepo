export type EventType = 'DINING' | 'BIRTHDAY' | 'MEETING' | 'PRIVATE_EVENT' | 'OTHER'
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Reservation {
  id: string
  customer_id: string | null
  name: string
  email: string
  phone: string
  date: string
  time: string
  party_size: number
  event_type: EventType
  special_requests: string | null
  status: ReservationStatus
  created_at: string
  updated_at: string
}

export interface CreateReservationPayload {
  name: string
  email: string
  phone: string
  date: string
  time: string
  party_size: number
  event_type?: EventType
  special_requests?: string
}
