import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui'

export function CouncilToolsCard() {
  return (
    <section
      aria-labelledby="council-tools-title"
      className="glass-card-flat space-y-3 rounded-3xl border-primary/30 p-6"
    >
      <h2 id="council-tools-title" className="text-base font-semibold">
        Council tools
      </h2>
      <p className="text-sm text-muted-foreground">
        Triage review requests and move projects through the review lifecycle.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-full">
          <Link to="/app/in-analysis">Open review queue</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/app/admin">Manage projects</Link>
        </Button>
      </div>
    </section>
  )
}
