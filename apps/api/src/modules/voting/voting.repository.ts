import { sql } from 'kysely'
import { db } from '../../core/db'

export const votingRepository = {
  async getTally(projectId: string, round = 1) {
    return db
      .selectFrom('votes')
      .select([
        sql<string>`coalesce(sum(case when choice = 1 then weight else 0 end), 0)`.as(
          'weight_for',
        ),
        sql<string>`coalesce(sum(case when choice = 0 then weight else 0 end), 0)`.as(
          'weight_against',
        ),
      ])
      .where('project_id', '=', projectId)
      .where('round', '=', round)
      .executeTakeFirstOrThrow()
  },
}
