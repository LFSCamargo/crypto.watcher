import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightLine, RiMailLine } from '@remixicon/react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { AuthShell } from '../components/auth-shell'
import { FormAlert } from '../components/form-alert'
import { authErrorMessage } from '../lib/auth-error-message'
import { RESET_LINK_EXPIRY_MINUTES } from '../lib/pending-verification'
import { Button, Input, Label } from '../../../components/ui'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const forgot = useMutation({
    mutationFn: (value: string) => authApi.forgotPassword(value),
  })
  const devLink = forgot.data?.token
    ? `/auth/reset-password?token=${forgot.data.token}`
    : null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    forgot.mutate(email)
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we’ll send you a reset link."
      footer={
        <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
          Back to sign in
        </Link>
      }
    >
      {forgot.isSuccess ? (
        <FormAlert tone="success">
          <p className="font-semibold">Check your inbox</p>
          <p>
            If an account exists for {email}, a reset link is on its way. The link expires
            in {RESET_LINK_EXPIRY_MINUTES} minutes.
          </p>
          {devLink ? (
            <Link
              to={devLink}
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-4"
            >
              Open reset link (development only)
              <RiArrowRightLine className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {forgot.isError ? (
            <FormAlert>
              {authErrorMessage(
                forgot.error,
                {},
                'We couldn’t send the reset link. Please try again.',
              )}
            </FormAlert>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={forgot.isPending}>
            <RiMailLine className="h-4 w-4" aria-hidden />
            {forgot.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
