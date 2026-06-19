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

  async updateMe(
    id: string,
    input: Partial<{ displayName: string; avatarUrl: string; bio: string }>,
  ) {
    return db
      .updateTable('users')
      .set({
        ...(input.displayName !== undefined ? { display_name: input.displayName } : {}),
        ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },
}
