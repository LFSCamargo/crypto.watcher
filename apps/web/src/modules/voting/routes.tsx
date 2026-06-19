import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAccount, useWriteContract } from 'wagmi'
import { projectVotingAbi } from '../../lib/web3/contracts'
import { useProject } from '../projects/hooks/use-projects'
import { useVoteEligibility, useVoteTally } from './hooks/use-voting'

export function VotingPage() {
  const { slug } = useParams()
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [choice, setChoice] = useState<0 | 1>(1)
  const { data: project } = useProject(slug)
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

    await writeContractAsync({
      address: project.votingContractAddress as `0x${string}`,
      abi: projectVotingAbi,
      functionName: 'castVote',
      args: [choice],
    })
    toast.success('Vote submitted')
  }

  if (!project) return <p>Loading voting details…</p>

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">{project.name}</p>
        <h1 className="text-2xl font-semibold">Cast Vote</h1>
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input
              checked={choice === 1}
              onChange={() => setChoice(1)}
              type="radio"
            />
            Support / lower risk
          </label>
          <label className="flex items-center gap-2">
            <input
              checked={choice === 0}
              onChange={() => setChoice(0)}
              type="radio"
            />
            Against / higher risk
          </label>
          <button className="rounded-md border px-3 py-2 text-sm" onClick={handleVote}>
            Submit on-chain vote
          </button>
        </div>
      </section>
      <aside className="space-y-4">
        <section className="rounded-lg border p-4 text-sm">
          <h2 className="font-medium">Eligibility</h2>
          <p className="mt-2">
            {address
              ? eligibility?.eligible
                ? `Eligible with weight ${eligibility.weight}`
                : 'Not eligible'
              : 'Connect wallet to check eligibility'}
          </p>
        </section>
        <section className="rounded-lg border p-4 text-sm">
          <h2 className="font-medium">Tally</h2>
          <p>For: {tally?.weightFor ?? '0'}</p>
          <p>Against: {tally?.weightAgainst ?? '0'}</p>
        </section>
      </aside>
    </div>
  )
}
