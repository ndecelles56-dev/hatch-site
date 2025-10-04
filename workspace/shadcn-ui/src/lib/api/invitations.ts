import { request } from './client'

export interface AcceptInvitationPayload {
  token: string
  license?: {
    number: string
    state: string
    type?: 'agent' | 'brokerage'
    docs_url?: string
    metadata?: Record<string, unknown>
  }
}

export const acceptInvitation = (payload: AcceptInvitationPayload) =>
  request<{ orgId: string; role: string }>('/invitations/accept', {
    method: 'POST',
    body: payload,
  })
