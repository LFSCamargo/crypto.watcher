import { Link } from 'react-router-dom'
import { RiUserLine } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { useSession } from '../../../store/session'
import { MyRequestsSection } from '../../analysis/components/my-requests-section'
import { useAuthLinks } from '../../auth/hooks/use-auth-links'
import { CouncilToolsCard } from '../components/council-tools-card'
import { ProfileHeader } from '../components/profile-header'
import { ProfileSettingsForm } from '../components/profile-settings-form'
import { WalletStatusCard } from '../components/wallet-status-card'

export function ProfilePage() {
  const user = useSession((state) => state.user)
  const { signInHref } = useAuthLinks()

  if (!user) {
    return (
      <section className="glass-card mx-auto max-w-lg rounded-3xl p-8 text-center">
        <RiUserLine
          className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
          aria-hidden
        />
        <h1 className="text-xl font-semibold">Sign in to manage your profile</h1>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">
          Your profile holds your nickname, avatar and review requests.
        </p>
        <Button asChild className="rounded-full">
          <Link to={signInHref}>Sign in</Link>
        </Button>
      </section>
    )
  }

  const isAuthority = user.role === 'admin' || user.role === 'team'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ProfileHeader user={user} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ProfileSettingsForm user={user} />
        <div className="space-y-6">
          <WalletStatusCard walletAddress={user.walletAddress} />
          {isAuthority ? <CouncilToolsCard /> : null}
          <MyRequestsSection />
        </div>
      </div>
    </div>
  )
}
