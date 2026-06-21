import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { User, Wallet, FloppyDisk } from '@phosphor-icons/react'
import { useSession } from '../../store/session'
import { usersApi } from './api/users.api'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Avatar,
  AvatarFallback,
} from '../../components/ui'

export function MePage() {
  const user = useSession((state) => state.user)
  const setUser = useSession((state) => state.setUser)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const updateMe = useMutation({ mutationFn: usersApi.updateMe })

  if (!user) {
    return (
      <Card className="max-w-xl p-8 text-center">
        <User size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Sign in to manage your profile.</p>
      </Card>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const updated = await updateMe.mutateAsync({ displayName })
    setUser(updated)
    toast.success('Profile updated')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={24} className="text-primary" weight="duotone" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-xl text-primary">
                {(user.displayName ?? user.nickname ?? user.email ?? 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {user.displayName ?? 'Anonymous User'}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Wallet size={14} />
                <span className="truncate">
                  {user.walletAddress
                    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                    : user.email ?? 'No wallet linked'}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Role: <span className="capitalize">{user.role}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Enter a display name"
                value={displayName}
              />
              <p className="text-xs text-muted-foreground">
                This name will be shown across the platform
              </p>
            </div>

            <Button
              type="submit"
              disabled={updateMe.isPending}
              className="gap-2"
            >
              <FloppyDisk size={16} />
              {updateMe.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>

          {user.walletAddress && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="mb-2 text-sm font-medium">Wallet Address</h3>
              <p className="break-all font-mono text-sm text-muted-foreground">
                {user.walletAddress}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
