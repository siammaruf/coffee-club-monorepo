import type { AxiosRequestConfig } from 'axios'
import httpService from '../httpService'

export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  httpService.post<T>(url, data, config).then((res) => res.data)
