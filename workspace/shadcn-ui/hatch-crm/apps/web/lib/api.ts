const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? response.statusText);
  }

  return response.json() as Promise<T>;
}

export type ContactListItem = {
  id: string;
  firstName: string;
  lastName: string;
  stage: string;
  primaryEmail?: string;
  primaryPhone?: string;
};

export type ContactDetails = ContactListItem & {
  organizationId: string;
  notes?: string | null;
  consents: Array<{
    id: string;
    channel: string;
    scope: string | null;
    status: string;
    capturedAt: string | null;
    verbatimText?: string | null;
    source?: string | null;
  }>;
  deals: Array<{
    id: string;
    stage: string;
    updatedAt: string;
    listing?: {
      id: string;
      status: string;
      addressLine1?: string | null;
    } | null;
  }>;
  tours: Array<{
    id: string;
    status: string;
    startAt: string;
    listing?: {
      id: string;
      addressLine1?: string | null;
    } | null;
    agent?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }>;
  messages: Array<{
    id: string;
    channel: string;
    direction: string;
    createdAt: string;
    subject?: string | null;
    body?: string | null;
    user?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }>;
  timeline?: Array<{
    id: string;
    type: string;
    occurredAt: string;
    payload: unknown;
    actor?: {
      id: string | null;
      name: string | null;
    };
  }>;
  agreements?: Array<{
    id: string;
    type: string;
    status: string;
    signedAt?: string | null;
  }>;
  activitySummary?: Array<{
    type: string;
    _count: {
      type: number;
    };
  }>;
  toursSummary?: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
};

export type ListingSummary = {
  id: string;
  tenantId: string;
  status: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  price?: string | null;
  beds?: number | null;
  baths?: number | null;
  propertyType?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgreementSummary = {
  id: string;
  tenantId: string;
  personId: string;
  type: string;
  status: string;
  signedAt?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
};

export type PreflightResult = {
  pass: boolean;
  violations: string[];
  warnings: string[];
};

export type DeliverabilityRow = {
  channel: string;
  accepted: number;
  delivered: number;
  bounced: number;
  optOuts: number;
};

export type DealSummaryRow = {
  stage: string;
  forecastGci: number;
  actualGci: number;
};

export type BrokerDashboardSummary = {
  leadToKeptRate: number;
  toursWithBbaRate: number;
  deliverability: DeliverabilityRow[];
  deals: DealSummaryRow[];
  clearCooperation: Array<{
    timerId: string;
    status: string;
    startedAt: string;
    deadlineAt: string | null;
    listing?: {
      addressLine1?: string | null;
    } | null;
  }>;
};

export type MlsProfile = {
  id: string;
  tenantId: string;
  name: string;
  disclaimerText: string;
  compensationDisplayRule: 'allowed' | 'prohibited' | 'conditional';
  requiredPlacement?: string | null;
  prohibitedFields?: Record<string, unknown> | null;
  clearCooperationRequired: boolean;
  slaHours: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listContacts(tenantId: string) {
  return apiFetch<ContactListItem[]>(`/contacts?tenantId=${tenantId}`);
}

export async function getContact(tenantId: string, personId: string) {
  return apiFetch<ContactDetails>(`/contacts/${personId}?tenantId=${tenantId}`);
}

export async function getBrokerDashboard(tenantId: string) {
  return apiFetch<BrokerDashboardSummary>(`/dashboards/broker?tenantId=${tenantId}`);
}

export async function requestTour(payload: Record<string, unknown>) {
  return apiFetch('/tours', { method: 'POST', body: JSON.stringify(payload) });
}

export async function captureConsent(personId: string, payload: Record<string, unknown>) {
  return apiFetch(`/contacts/${personId}/consents`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function sendSms(payload: Record<string, unknown>) {
  return apiFetch('/messages/sms', { method: 'POST', body: JSON.stringify(payload) });
}

export async function runPreflight(payload: Record<string, unknown>) {
  return apiFetch<PreflightResult>('/mls/preflight', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listListings(tenantId: string) {
  return apiFetch<ListingSummary[]>(`/listings?tenantId=${tenantId}`);
}

export async function createAgreement(payload: Record<string, unknown>) {
  return apiFetch<AgreementSummary>('/agreements', { method: 'POST', body: JSON.stringify(payload) });
}

export async function signAgreement(agreementId: string, payload: Record<string, unknown>) {
  return apiFetch<AgreementSummary>(`/agreements/${agreementId}/sign`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function listMlsProfiles(tenantId: string) {
  return apiFetch<MlsProfile[]>(`/mls/profiles?tenantId=${tenantId}`);
}
