import type { AxiosRequestConfig } from 'axios'
import httpService from '../httpService'

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  httpService.delete<T>(url, config).then((res) => res.data)
