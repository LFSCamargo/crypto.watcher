import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui'

export function ProjectNotFound({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-card-flat mx-auto max-w-lg space-y-3 p-8 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/app">Back to projects</Link>
      </Button>
    </div>
  )
}
