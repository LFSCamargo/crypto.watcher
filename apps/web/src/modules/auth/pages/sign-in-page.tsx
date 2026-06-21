import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from '../components/auth-shell'
import { useLogin } from '../hooks/use-session'
import { Button, Input, Label } from '../../../components/ui'

export function SignInPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const user = await login.mutateAsync({ email, password })
      toast.success('Welcome back!')
      navigate(user.publicKey ? '/app/profile' : '/auth/onboarding')
    } catch {
      toast.error('Invalid email or password')
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your profile, comments and protocol governance."
      footer={
        <span className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/auth/signup" className="font-semibold text-foreground hover:underline">
            Create one
          </Link>
        </span>
      }
    >
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
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
