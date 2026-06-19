import { db } from '../../core/db'

export const scoringRepository = {
  async getCurrent(projectId: string) {
    return db
      .selectFrom('scores')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('round', 'desc')
      .executeTakeFirst()
  },

  async getHistory(projectId: string) {
    return db
      .selectFrom('scores')
      .selectAll()
      .where('project_id', '=', projectId)
      .orderBy('round', 'asc')
      .execute()
  },

  async upsertScore(input: {
    projectId: string
    round: number
    value: string
    breakdown: { weightFor: string; weightAgainst: string; totalWeight: string }
  }) {
    return db
      .insertInto('scores')
      .values({
        project_id: input.projectId,
        round: input.round,
        value: input.value,
        breakdown: input.breakdown,
      })
      .onConflict((oc) =>
        oc.columns(['project_id', 'round']).doUpdateSet({
          value: input.value,
          breakdown: input.breakdown,
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow()
  },
}
