import { Link, useParams } from 'react-router-dom'
import { CheckCircle, Circle, Wallet } from '@phosphor-icons/react'
import { Badge, Button, FormAlert, Skeleton } from '../../../components/ui'
import { isAddress } from 'viem'
import { useReputation } from '../hooks/use-reputation'

export function ReputationPage() {
  const { address } = useParams()
  const validAddress =
    address && isAddress(address, { strict: false }) ? address : undefined
  const { data, isLoading, isError, refetch, isRefetching } = useReputation(validAddress)

  if (!validAddress) {
    return (
      <section className="glass-card mx-auto max-w-2xl space-y-3 rounded-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">That isn&apos;t a wallet address</h1>
        <p className="text-sm text-muted-foreground">
          Reviewer credentials are looked up by wallet address, such as 0x12…5678.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/app">Browse projects</Link>
        </Button>
      </section>
    )
  }

  if (isLoading) {
    return (
      <div
        className="glass-card mx-auto max-w-2xl space-y-4 rounded-3xl p-6"
        aria-busy="true"
      >
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <FormAlert>
          <p className="font-semibold">Reviewer credentials couldn&apos;t be loaded.</p>
          <p>Check your connection and try again.</p>
        </FormAlert>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => void refetch()}
          disabled={isRefetching}
        >
          Try again
        </Button>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header className="glass-card space-y-4 rounded-3xl p-6">
        <h1 className="heading-3">Reviewer credentials</h1>
        <div className="flex items-start gap-3">
          <Wallet
            size={20}
            className="mt-0.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Wallet address</p>
            <p className="break-all font-mono text-sm">{data.walletAddress}</p>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="council-status-title"
        className="glass-card-flat space-y-4 rounded-3xl p-6"
      >
        <h2 id="council-status-title" className="text-base font-semibold">
          Council status
        </h2>
        <div className="flex items-center gap-2">
          {data.eligible ? (
            <CheckCircle
              size={18}
              weight="fill"
              className="text-success-strong"
              aria-hidden
            />
          ) : (
            <Circle size={18} className="text-muted-foreground" aria-hidden />
          )}
          <Badge variant={data.eligible ? 'success' : 'secondary'}>
            {data.eligible ? 'Governor council member' : 'Not on the governor council'}
          </Badge>
        </div>
        {data.eligible ? (
          <dl className="grid gap-1">
            <dt className="text-sm text-muted-foreground">Reviewer weight</dt>
            <dd className="text-2xl font-bold">{data.weight}</dd>
          </dl>
        ) : null}
      </section>

      <section aria-labelledby="credentials-about-title" className="space-y-2 px-1">
        <h2 id="credentials-about-title" className="text-sm font-semibold">
          What credentials mean
        </h2>
        <p className="text-sm text-muted-foreground">
          Only governor council members publish official scores. Ordinary accounts read
          reports, discuss projects and request reviews — they cannot publish or change a
          score. Reviewer weight reflects council standing, not token holdings.
        </p>
        <Link
          to="/docs/faq#reviewer-council"
          className="inline-block text-sm font-semibold underline underline-offset-2"
        >
          How the reviewer council works
        </Link>
      </section>
    </article>
  )
}
