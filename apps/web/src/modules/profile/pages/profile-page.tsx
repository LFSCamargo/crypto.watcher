import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RiShieldStarLine,
  RiTwitterXLine,
  RiUserLine,
} from '@remixicon/react'
import { useSession } from '../../../store/session'
import { useAuthLinks } from '../../auth/hooks/use-auth-links'
import { usersApi } from '../../users/api/users.api'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '../../../components/ui'
import { ProfileAvatarUpload } from '../components/profile-avatar-upload'

export function ProfilePage() {
  const user = useSession((state) => state.user)
  const setUser = useSession((state) => state.setUser)
  const { signInHref } = useAuthLinks()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [xAccount, setXAccount] = useState(user?.xAccount ?? '')
  const [publicKey, setPublicKey] = useState(user?.publicKey ?? user?.walletAddress ?? '')

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName ?? '')
    setNickname(user.nickname ?? '')
    setBio(user.bio ?? '')
    setAvatarUrl(user.avatarUrl ?? '')
    setXAccount(user.xAccount ?? '')
    setPublicKey(user.publicKey ?? user.walletAddress ?? '')
  }, [user])

  const updateMe = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updated) => {
      setUser(updated)
      toast.success('Profile saved')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not save profile')
    },
  })

  if (!user) {
    return (
      <Card className="mx-auto max-w-lg rounded-2xl p-8 text-center">
        <RiUserLine className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="mb-6 text-muted-foreground">Sign in to manage your profile.</p>
        <Button asChild className="rounded-full">
          <Link to={signInHref}>Sign in</Link>
        </Button>
      </Card>
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    updateMe.mutate({
      displayName: displayName || undefined,
      nickname: nickname || undefined,
      bio: bio || undefined,
      avatarUrl: avatarUrl.trim() ? avatarUrl : null,
      xAccount: xAccount || undefined,
      publicKey: publicKey || undefined,
    })
  }

  const isAuthority = user.role === 'admin' || user.role === 'team'

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={nickname ?? displayName ?? 'User'} /> : null}
          <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
            {(nickname ?? displayName ?? user.email ?? 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="heading-3">{nickname ?? displayName ?? 'Your profile'}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {isAuthority && (
            <Badge className="mt-2" variant="success">
              <RiShieldStarLine className="mr-1 h-3 w-3" />
              Governor
            </Badge>
          )}
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
            <ProfileAvatarUpload
              avatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
              onClear={() => setAvatarUrl('')}
            />
            <div className="space-y-2">
              <Label htmlFor="xAccount" className="flex items-center gap-1">
                <RiTwitterXLine className="h-4 w-4" />
                X account
              </Label>
              <Input
                id="xAccount"
                value={xAccount}
                onChange={(e) => setXAccount(e.target.value)}
                placeholder="@username"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Description</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicKey">Public key / wallet address</Label>
              <Input
                id="publicKey"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="0x..."
                className="rounded-xl font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Required for CWT protocol governance (not project score voting)
              </p>
            </div>
            <Button type="submit" className="rounded-full" disabled={updateMe.isPending}>
              {updateMe.isPending ? 'Saving...' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isAuthority && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Governor reviews</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            As a governor, you publish expert reviews and scores from the In Analysis queue.
            <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
              <Link to="/app/in-analysis">Open review queue</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
