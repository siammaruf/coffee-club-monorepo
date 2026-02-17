import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || isLoading) {
    return <Loading fullPage text="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
