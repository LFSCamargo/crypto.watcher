import type { Selectable } from 'kysely'
import type { UsersTable } from '../../core/db/schema'
import { usersRepository } from './users.repository'

type UserRow = Selectable<UsersTable>
type MappableUser = Omit<UserRow, 'password_hash'> & { password_hash?: string | null }

export const mapUser = (user: MappableUser) => ({
  id: user.id,
  walletAddress: user.wallet_address,
  email: user.email,
  publicKey: user.public_key,
  xAccount: user.x_account,
  nickname: user.nickname,
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

  async getByEmail(email: string) {
    const user = await usersRepository.getByEmail(email)
    return user ? mapUser(user) : undefined
  },

  async getRowByEmail(email: string) {
    return usersRepository.getByEmail(email)
  },

  async getByNickname(nickname: string) {
    const user = await usersRepository.getByNickname(nickname)
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

  async createWithEmail(input: {
    email: string
    passwordHash: string
    nickname: string | null
  }) {
    const user = await usersRepository.createWithEmail(input)
    return mapUser(user)
  },

  async updatePassword(userId: string, passwordHash: string) {
    const user = await usersRepository.updatePassword(userId, passwordHash)
    return user ? mapUser(user) : undefined
  },

  async linkPublicKey(userId: string, walletAddress: string) {
    const user = await usersRepository.linkPublicKey(userId, walletAddress)
    return user ? mapUser(user) : undefined
  },

  async updateMe(
    id: string,
    input: Partial<{
      displayName: string
      avatarUrl: string
      bio: string
      xAccount: string
      nickname: string
      publicKey: string
    }>,
  ) {
    const user = await usersRepository.updateMe(id, input)
    return user ? mapUser(user) : undefined
  },
}
