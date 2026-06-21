import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiWallet3Line,
} from '@remixicon/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinkPublicKey } from '../hooks/use-session'
import { useSession } from '../../../store/session'
import { Button, Card, Input, Label } from '../../../components/ui'

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
