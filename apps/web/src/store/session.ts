import { create } from 'zustand'

export interface SessionUser {
  id: string
  walletAddress: string
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
