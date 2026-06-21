import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiMailLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiWallet3Line,
} from '@remixicon/react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from './api/auth.api'
import { AuthShell } from './components/auth-shell'
import { PasswordStrengthField } from './components/password-strength-field'
import { passwordsMatch } from './lib/password-strength'
import { useLinkPublicKey, useLogin, useRegister } from './hooks/use-session'
import { useSession } from '../../store/session'
import { Button, Card, Input, Label } from '../../components/ui'

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

const onboardingSteps = [
  {
    icon: RiSearchLine,
    title: 'Search any project',
    body: 'Use the search bar (or press ⌘K / Ctrl+K anywhere) to look up a token, protocol or DApp. Browsing is free and needs no wallet.',
  },
  {
    icon: RiShieldCheckLine,
    title: 'Read the safety score',
    body: 'Each project shows an authority-reviewed safety score, the review thesis, and any risks. Higher score means lower risk in our panel’s view.',
  },
  {
    icon: RiCheckLine,
    title: 'Comment & request reviews',
    body: 'Share analysis in comments (a small anti-spam fee applies) and request a review for any project you want our authority panel to investigate.',
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const user = useSession((state) => state.user)
  const linkKey = useLinkPublicKey()
  const [step, setStep] = useState(0)
  const [publicKey, setPublicKey] = useState('')

  const isLastInfoStep = step === onboardingSteps.length - 1
  const onWalletStep = step === onboardingSteps.length
  const info = (onboardingSteps[step] ?? onboardingSteps[0])!

  useEffect(() => {
    if (!user) navigate('/auth/signin', { replace: true })
  }, [user, navigate])

  if (!user) return null

  const finish = () => {
    toast.success('You’re all set — welcome to Crypto Watcher!')
    navigate('/app')
  }

  const handleLink = async () => {
    try {
      await linkKey.mutateAsync(publicKey)
      toast.success('Wallet linked!')
      finish()
    } catch {
      toast.error('Invalid wallet address or already linked')
    }
  }

  const progress = onWalletStep ? onboardingSteps.length + 1 : step + 1
  const total = onboardingSteps.length + 1

  return (
    <div className="mx-auto flex max-w-xl flex-col py-10">
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < progress ? 'bg-primary' : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      <Card className="overflow-hidden p-8">
        <AnimatePresence mode="wait">
          {!onWalletStep ? (
            <motion.div
              key={`info-${step}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <info.icon className="h-7 w-7" />
              </div>
              <p className="mb-1 text-xs font-bold text-muted-foreground">
                STEP {step + 1} OF {total}
              </p>
              <h1 className="heading-3 mb-2">{info.title}</h1>
              <p className="text-muted-foreground">{info.body}</p>
            </motion.div>
          ) : (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <RiWallet3Line className="h-7 w-7" />
              </div>
              <p className="mb-1 text-xs font-bold text-muted-foreground">
                LAST STEP — OPTIONAL
              </p>
              <h1 className="heading-3 mb-2">Link your wallet (optional)</h1>
              <p className="mb-4 text-muted-foreground">
                Add your public key to participate in protocol governance with CWT. Project
                scores are published by our expert governor council — not by public voting.
                You can also do this later from your profile.
              </p>
              <div className="space-y-2">
                <Label htmlFor="publicKey">Wallet address</Label>
                <Input
                  id="publicKey"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="0x…"
                  className="font-mono text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => (step === 0 ? navigate('/app') : setStep((s) => s - 1))}
            className="gap-1"
          >
            <RiArrowLeftLine className="h-4 w-4" />
            {step === 0 ? 'Skip' : 'Back'}
          </Button>

          {!onWalletStep ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="gap-1"
            >
              {isLastInfoStep ? 'Almost done' : 'Next'}
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={finish}>
                Skip for now
              </Button>
              <Button
                type="button"
                onClick={handleLink}
                disabled={!publicKey.startsWith('0x') || linkKey.isPending}
              >
                {linkKey.isPending ? 'Linking…' : 'Link & finish'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
