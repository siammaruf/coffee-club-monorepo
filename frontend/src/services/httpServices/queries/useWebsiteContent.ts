import { useQuery } from '@tanstack/react-query'
import { websiteContentService } from '../websiteContentService'

export const websiteContentKeys = {
  all: ['website-content'] as const,
}

export function useWebsiteContent() {
  return useQuery({
    queryKey: websiteContentKeys.all,
    queryFn: () => websiteContentService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}
