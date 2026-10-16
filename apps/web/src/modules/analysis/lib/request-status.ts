import type { AnalysisRequest } from '../api/analysis-requests.api'

type RequestStatus = AnalysisRequest['status']

interface RequestStatusMeta {
  label: string
  tone: 'info' | 'warning' | 'success' | 'secondary'
  nextStep: string
}

const RECEIVED: RequestStatusMeta = {
  label: 'Received',
  tone: 'info',
  nextStep: 'Waiting for the council to triage it.',
}

const META: Record<RequestStatus, RequestStatusMeta> = {
  pending: RECEIVED,
  /** Legacy status from the retired paid flow; requests are free, so it reads as received. */
  paid: RECEIVED,
  in_review: {
    label: 'Under review',
    tone: 'warning',
    nextStep: 'The council is checking scope and available evidence.',
  },
  approved: {
    label: 'Accepted',
    tone: 'success',
    nextStep: 'The team adds accepted projects to the catalog, where analysis begins.',
  },
  rejected: {
    label: 'Declined',
    tone: 'secondary',
    nextStep: 'The council will not review this project for now.',
  },
}

export const requestStatusMeta = (status: RequestStatus): RequestStatusMeta =>
  META[status]

export const REQUEST_STATUS_LEGEND: RequestStatus[] = [
  'pending',
  'in_review',
  'approved',
  'rejected',
]

export const REQUEST_TRIAGE_ACTIONS: Partial<
  Record<RequestStatus, { label: string; status: RequestStatus }[]>
> = {
  pending: [
    { label: 'Start review', status: 'in_review' },
    { label: 'Decline', status: 'rejected' },
  ],
  paid: [
    { label: 'Start review', status: 'in_review' },
    { label: 'Decline', status: 'rejected' },
  ],
  in_review: [
    { label: 'Accept', status: 'approved' },
    { label: 'Decline', status: 'rejected' },
  ],
}
