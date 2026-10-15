import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth-shell'
import { FormAlert } from '../../../components/ui/form-alert'
import { PasswordStrengthField } from '../components/password-strength-field'
import { passwordsMatch } from '../lib/password-strength'
import { useRegister } from '../hooks/use-session'
import { useReturnTo } from '../hooks/use-auth-links'
import { authErrorMessage, isApiStatus } from '../lib/auth-error-message'
import { savePendingVerification } from '../lib/pending-verification'
import { withReturnTo } from '../lib/return-to'
import { ApiError } from '../../../lib/api/client'
import { Button, Input, Label } from '../../../components/ui'

export function SignUpPage() {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const register = useRegister()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<ReactNode>()
  const signInHref = withReturnTo('/auth/signin', returnTo)

  const describeError = (caught: unknown): ReactNode => {
    if (
      isApiStatus(caught, 409) &&
      caught instanceof ApiError &&
      /nickname/i.test(caught.message)
    ) {
      return 'That nickname is taken. Choose another one.'
    }
    if (isApiStatus(caught, 409)) {
      return (
        <>
          <p>An account with this email already exists.</p>
          <Link to={signInHref} className="font-semibold underline underline-offset-4">
            Sign in instead
          </Link>
        </>
      )
    }
    return authErrorMessage(
      caught,
      { 400: 'Check the highlighted details and try again.' },
      'We couldn’t create your account. Please try again.',
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    if (!passwordsMatch(password, confirmPassword)) {
      setError('Passwords do not match.')
      return
    }
    try {
      const result = await register.mutateAsync({
        email,
        password,
        nickname: nickname || undefined,
      })
      savePendingVerification({
        email: result.email,
        purpose: 'verify_email',
        next: returnTo,
      })
      navigate('/auth/verify-otp', { state: { email: result.email } })
    } catch (caught) {
      setError(describeError(caught))
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Comment on projects, request reviews and follow protocol governance."
      footer={
        <span className="text-muted-foreground">
          Already have an account?{' '}
          <Link
            to={signInHref}
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nickname">
            Nickname <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="nickname"
            autoComplete="nickname"
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
          {register.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
