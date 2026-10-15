import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RiMailLine, RiRefreshLine } from '@remixicon/react'
import { AuthShell } from '../components/auth-shell'
import { FormAlert } from '../components/form-alert'
import { useResendEmailOtp, useVerifyEmailOtp } from '../hooks/use-session'
import { useResendCooldown } from '../hooks/use-resend-cooldown'
import { authErrorMessage } from '../lib/auth-error-message'
import {
  OTP_EXPIRY_MINUTES,
  clearPendingVerification,
  loadPendingVerification,
  verificationHeadings,
} from '../lib/pending-verification'
import { safeReturnTo, withReturnTo } from '../lib/return-to'
import { Button, Input, Label } from '../../../components/ui'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const stateEmail = (location.state as { email?: string } | null)?.email
  const [pending] = useState(() => loadPendingVerification())
  const email = pending?.email ?? stateEmail ?? ''
  const purpose = pending?.purpose ?? 'sign_in'
  const verifyOtp = useVerifyEmailOtp()
  const resendOtp = useResendEmailOtp()
  const cooldown = useResendCooldown()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [resent, setResent] = useState(false)

  if (!email) {
    return (
      <AuthShell
        title="Verification required"
        subtitle="Start from sign in or sign up to receive a one-time code."
        footer={
          <Link
            to="/auth/signin"
            className="font-semibold text-foreground hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          We couldn’t tell which email address to verify. Codes are tied to the tab where
          you started.
        </p>
      </AuthShell>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    try {
      await verifyOtp.mutateAsync({ email, code })
      clearPendingVerification()
      toast.success('You’re signed in.')
      const next = pending?.next
      const destination =
        purpose === 'verify_email'
          ? withReturnTo('/auth/onboarding', next)
          : safeReturnTo(next)
      navigate(destination, { replace: true })
    } catch (caught) {
      setError(
        authErrorMessage(
          caught,
          {
            400: 'That code is incorrect or has expired. Check the latest email or request a new code.',
          },
          'We couldn’t verify that code. Please try again.',
        ),
      )
    }
  }

  const handleResend = async () => {
    setError(undefined)
    setResent(false)
    try {
      await resendOtp.mutateAsync(email)
      setResent(true)
      setCode('')
      cooldown.start()
    } catch (caught) {
      setError(
        authErrorMessage(caught, {}, 'We couldn’t send a new code. Please try again.'),
      )
    }
  }

  const resendLabel = cooldown.isCoolingDown
    ? `Resend code in ${cooldown.remaining}s`
    : resendOtp.isPending
      ? 'Sending…'
      : 'Resend code'

  return (
    <AuthShell
      title={verificationHeadings[purpose]}
      subtitle={
        <>
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-foreground">{email}</span>. It expires in{' '}
          {OTP_EXPIRY_MINUTES} minutes.
        </>
      }
      footer={
        <Link to="/auth/signin" className="font-semibold text-foreground hover:underline">
          Use a different email
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <FormAlert>{error}</FormAlert> : null}
        {resent && !error ? (
          <FormAlert tone="success">
            A new code is on its way. Earlier codes no longer work. Check your spam folder
            if it doesn’t arrive.
          </FormAlert>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="code">One-time code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="123456"
            aria-invalid={Boolean(error) || undefined}
            className="text-center font-mono text-lg tracking-[0.5em]"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={verifyOtp.isPending || code.length !== 6}
        >
          <RiMailLine className="h-4 w-4" aria-hidden />
          {verifyOtp.isPending ? 'Verifying…' : 'Verify and continue'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={resendOtp.isPending || cooldown.isCoolingDown}
          onClick={() => void handleResend()}
        >
          <RiRefreshLine className="h-4 w-4" aria-hidden />
          {resendLabel}
        </Button>
      </form>
    </AuthShell>
  )
}
