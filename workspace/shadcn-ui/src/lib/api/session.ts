import { request } from './client'

export interface SessionMembership {
  id: string
  org_id: string
  role: 'BROKER_OWNER' | 'BROKER_MANAGER' | 'AGENT' | 'PENDING'
  status: 'active' | 'invited' | 'inactive' | 'removed'
  can_manage_billing: boolean | null
  metadata: Record<string, unknown> | null
  org?: {
    id: string
    name: string
    type: string
    status: string
    billing_email: string | null
    stripe_customer_id: string | null
    grace_period_ends_at: string | null
    metadata: Record<string, unknown> | null
  }
  subscription?: {
    id: string
    product: string
    plan_interval: string
    seats_purchased: number
    seats_used: number
    status: string
    grace_period_ends_at: string | null
  }
}

export interface SessionResponse {
  user: {
    id: string
    email?: string | null
    globalRole: 'SUPER_ADMIN' | 'SUPPORT_ADMIN' | 'USER'
  }
  profile: Record<string, unknown> | null
  memberships: SessionMembership[]
  activeOrgId: string | null
  policies: { key: string; value: Record<string, unknown> }[]
}

export const fetchSession = () => request<SessionResponse>('/me')
