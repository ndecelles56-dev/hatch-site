import { request } from './client'

export interface CheckoutPayload {
  product: 'agent_solo' | 'brokerage'
  interval: 'monthly' | 'yearly'
  seats?: number
  orgId?: string
  orgName?: string
  orgSlug?: string
}

export const createCheckoutSession = (payload: CheckoutPayload) =>
  request<{ url: string }>('/billing/checkout', {
    method: 'POST',
    body: payload,
  })

export const getBillingPortalUrl = (orgId: string) =>
  request<{ url: string }>(`/billing/portal?orgId=${encodeURIComponent(orgId)}`)
