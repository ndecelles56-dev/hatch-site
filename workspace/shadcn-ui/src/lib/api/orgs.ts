import { request } from './client'
import type { SessionMembership } from './session'

export type OrgMember = SessionMembership & {
  user_id?: string
  created_at?: string
  profiles?: {
    id: string
    email: string
    first_name?: string | null
    last_name?: string | null
    display_name?: string | null
    avatar_url?: string | null
    global_role?: string | null
  }
}

export interface CreateInvitationPayload {
  email: string
  role?: 'BROKER_OWNER' | 'BROKER_MANAGER' | 'AGENT'
}

export const listOrgMembers = (orgId: string) =>
  request<OrgMember[]>(`/orgs/${encodeURIComponent(orgId)}/members`)

export const createOrgInvitation = (orgId: string, payload: CreateInvitationPayload) =>
  request(`/orgs/${encodeURIComponent(orgId)}/invitations`, {
    method: 'POST',
    body: payload,
  })

export const removeOrgMember = (orgId: string, memberId: string) =>
  request(`/orgs/${encodeURIComponent(orgId)}/members/${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
  })

export const transferOwnership = (orgId: string, targetMemberId: string) =>
  request(`/orgs/${encodeURIComponent(orgId)}/transfer-ownership`, {
    method: 'POST',
    body: { targetMemberId },
  })

export interface PolicyItem {
  key: string
  value: Record<string, unknown>
}

export const getPolicies = (orgId: string) =>
  request<PolicyItem[]>(`/orgs/${encodeURIComponent(orgId)}/policies`)

export const updatePolicies = (orgId: string, policies: PolicyItem[]) =>
  request<PolicyItem[]>(`/orgs/${encodeURIComponent(orgId)}/policies`, {
    method: 'PUT',
    body: policies,
  })
