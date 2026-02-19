export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
    status: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
  status?: number;
}