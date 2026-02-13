import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { setupRequestInterceptor } from './httpMethods/requestInterceptor'
import { setupResponseInterceptor } from './httpMethods/responseInterceptor'
import { API_URL } from '../lib/config'

const httpService: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
})

setupRequestInterceptor(httpService)
setupResponseInterceptor(httpService)

export default httpService
