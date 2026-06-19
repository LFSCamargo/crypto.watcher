import type { Selectable } from 'kysely'
import type { CommentsTable } from '../../core/db/schema'
import { commentsRepository } from './comments.repository'

type CommentRow = Selectable<CommentsTable>

export const mapComment = (comment: CommentRow) => ({
  id: comment.id,
  projectId: comment.project_id,
  authorId: comment.author_id,
  body: comment.body,
  createdAt: comment.created_at.toISOString(),
})

export const commentsService = {
  async listByProject(projectId: string) {
    const comments = await commentsRepository.listByProject(projectId)
    return comments.map(mapComment)
  },

  async create(input: { projectId: string; authorId: string; body: string }) {
    return mapComment(await commentsRepository.create(input))
  },

  async softDelete(id: string, requesterId: string) {
    const comment = await commentsRepository.getById(id)
    if (!comment) return 'not_found' as const
    if (comment.author_id !== requesterId) return 'forbidden' as const
    await commentsRepository.softDelete(id)
    return 'deleted' as const
  },
}
