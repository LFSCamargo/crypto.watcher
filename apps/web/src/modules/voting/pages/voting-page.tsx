import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAccount, useWriteContract } from 'wagmi'
import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, Wallet } from '@phosphor-icons/react'
import { projectVotingAbi } from '../../../lib/web3/contracts'
import { useProject } from '../../projects/hooks/use-projects'
import { useVoteEligibility, useVoteTally } from '../hooks/use-voting'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
} from '../../../components/ui'
import { cn } from '../../../lib/utils'

export function VotingPage() {
  const { slug } = useParams()
  const { address } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()
  const [choice, setChoice] = useState<0 | 1>(1)
  const { data: project, isLoading: projectLoading } = useProject(slug)
  const { data: tally } = useVoteTally(project?.id)
  const { data: eligibility } = useVoteEligibility(project?.id, address)

  const handleVote = async () => {
    if (!project?.votingContractAddress) {
      toast.error('Voting contract is not deployed yet')
      return
    }
    if (!eligibility?.eligible) {
      toast.error('Your wallet is not eligible to vote')
      return
    }

    try {
      await writeContractAsync({
        address: project.votingContractAddress as `0x${string}`,
        abi: projectVotingAbi,
        functionName: 'castVote',
        args: [choice],
      })
      toast.success('Vote submitted successfully!')
    } catch {
      toast.error('Failed to submit vote')
    }
  }

  if (projectLoading || !project) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  const totalWeight = BigInt(tally?.weightFor ?? 0) + BigInt(tally?.weightAgainst ?? 0)
  const forPercentage =
    totalWeight > 0n
      ? Number((BigInt(tally?.weightFor ?? 0) * 100n) / totalWeight)
      : 50

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card>
        <CardHeader>
          <Link
            to={`/app/projects/${project.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; {project.name}
          </Link>
          <CardTitle className="text-2xl">Cast Your Vote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setChoice(1)}
              className={cn(
                'group flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all',
                choice === 1
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-border hover:border-emerald-500/50 hover:bg-emerald-500/5',
              )}
            >
              <div
                className={cn(
                  'rounded-full p-4 transition-colors',
                  choice === 1 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground',
                )}
              >
                <ThumbsUp size={32} weight="fill" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Support</p>
                <p className="text-sm text-muted-foreground">Lower risk assessment</p>
              </div>
            </button>

            <button
              onClick={() => setChoice(0)}
              className={cn(
                'group flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all',
                choice === 0
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-border hover:border-red-500/50 hover:bg-red-500/5',
              )}
            >
              <div
                className={cn(
                  'rounded-full p-4 transition-colors',
                  choice === 0 ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground',
                )}
              >
                <ThumbsDown size={32} weight="fill" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Against</p>
                <p className="text-sm text-muted-foreground">Higher risk assessment</p>
              </div>
            </button>
          </div>

          <Button
            onClick={handleVote}
            disabled={!eligibility?.eligible || isPending}
            className="w-full gap-2"
            size="lg"
          >
            {isPending ? 'Submitting...' : 'Submit On-Chain Vote'}
          </Button>

          {!address && (
            <p className="text-center text-sm text-muted-foreground">
              Connect your wallet to vote
            </p>
          )}
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet size={18} className="text-primary" />
              Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!address ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle size={18} />
                Connect wallet to check eligibility
              </div>
            ) : eligibility?.eligible ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} weight="fill" />
                  <span className="font-medium">Eligible to vote</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  Weight: {eligibility.weight}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle size={18} weight="fill" />
                <span className="font-medium">Not eligible</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Tally</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ThumbsUp size={14} weight="fill" />
                  Support
                </span>
                <span className="font-medium">{tally?.weightFor ?? '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-red-400">
                  <ThumbsDown size={14} weight="fill" />
                  Against
                </span>
                <span className="font-medium">{tally?.weightAgainst ?? '0'}</span>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${forPercentage}%` }}
              />
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {totalWeight > 0n
                ? `${forPercentage}% support`
                : 'No votes yet'}
            </p>
          </CardContent>
        </Card>
      </aside>
    </motion.div>
  )
}
