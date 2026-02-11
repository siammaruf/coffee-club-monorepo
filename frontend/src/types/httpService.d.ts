export interface ApiErrorResponse {
  message: string
  statusCode: number
  status?: string
  timestamp?: string
}

export interface ErrorResponse {
  message: string
  status: number
}
