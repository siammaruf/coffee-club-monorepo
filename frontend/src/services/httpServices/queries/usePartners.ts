import { useQuery } from '@tanstack/react-query'
import { partnerService } from '../partnerService'

export const partnerKeys = {
  all: ['partners'] as const,
}

export function usePartners() {
  return useQuery({
    queryKey: partnerKeys.all,
    queryFn: () => partnerService.getPartners(),
  })
}
