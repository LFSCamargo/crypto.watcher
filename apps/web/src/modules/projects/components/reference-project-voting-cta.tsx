import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'

/**
 * Wallet-gated voting call to action for reference projects.
 */
export function ReferenceProjectVotingCTA({ slug }: { slug: string }) {
  const { isConnected } = useAccount()

  return (
    <Card className="border-primary/20 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Security auditor voting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <p className="text-sm text-muted-foreground">
              Your wallet is connected. Open the project voting workflow to submit your
              auditor vote and on-chain rationale.
            </p>
            <Button asChild className="w-full">
              <Link to={`/app/projects/${slug}/vote`}>Open auditor voting</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              If this reference asset is not yet onboarded as a tracked project, create it
              in the admin flow first.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to view the voting section and participate as a security
              auditor.
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button type="button" className="w-full" onClick={openConnectModal}>
                  Connect your wallet
                </Button>
              )}
            </ConnectButton.Custom>
          </>
        )}
      </CardContent>
    </Card>
  )
}
