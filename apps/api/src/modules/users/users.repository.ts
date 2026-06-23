import { db } from '../../core/db'
import { normalizeAddress } from '../../shared/address'

export const usersRepository = {
  async getByAddress(address: string) {
    return db
      .selectFrom('users')
      .selectAll()
      .where('wallet_address', '=', normalizeAddress(address))
      .executeTakeFirst()
  },

  async getByEmail(email: string) {
    return db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst()
  },

  async getByNickname(nickname: string) {
    return db
      .selectFrom('users')
      .selectAll()
      .where('nickname', '=', nickname)
      .executeTakeFirst()
  },

  async getById(id: string) {
    return db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst()
  },

  async upsertByAddress(address: string) {
    const walletAddress = normalizeAddress(address)
    return db
      .insertInto('users')
      .values({ wallet_address: walletAddress })
      .onConflict((oc) => oc.column('wallet_address').doNothing())
      .returningAll()
      .executeTakeFirst()
      .then(
        (created) =>
          created ??
          db
            .selectFrom('users')
            .selectAll()
            .where('wallet_address', '=', walletAddress)
            .executeTakeFirstOrThrow(),
      )
  },

  async createWithEmail(input: {
    email: string
    passwordHash: string
    nickname: string | null
  }) {
    return db
      .insertInto('users')
      .values({
        email: input.email,
        password_hash: input.passwordHash,
        nickname: input.nickname,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  async updatePassword(userId: string, passwordHash: string) {
    return db
      .updateTable('users')
      .set({ password_hash: passwordHash, updated_at: new Date() })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirst()
  },

  async markEmailVerified(userId: string) {
    return db
      .updateTable('users')
      .set({ email_verified_at: new Date(), updated_at: new Date() })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirst()
  },

  async linkPublicKey(userId: string, walletAddress: string) {
    return db
      .updateTable('users')
      .set({
        public_key: walletAddress,
        wallet_address: walletAddress,
        updated_at: new Date(),
      })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirst()
  },

  async updateMe(
    id: string,
    input: Partial<{
      displayName: string
      avatarUrl: string | null
      bio: string
      xAccount: string
      nickname: string
      publicKey: string
    }>,
  ) {
    return db
      .updateTable('users')
      .set({
        ...(input.displayName !== undefined ? { display_name: input.displayName } : {}),
        ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.xAccount !== undefined ? { x_account: input.xAccount } : {}),
        ...(input.nickname !== undefined ? { nickname: input.nickname } : {}),
        ...(input.publicKey !== undefined
          ? {
              public_key: normalizeAddress(input.publicKey),
              wallet_address: normalizeAddress(input.publicKey),
            }
          : {}),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },
}
