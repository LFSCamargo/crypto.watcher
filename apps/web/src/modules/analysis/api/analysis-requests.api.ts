import { apiFetch, apiPatch, apiPost } from '../../../lib/api/client'

export interface AnalysisRequest {
  id: string
  userId: string
  projectName: string
  projectUrl: string
  description: string
  status: 'pending' | 'paid' | 'in_review' | 'approved' | 'rejected'
  paymentTxHash: string | null
  feeAmount: string
  reviewNotes: string | null
  createdAt: string
  updatedAt: string | null
}

export const analysisRequestsApi = {
  list: (status?: AnalysisRequest['status']) =>
    apiFetch<{ items: AnalysisRequest[] }>(
      status ? `/analysis-requests?status=${status}` : '/analysis-requests',
    ),
  listMine: () => apiFetch<{ items: AnalysisRequest[] }>('/analysis-requests/me'),
  create: (input: { projectName: string; projectUrl: string; description: string }) =>
    apiPost<AnalysisRequest>('/analysis-requests', input),
  update: (input: {
    id: string
    status?: AnalysisRequest['status']
    reviewNotes?: string
    paymentTxHash?: string
  }) =>
    apiPatch<AnalysisRequest>(`/analysis-requests/${input.id}`, {
      status: input.status,
      reviewNotes: input.reviewNotes,
      paymentTxHash: input.paymentTxHash,
    }),
}
