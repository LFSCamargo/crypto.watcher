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

/** Governor-only panel for publishing expert review decisions on in-analysis projects. */
export function AuthorityVotePanel({ projectSlug, projectState }: AuthorityVotePanelProps) {
  const user = useSession((state) => state.user)
  const [notes, setNotes] = useState('')
  const isAuthority = user?.role === 'admin' || user?.role === 'team'
  const showPanel = isAuthority && ['in_analysis', 'ready', 'voting'].includes(projectState)

  if (!showPanel) return null

  return (
    <Card className="rounded-2xl border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Governor review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          As a governor, publish your expert safe/unsafe assessment and structured notes.
          Only the governor council influences the official score.
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
            onClick={() => toast.success('Safe assessment recorded')}
          >
            <RiThumbUpLine className="h-4 w-4" />
            Mark safe
          </Button>
          <Button
            variant="destructive"
            className="rounded-full gap-1"
            onClick={() => toast.success('Unsafe assessment recorded')}
          >
            <RiThumbDownLine className="h-4 w-4" />
            Mark unsafe
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to={`/app/projects/${projectSlug}`}>Publish report</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
