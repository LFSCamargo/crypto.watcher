import type { Selectable } from 'kysely'
import type { UsersTable } from '../../core/db/schema'
import { usersRepository } from './users.repository'

type UserRow = Selectable<UsersTable>

export const mapUser = (user: UserRow) => ({
  id: user.id,
  walletAddress: user.wallet_address,
  displayName: user.display_name,
  avatarUrl: user.avatar_url,
  bio: user.bio,
  role: user.role,
  createdAt: user.created_at.toISOString(),
})

export const usersService = {
  async getByAddress(address: string) {
    const user = await usersRepository.getByAddress(address)
    return user ? mapUser(user) : undefined
  },

  async getById(id: string) {
    const user = await usersRepository.getById(id)
    return user ? mapUser(user) : undefined
  },

  async upsertByAddress(address: string) {
    const user = await usersRepository.upsertByAddress(address)
    return mapUser(user)
  },

  async updateMe(
    id: string,
    input: Partial<{ displayName: string; avatarUrl: string; bio: string }>,
  ) {
    const user = await usersRepository.updateMe(id, input)
    return user ? mapUser(user) : undefined
  },
}
