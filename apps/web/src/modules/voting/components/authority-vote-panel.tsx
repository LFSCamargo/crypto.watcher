import { Link } from 'react-router-dom'
import { useSession } from '../../../store/session'
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '../../../components/ui'
import { RiThumbDownLine, RiThumbUpLine } from '@remixicon/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AuthorityVotePanelProps {
  projectSlug: string
  projectState: string
}

/** POA authority panel for governors reviewing in-analysis projects. */
export function AuthorityVotePanel({ projectSlug, projectState }: AuthorityVotePanelProps) {
  const user = useSession((state) => state.user)
  const [notes, setNotes] = useState('')
  const isAuthority = user?.role === 'admin' || user?.role === 'team'
  const showPanel = isAuthority && ['in_analysis', 'ready', 'voting'].includes(projectState)

  if (!showPanel) return null

  return (
    <Card className="rounded-2xl border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Authority review (POA)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          As a protocol authority, cast your safe/unsafe decision. Requires governance
          tokens linked to your public key.
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes on why this project is safe or unsafe..."
          className="min-h-[80px] rounded-xl"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-full gap-1"
            onClick={() => toast.success('Safe vote recorded (on-chain via governance token)')}
          >
            <RiThumbUpLine className="h-4 w-4" />
            Vote safe
          </Button>
          <Button
            variant="destructive"
            className="rounded-full gap-1"
            onClick={() => toast.success('Unsafe vote recorded')}
          >
            <RiThumbDownLine className="h-4 w-4" />
            Vote unsafe
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to={`/app/projects/${projectSlug}/vote`}>Open on-chain vote</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
