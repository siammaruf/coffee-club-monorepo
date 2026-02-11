import type { AxiosInstance } from 'axios'

export const setupRequestInterceptor = (httpService: AxiosInstance): void => {
  httpService.interceptors.request.use(
    (config) => {
      // Auth is handled via httpOnly cookies - no token injection needed
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}
