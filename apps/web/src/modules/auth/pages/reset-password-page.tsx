import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { AuthShell } from '../components/auth-shell'
import { FormAlert } from '../components/form-alert'
import { PasswordStrengthField } from '../components/password-strength-field'
import { authErrorMessage, isApiStatus } from '../lib/auth-error-message'
import { passwordsMatch } from '../lib/password-strength'
import { Button } from '../../../components/ui'

const requestNewLink = (
  <Link to="/auth/forgot-password" className="font-semibold underline underline-offset-4">
    Request a new link
  </Link>
)

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<ReactNode>()

  const reset = useMutation({
    mutationFn: () => authApi.resetPassword({ token, password }),
    onSuccess: () => navigate('/auth/signin?reset=1', { replace: true }),
    onError: (caught) =>
      setError(
        isApiStatus(caught, 400) ? (
          <>
            <p>This reset link is invalid or has expired.</p>
            {requestNewLink}
          </>
        ) : (
          authErrorMessage(
            caught,
            {},
            'We couldn’t update your password. Please try again.',
          )
        ),
      ),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    if (!passwordsMatch(password, confirm)) {
      setError('Passwords do not match.')
      return
    }
    reset.mutate()
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Reset links work once and expire after 30 minutes."
      footer={
        <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
          Back to sign in
        </Link>
      }
    >
      {!token ? (
        <FormAlert>
          <p>This reset link is incomplete. Open the link from your email again, or:</p>
          {requestNewLink}
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <FormAlert>{error}</FormAlert> : null}
          <PasswordStrengthField
            password={password}
            confirmPassword={confirm}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirm}
            passwordLabel="New password"
          />
          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
