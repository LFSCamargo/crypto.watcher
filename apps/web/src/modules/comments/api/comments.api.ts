import { apiDelete, apiFetch, apiPost } from '../../../lib/api/client'
import type { Comment } from '../../../lib/api/types'

export const commentsApi = {
  listByProject: (projectId: string) => apiFetch<Comment[]>(`/projects/${projectId}/comments`),
  create: (projectId: string, body: string) =>
    apiPost<Comment>(`/projects/${projectId}/comments`, { body }),
  remove: (commentId: string) => apiDelete<void>(`/comments/${commentId}`),
}
