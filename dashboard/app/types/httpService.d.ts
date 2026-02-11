// API Error Response from server
export interface ApiErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Standardized error response used throughout the application
export interface ErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// HTTP Methods supported by the service
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}