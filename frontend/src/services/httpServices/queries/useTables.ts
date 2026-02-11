import { useQuery } from '@tanstack/react-query'
import { publicService } from '../publicService'

export const tableKeys = {
  all: ['tables'] as const,
}

export function useTables() {
  return useQuery({
    queryKey: tableKeys.all,
    queryFn: () => publicService.getTables(),
  })
}
