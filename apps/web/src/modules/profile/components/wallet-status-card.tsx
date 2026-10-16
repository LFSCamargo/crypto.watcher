import { Link } from 'react-router-dom'
import { RiWallet3Line } from '@remixicon/react'

export function WalletStatusCard({ walletAddress }: { walletAddress?: string | null }) {
  return (
    <section
      aria-labelledby="wallet-title"
      className="glass-card-flat space-y-3 rounded-3xl p-6"
    >
      <h2 id="wallet-title" className="flex items-center gap-2 text-base font-semibold">
        <RiWallet3Line className="h-4 w-4" aria-hidden />
        Wallet
      </h2>
      {walletAddress ? (
        <>
          <p className="text-sm font-medium text-success-strong">Linked</p>
          <p className="break-all font-mono text-sm">{walletAddress}</p>
          <p className="text-xs text-muted-foreground">
            You can sign in with this wallet. Protocol votes use the wallet you connect,
            with CWT voting power delegated to it.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">No wallet linked</p>
          <p className="text-xs text-muted-foreground">
            Wallets are optional. Link one from the account menu to sign in with it.
          </p>
        </>
      )}
      <Link
        to="/docs/governance"
        className="inline-block text-xs font-semibold underline underline-offset-2"
      >
        How protocol governance works
      </Link>
    </section>
  )
}
