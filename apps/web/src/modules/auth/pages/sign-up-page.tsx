import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from '../components/auth-shell'
import { PasswordStrengthField } from '../components/password-strength-field'
import { passwordsMatch } from '../lib/password-strength'
import { useRegister } from '../hooks/use-session'
import { Button, Input, Label } from '../../../components/ui'

export function SignUpPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!passwordsMatch(password, confirmPassword)) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await register.mutateAsync({ email, password, nickname: nickname || undefined })
      toast.success('Account created!')
      navigate('/auth/onboarding')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create account')
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Crypto Watcher to comment, submit evidence and request reviews."
      footer={
        <span className="text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
            Sign in
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
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="How others will see you"
          />
        </div>
        <PasswordStrengthField
          password={password}
          confirmPassword={confirmPassword}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
        />
        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
