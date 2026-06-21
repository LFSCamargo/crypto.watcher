import { create } from 'zustand'

export interface SessionUser {
  id: string
  walletAddress?: string | null
  email?: string | null
  publicKey?: string | null
  nickname?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  bio?: string | null
  xAccount?: string | null
  role: 'user' | 'team' | 'admin'
}

interface SessionState {
  user?: SessionUser
  setUser: (user?: SessionUser) => void
}

export const useSession = create<SessionState>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}))
