export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  UNAVAILABLE = 'unavailable',
  OUT_OF_SERVICE = 'out_of_service',
}

export interface RestaurantTable {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: TableStatus;
  reservation_time?: string;
  reservation_name?: string;
}

export interface Table {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: TableStatus;
}

export interface TableFormData {
  number: string;
  seat: number;
  description: string;
  location: string;
  status: TableStatus;
  reservation_time?: string;
  reservation_name?: string;
}

export interface TableListResponse {
  data: Table[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface TableResponse {
  data: Table;
  status?: string;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}
