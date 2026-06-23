import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RiMailLine, RiRefreshLine } from '@remixicon/react'
import { AuthShell } from '../components/auth-shell'
import { useResendEmailOtp, useVerifyEmailOtp } from '../hooks/use-session'
import { Button, Input, Label } from '../../../components/ui'

type VerifyOtpLocationState = {
  email?: string
  nextPath?: string
}

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as VerifyOtpLocationState
  const email = state.email ?? ''
  const verifyOtp = useVerifyEmailOtp()
  const resendOtp = useResendEmailOtp()
  const [code, setCode] = useState('')

  if (!email) {
    return (
      <AuthShell
        title="Verification required"
        subtitle="Start from sign in or sign up to receive a one-time code."
        footer={
          <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          We could not determine which email address to verify.
        </p>
      </AuthShell>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const user = await verifyOtp.mutateAsync({ email, code })
      toast.success('You are signed in!')
      const nextPath = state.nextPath ?? (user.publicKey ? '/app/profile' : '/auth/onboarding')
      navigate(nextPath, { replace: true })
    } catch {
      toast.error('Invalid or expired code')
    }
  }

  const handleResend = async () => {
    try {
      await resendOtp.mutateAsync(email)
      toast.success('A new code was sent to your inbox')
    } catch {
      toast.error('Could not resend the code')
    }
  }

  return (
    <AuthShell
      title="Enter your code"
      subtitle={`We sent a 6-digit code to ${email}. Enter it below to finish signing in.`}
      footer={
        <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
          Use a different email
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">One-time code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            required
          />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={verifyOtp.isPending || code.length !== 6}>
          <RiMailLine className="h-4 w-4" />
          {verifyOtp.isPending ? 'Verifying…' : 'Verify and continue'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={resendOtp.isPending}
          onClick={() => void handleResend()}
        >
          <RiRefreshLine className="h-4 w-4" />
          {resendOtp.isPending ? 'Sending…' : 'Resend code'}
        </Button>
      </form>
    </AuthShell>
  )
}
