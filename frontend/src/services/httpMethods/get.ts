import type { AxiosRequestConfig } from 'axios'
import httpService from '../httpService'

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  httpService.get<T>(url, config).then((res) => res.data)
