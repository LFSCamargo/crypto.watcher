import { RiShieldStarLine } from '@remixicon/react'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '../../../components/ui'
import type { SessionUser } from '../../../store/session'

const ROLE_BADGE: Record<SessionUser['role'], string | null> = {
  admin: 'Governor council',
  team: 'Platform team',
  user: null,
}

export function ProfileHeader({ user }: { user: SessionUser }) {
  const name = user.nickname || user.displayName || 'Your profile'
  const roleBadge = ROLE_BADGE[user.role]

  return (
    <header className="glass-card flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
      <Avatar className="h-20 w-20">
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
        <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
          {(user.nickname || user.displayName || user.email || 'U')
            .charAt(0)
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="heading-3 truncate">{name}</h1>
        {user.email ? (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        ) : null}
        {roleBadge ? (
          <Badge className="mt-2 gap-1" variant="success">
            <RiShieldStarLine className="h-3 w-3" aria-hidden />
            {roleBadge}
          </Badge>
        ) : null}
      </div>
    </header>
  )
}
