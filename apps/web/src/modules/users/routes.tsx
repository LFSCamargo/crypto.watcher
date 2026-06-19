import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '../../store/session'
import { usersApi } from './api/users.api'

export function MePage() {
  const user = useSession((state) => state.user)
  const setUser = useSession((state) => state.setUser)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const updateMe = useMutation({ mutationFn: usersApi.updateMe })

  if (!user) return <p>Sign in to manage your profile.</p>

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const updated = await updateMe.mutateAsync({ displayName })
    setUser(updated)
    toast.success('Profile updated')
  }

  return (
    <form className="max-w-xl space-y-3 rounded-lg border p-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold">My Profile</h1>
      <p className="break-all text-sm text-muted-foreground">{user.walletAddress}</p>
      <input
        className="w-full rounded-md border p-2"
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="Display name"
        value={displayName}
      />
      <button className="rounded-md border px-3 py-2 text-sm" type="submit">
        Save profile
      </button>
    </form>
  )
}
