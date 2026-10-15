import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStatus } from '../hooks/use-session'
import { useReturnTo } from '../hooks/use-auth-links'

type GuestRouteProps = {
  redirectTo?: string
}

export function GuestRoute({ redirectTo = '/app' }: GuestRouteProps) {
  const { isAuthenticated, isReady } = useAuthStatus()
  const returnTo = useReturnTo()

  if (!isReady) return null

  if (isAuthenticated) {
    return <Navigate to={returnTo ?? redirectTo} replace />
  }

  return <Outlet />
}
