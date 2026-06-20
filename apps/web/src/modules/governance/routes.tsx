import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scales, ArrowRight, User, Hash } from '@phosphor-icons/react'
import { useGovernanceProposal, useGovernanceProposals } from './hooks/use-governance'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Button,
} from '../../components/ui'

function getProposalStateBadge(state: string) {
  switch (state.toLowerCase()) {
    case 'active':
      return 'success'
    case 'pending':
      return 'info'
    case 'executed':
      return 'default'
    case 'defeated':
    case 'canceled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function GovernancePage() {
  const { data, isLoading, isError } = useGovernanceProposals()

  if (isLoading) {
    return (
      <section>
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Failed to load governance proposals.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </Card>
    )
  }

  return (
    <section>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="heading-2 mb-2 flex items-center gap-3">
          <Scales size={28} className="text-primary" weight="duotone" />
          Governance
        </h1>
        <p className="body-large">
          MVP governance is live from launch through token voting and timelock execution.
        </p>
      </motion.div>

      <div className="space-y-4">
        {data?.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/app/governance/${proposal.onchainId}`}>
              <Card className="group card-hover cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold group-hover:text-primary">
                      {proposal.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3">
                      <Badge variant={getProposalStateBadge(proposal.state)}>
                        {proposal.state}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ID: {proposal.onchainId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}

        {data?.length === 0 && (
          <Card className="p-12 text-center">
            <Scales size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No proposals indexed yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to create a governance proposal.
            </p>
          </Card>
        )}
      </div>
    </section>
  )
}

export function GovernanceDetailPage() {
  const { onchainId } = useParams()
  const { data, isLoading, isError } = useGovernanceProposal(onchainId)

  if (isLoading) {
    return (
      <Card className="max-w-3xl">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Proposal not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app/governance">Back to governance</Link>
        </Button>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="max-w-3xl">
        <CardHeader>
          <Badge variant={getProposalStateBadge(data.state)} className="mb-3 w-fit">
            {data.state}
          </Badge>
          <CardTitle className="text-2xl">{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="whitespace-pre-wrap text-muted-foreground">
            {data.description ?? 'No description provided.'}
          </p>

          <div className="space-y-4 rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <Hash size={18} className="mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">On-chain ID</p>
                <p className="break-all text-sm text-muted-foreground">{data.onchainId}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User size={18} className="mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Proposer</p>
                <p className="break-all text-sm text-muted-foreground">{data.proposerAddress}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
