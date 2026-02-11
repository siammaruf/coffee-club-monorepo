export interface RestaurantTable {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  reservation_time?: string;
  reservation_name?: string;
}

export interface Table {
  id: string;
  number: string;
  seat: number;
  description: string;
  location: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  reservation_time?: string;
  reservation_name?: string;
}

export interface TableFormData {
  number: string;
  seat: number;
  description: string;
  location: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
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