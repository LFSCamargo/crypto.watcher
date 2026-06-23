import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStatus } from '../hooks/use-session'

type GuestRouteProps = {
  redirectTo?: string
}

export function GuestRoute({ redirectTo = '/app' }: GuestRouteProps) {
  const { isAuthenticated, isReady } = useAuthStatus()

  if (!isReady) return null

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
