import { Link } from 'react-router-dom'
import { Button, Card } from '../../../components/ui'

export function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-lg rounded-2xl p-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="heading-2 mt-3">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild className="rounded-full">
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/app">Browse projects</Link>
        </Button>
      </div>
    </Card>
  )
}
