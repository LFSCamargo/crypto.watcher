import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Crypto Watcher</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
