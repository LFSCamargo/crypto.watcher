import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { AuthShell } from '../components/auth-shell'
import { Button, Card, Input, Label } from '../../../components/ui'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const reset = useMutation({
    mutationFn: () => authApi.resetPassword({ token, password }),
    onSuccess: () => {
      toast.success('Password updated — sign in with your new password.')
      navigate('/auth/signin')
    },
    onError: () => toast.error('This reset link is invalid or expired.'),
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    reset.mutate()
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a new password for your account."
      footer={
        <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
          Back to sign in
        </Link>
      }
    >
      {!token ? (
        <Card className="p-6 text-sm text-muted-foreground">
          This reset link is missing its token. Request a new one from the{' '}
          <Link to="/auth/forgot-password" className="font-semibold text-foreground hover:underline">
            forgot password
          </Link>{' '}
          page.
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
