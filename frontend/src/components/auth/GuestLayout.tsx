import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/loading'

export default function GuestLayout() {
  const { isAuthenticated, isLoading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || isLoading) {
    return <Loading fullPage text="Loading..." />
  }

  if (isAuthenticated) {
    const from =
      (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  return <Outlet />
}
