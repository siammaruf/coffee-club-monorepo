import type { AxiosRequestConfig } from 'axios'
import httpService from '../httpService'

export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  httpService.patch<T>(url, data, config).then((res) => res.data)
