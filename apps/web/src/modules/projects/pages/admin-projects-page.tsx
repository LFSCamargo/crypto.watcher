import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { useSession } from '../../../store/session'
import { useAuthLinks } from '../../auth/hooks/use-auth-links'
import { AdminCreateProjectForm } from '../components/admin-create-project-form'
import { AdminTransitionForm } from '../components/admin-transition-form'

export function AdminProjectsPage() {
  const user = useSession((state) => state.user)
  const { signInHref } = useAuthLinks()

  if (!user) {
    return (
      <section className="glass-card mx-auto max-w-lg space-y-3 rounded-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">Sign in to manage projects</h1>
        <p className="text-sm text-muted-foreground">
          Project tools are for the platform team.
        </p>
        <Button asChild className="rounded-full">
          <Link to={signInHref}>Sign in</Link>
        </Button>
      </section>
    )
  }

  if (user.role !== 'team' && user.role !== 'admin') {
    return (
      <section className="glass-card mx-auto max-w-lg space-y-3 rounded-3xl p-8 text-center">
        <h1 className="text-xl font-semibold">Team or admin access required</h1>
        <p className="text-sm text-muted-foreground">
          Your account can read reports, join discussions and request reviews. Creating
          and moving projects is limited to the platform team.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/app">Browse projects</Link>
        </Button>
      </section>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="heading-2">Manage projects</h1>
        <p className="body-large max-w-2xl">
          Add council projects and move them through the review lifecycle. Scores are
          published by the governor council, not from this page.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCreateProjectForm />
        <AdminTransitionForm />
      </div>
    </div>
  )
}
