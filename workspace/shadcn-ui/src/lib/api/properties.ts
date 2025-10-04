import type { Database } from '@/types/database'
import { request, functionsBaseUrl, supabaseAnonKey } from './client'
import type { RequestOptions } from './client'


export type BrokerPropertyRow = Database['public']['Views']['vw_broker_properties']['Row']
type ConsumerPropertyRow = Database['public']['Views']['vw_consumer_properties']['Row']

export const fetchBrokerProperties = (options?: RequestOptions) =>
  request<BrokerPropertyRow[]>('/properties', options)

export const fetchBrokerProperty = (id: string, options?: RequestOptions) =>
  request<BrokerPropertyRow>(`/properties/${encodeURIComponent(id)}`, options)

export const updateBrokerProperty = (
  id: string,
  payload: Partial<BrokerPropertyRow>,
  options?: RequestOptions
) =>
  request<BrokerPropertyRow>(`/properties/${encodeURIComponent(id)}`, {
    ...options,
    method: 'PATCH',
    body: payload,
  })

export const publishBrokerProperty = (id: string, options?: RequestOptions) =>
  request<BrokerPropertyRow>(`/properties/${encodeURIComponent(id)}/publish`, {
    ...options,
    method: 'POST',
  })

export const unpublishBrokerProperty = (id: string, options?: RequestOptions) =>
  request<BrokerPropertyRow>(`/properties/${encodeURIComponent(id)}/unpublish`, {
    ...options,
    method: 'POST',
  })

export const closeBrokerProperty = (id: string, options?: RequestOptions) =>
  request<BrokerPropertyRow>(`/properties/${encodeURIComponent(id)}/close`, {
    ...options,
    method: 'POST',
  })

export const reopenBrokerProperty = (
  id: string,
  payload?: { status?: 'active' | 'pending' | 'withdrawn' },
  options?: RequestOptions
) =>
  request<BrokerPropertyRow>(`/properties/${encodeURIComponent(id)}/reopen`, {
    ...options,
    method: 'POST',
    body: payload ?? {},
  })

export const deleteBrokerProperty = (id: string, options?: RequestOptions) =>
  request<{ id: string }>(`/properties/${encodeURIComponent(id)}`, {
    ...options,
    method: 'DELETE',
  })

export interface PromoteDraftPayload {
  draftId?: string
  firmId: string
  agentId?: string
  source?: 'bulk_upload' | 'manual' | 'mls'
  fileName?: string
  property: Record<string, unknown>
  validationSummary?: Record<string, unknown>
  isTest?: boolean
}

export const promoteDraftProperty = (payload: PromoteDraftPayload, options?: RequestOptions) =>
  request<BrokerPropertyRow>('/properties/promote', {
    ...options,
    method: 'POST',
    body: payload,
  })

const requestConsumer = async <T>(
  path: string,
  searchParams?: URLSearchParams,
  extraHeaders?: Record<string, string>
): Promise<T> => {
  if (!functionsBaseUrl) {
    throw new Error('functions_base_url_missing')
  }

  const url = new URL(`${functionsBaseUrl}${path}`)
  if (searchParams) {
    url.search = searchParams.toString()
  }

  const headers = extraHeaders ? { ...extraHeaders } : {}
  const response = await fetch(url.toString(), { headers })
  const payload = await response.json()

  if (!response.ok) {
    const errorCode = payload?.error ?? response.statusText
    throw new Error(typeof errorCode === 'string' ? errorCode : 'request_failed')
  }

  return payload?.data ?? payload
}

interface ConsumerSearchParams {
  q?: string
  bbox?: string
  filters?: Record<string, unknown>
  limit?: number
}

export const searchConsumerProperties = (params: ConsumerSearchParams = {}) => {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.bbox) search.set('bbox', params.bbox)
  if (params.limit) search.set('limit', String(params.limit))
  if (params.filters && Object.keys(params.filters).length > 0) {
    search.set('filters', JSON.stringify(params.filters))
  }

  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  }

  return requestConsumer<ConsumerPropertyRow[]>(
    '/consumer-properties',
    search,
    headers
  )
}

export const getConsumerProperty = (identifier: string) => {
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  }

  return requestConsumer<ConsumerPropertyRow>(
    `/consumer-properties/${encodeURIComponent(identifier)}`,
    undefined,
    headers
  )
}
