import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightLine, RiCheckLine, RiMailLine } from '@remixicon/react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { AuthShell } from '../components/auth-shell'
import { Button, Card, Input, Label } from '../../../components/ui'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [devLink, setDevLink] = useState<string | null>(null)
  const forgot = useMutation({ mutationFn: () => authApi.forgotPassword(email) })

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const result = await forgot.mutateAsync()
    if (result.token) {
      setDevLink(`/auth/reset-password?token=${result.token}`)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
          Back to sign in
        </Link>
      }
    >
      {forgot.isSuccess ? (
        <Card className="space-y-3 p-6 text-sm">
          <div className="flex items-center gap-2 font-semibold text-success">
            <RiCheckLine className="h-5 w-5" />
            Check your inbox
          </div>
          <p className="text-muted-foreground">
            If an account exists for <span className="font-semibold">{email}</span>, a
            password reset link is on its way.
          </p>
          {devLink ? (
            <Link
              to={devLink}
              className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
            >
              Open reset link (dev)
              <RiArrowRightLine className="h-4 w-4" />
            </Link>
          ) : null}
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <RiMailLine className="h-4 w-4" />
            {forgot.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
