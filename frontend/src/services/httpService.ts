import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { setupRequestInterceptor } from './httpMethods/requestInterceptor'
import { setupResponseInterceptor } from './httpMethods/responseInterceptor'

const httpService: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
})

setupRequestInterceptor(httpService)
setupResponseInterceptor(httpService)

export default httpService
