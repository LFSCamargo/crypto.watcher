import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiChat3Line,
  RiShieldCheckLine,
  RiWallet3Line,
} from '@remixicon/react'
import { FormAlert } from '../components/form-alert'
import { useAuthStatus, useLinkPublicKey } from '../hooks/use-session'
import { useReturnTo } from '../hooks/use-auth-links'
import { authErrorMessage } from '../lib/auth-error-message'
import { safeReturnTo } from '../lib/return-to'
import { Button, Input, Label } from '../../../components/ui'

const infoSteps = [
  {
    icon: RiShieldCheckLine,
    title: 'How scores work',
    body: 'Safety scores run from 0 to 100 — higher is safer. They are published by a vetted governor council after a structured review, never by public or token-weighted voting.',
  },
  {
    icon: RiChat3Line,
    title: 'How you take part',
    body: 'Read reports, join the discussion on any project and request a review for projects you care about. Requests are free during launch.',
  },
]

const TOTAL_STEPS = infoSteps.length + 1
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

export function OnboardingPage() {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  const { isAuthenticated, isReady } = useAuthStatus()
  const linkKey = useLinkPublicKey()
  const [step, setStep] = useState(0)
  const [publicKey, setPublicKey] = useState('')
  const [error, setError] = useState<string>()
  const onWalletStep = step === infoSteps.length
  const info = infoSteps[Math.min(step, infoSteps.length - 1)]!

  useEffect(() => {
    if (isReady && !isAuthenticated) navigate('/auth/signin', { replace: true })
  }, [isReady, isAuthenticated, navigate])

  if (!isAuthenticated) return null

  const finish = () => {
    toast.success('You’re all set — welcome to Crypto Watcher.')
    navigate(safeReturnTo(returnTo), { replace: true })
  }

  const handleLink = async (event: FormEvent) => {
    event.preventDefault()
    setError(undefined)
    if (!ADDRESS_PATTERN.test(publicKey.trim())) {
      setError('Enter a full 0x address (42 characters).')
      return
    }
    try {
      await linkKey.mutateAsync(publicKey.trim())
      finish()
    } catch (caught) {
      setError(
        authErrorMessage(
          caught,
          {
            400: 'That isn’t a valid wallet address.',
            409: 'This address is already linked to another account.',
          },
          'We couldn’t link this address. Please try again.',
        ),
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col py-6 md:py-10">
      <div className="mb-6 flex items-center gap-2" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= step ? 'bg-primary' : 'bg-foreground/10'
            }`}
          />
        ))}
      </div>

      <section className="glass-panel rounded-3xl p-6 sm:p-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {onWalletStep
            ? `Step ${TOTAL_STEPS} of ${TOTAL_STEPS} · Optional`
            : `Step ${step + 1} of ${TOTAL_STEPS}`}
        </p>

        {!onWalletStep ? (
          <div key={step} className="animate-in fade-in duration-200">
            <div className="mb-5 mt-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <info.icon className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="heading-3 mb-2">{info.title}</h1>
            <p className="text-muted-foreground">{info.body}</p>
          </div>
        ) : (
          <form
            id="link-wallet"
            onSubmit={(event) => void handleLink(event)}
            className="animate-in fade-in duration-200"
          >
            <div className="mb-5 mt-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <RiWallet3Line className="h-6 w-6" aria-hidden />
            </div>
            <h1 className="heading-3 mb-2">Add a wallet address</h1>
            <p className="mb-4 text-muted-foreground">
              Linking a public address lets you take part in CWT protocol governance. It
              does not connect your wallet or ask you to sign anything, and you can add it
              later from your profile.
            </p>
            {error ? <FormAlert className="mb-4">{error}</FormAlert> : null}
            <div className="space-y-2">
              <Label htmlFor="publicKey">Wallet address</Label>
              <Input
                id="publicKey"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="0x…"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(error) || undefined}
                className="font-mono text-sm"
              />
            </div>
          </form>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => (step === 0 ? finish() : setStep((value) => value - 1))}
            className="gap-1"
          >
            {step === 0 ? null : <RiArrowLeftLine className="h-4 w-4" aria-hidden />}
            {step === 0 ? 'Skip' : 'Back'}
          </Button>

          {!onWalletStep ? (
            <Button
              type="button"
              onClick={() => setStep((value) => value + 1)}
              className="gap-1"
            >
              Next
              <RiArrowRightLine className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={finish}>
                Skip for now
              </Button>
              <Button type="submit" form="link-wallet" disabled={linkKey.isPending}>
                {linkKey.isPending ? 'Linking…' : 'Link and finish'}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
