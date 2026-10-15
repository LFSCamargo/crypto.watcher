import { Link, useNavigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useSession } from '../../../store/session'
import { Button } from '../../../components/ui'
import { useAuthLinks } from '../hooks/use-auth-links'

const AuthenticatedAuthControls = lazy(() =>
  import('./authenticated-auth-controls').then((module) => ({
    default: module.AuthenticatedAuthControls,
  })),
)

export function AuthControls() {
  const navigate = useNavigate()
  const user = useSession((state) => state.user)
  const { signInHref, signUpHref } = useAuthLinks()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link to={signInHref}>Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link to={signUpHref}>Get started</Link>
        </Button>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/profile')}
        >
          Account
        </Button>
      }
    >
      <AuthenticatedAuthControls user={user} />
    </Suspense>
  )
}
