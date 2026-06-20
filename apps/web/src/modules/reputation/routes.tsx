import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, CheckCircle, XCircle, Wallet, TrendUp } from '@phosphor-icons/react'
import { useReputation } from './hooks/use-reputation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Button,
} from '../../components/ui'

export function ReputationPage() {
  const { address } = useParams()
  const { data, isLoading, isError } = useReputation(address)

  if (isLoading) {
    return (
      <Card className="max-w-xl">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="max-w-xl p-8 text-center">
        <p className="text-muted-foreground">Reputation data not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/app">Back to projects</Link>
        </Button>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={24} className="text-primary" weight="duotone" />
            Reputation Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet size={24} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="truncate font-mono text-sm">{data.walletAddress}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                {data.eligible ? (
                  <CheckCircle size={16} className="text-emerald-400" weight="fill" />
                ) : (
                  <XCircle size={16} className="text-red-400" weight="fill" />
                )}
                Eligibility Status
              </div>
              <Badge
                variant={data.eligible ? 'success' : 'destructive'}
                className="text-sm"
              >
                {data.eligible ? 'Eligible to Vote' : 'Not Eligible'}
              </Badge>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <TrendUp size={16} className="text-primary" />
                Voting Weight
              </div>
              <p className="text-2xl font-bold text-primary">{data.weight}</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 p-4">
            <h3 className="mb-2 text-sm font-medium">About Reputation</h3>
            <p className="text-sm text-muted-foreground">
              Your voting weight determines how much influence your vote has in project
              risk assessments. Higher weight means more impact on final scores.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
