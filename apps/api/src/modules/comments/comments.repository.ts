import { db } from '../../core/db'

export const commentsRepository = {
  async listByProject(projectId: string) {
    return db
      .selectFrom('comments')
      .selectAll()
      .where('project_id', '=', projectId)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute()
  },

  async create(input: { projectId: string; authorId: string; body: string }) {
    return db
      .insertInto('comments')
      .values({
        project_id: input.projectId,
        author_id: input.authorId,
        body: input.body,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  async getById(id: string) {
    return db.selectFrom('comments').selectAll().where('id', '=', id).executeTakeFirst()
  },

  async softDelete(id: string) {
    return db
      .updateTable('comments')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },
}
