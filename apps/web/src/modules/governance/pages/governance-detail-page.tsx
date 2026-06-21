import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Hash } from '@phosphor-icons/react'
import { useGovernanceProposal } from '../hooks/use-governance'
import { getProposalStateBadge } from '../lib/proposal-state-badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Button,
} from '../../../components/ui'

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
