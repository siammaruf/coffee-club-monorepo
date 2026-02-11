import type { AxiosRequestConfig } from 'axios'
import httpService from '../httpService'

export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  httpService.put<T>(url, data, config).then((res) => res.data)
