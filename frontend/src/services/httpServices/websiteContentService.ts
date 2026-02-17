import { get } from '../httpMethods'
import type { WebsiteContent, WebsiteContentResponse } from '@/types/websiteContent'

export const websiteContentService = {
  getAll: () =>
    get<WebsiteContentResponse>('/public/website-content').then(
      (res) => res.data as WebsiteContent,
    ),
}
