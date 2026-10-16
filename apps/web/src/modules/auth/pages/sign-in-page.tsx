import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/auth-shell'
import { FormAlert } from '../../../components/ui/form-alert'
import { useLogin } from '../hooks/use-session'
import { useReturnTo } from '../hooks/use-auth-links'
import { authErrorMessage } from '../lib/auth-error-message'
import { savePendingVerification } from '../lib/pending-verification'
import { withReturnTo } from '../lib/return-to'
import { Button, Input, Label } from '../../../components/ui'

export function SignInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = useReturnTo()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const credentialsInvalid = Boolean(error) && login.isError

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    try {
      const result = await login.mutateAsync({ email, password })
      savePendingVerification({ email: result.email, purpose: 'sign_in', next: returnTo })
      navigate('/auth/verify-otp', { state: { email: result.email } })
    } catch (caught) {
      setError(
        authErrorMessage(
          caught,
          { 401: 'Email or password is incorrect.' },
          'We couldn’t sign you in. Please try again.',
        ),
      )
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="We’ll email you a one-time code to finish signing in."
      footer={
        <span className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to={withReturnTo('/auth/signup', returnTo)}
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </span>
      }
    >
      {searchParams.get('reset') === '1' && !error ? (
        <FormAlert tone="success" className="mb-4">
          Password updated. Sign in with your new password.
        </FormAlert>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={credentialsInvalid || undefined}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={credentialsInvalid || undefined}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}
