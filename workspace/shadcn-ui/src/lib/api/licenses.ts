import { request } from './client'

export interface LicensePayload {
  type?: 'agent' | 'brokerage'
  state: string
  number: string
  docsUrl?: string
  metadata?: Record<string, unknown>
  orgId?: string
}

export const saveLicense = (payload: LicensePayload) =>
  request('/licenses', {
    method: 'POST',
    body: payload,
  })

export const verifyLicense = (
  licenseId: string,
  payload: { status: 'unverified' | 'pending' | 'verified' | 'rejected'; notes?: string }
) =>
  request(`/licenses/verify/${encodeURIComponent(licenseId)}`, {
    method: 'POST',
    body: payload,
  })
