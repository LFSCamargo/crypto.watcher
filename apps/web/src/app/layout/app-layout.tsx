import { Link, Outlet } from 'react-router-dom'
import { AuthControls } from '../../modules/auth/components/auth-controls'
import { useSessionBootstrap } from '../../modules/auth/hooks/use-session'

export function AppLayout() {
  useSessionBootstrap()

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
        <nav className="flex items-center gap-4">
          <Link className="text-lg font-semibold" to="/">
            Crypto Watcher
          </Link>
          <Link className="text-sm text-muted-foreground" to="/governance">
            Governance
          </Link>
          <Link className="text-sm text-muted-foreground" to="/admin">
            Admin
          </Link>
        </nav>
        <AuthControls />
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
