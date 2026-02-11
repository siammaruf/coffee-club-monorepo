import type { AxiosInstance, AxiosError } from 'axios'
import { createErrorResponse } from '@/utils/errorHandler'
import type { ApiErrorResponse } from '@/types/httpService'

export const setupResponseInterceptor = (httpService: AxiosInstance): void => {
  httpService.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      const errorResponse = createErrorResponse(error)
      return Promise.reject(errorResponse)
    }
  )
}
