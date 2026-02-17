import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/loading'

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || isLoading) {
    return <Loading fullPage text="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
