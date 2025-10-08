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

export async function listContacts(tenantId: string) {
  return apiFetch<ContactListItem[]>(`/contacts?tenantId=${tenantId}`);
}

export async function getContact(tenantId: string, personId: string) {
  return apiFetch(`/contacts/${personId}?tenantId=${tenantId}`);
}

export async function getBrokerDashboard(tenantId: string) {
  return apiFetch(`/dashboards/broker?tenantId=${tenantId}`);
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
  return apiFetch('/mls/preflight', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listListings(tenantId: string) {
  return apiFetch(`/listings?tenantId=${tenantId}`);
}

export async function createAgreement(payload: Record<string, unknown>) {
  return apiFetch('/agreements', { method: 'POST', body: JSON.stringify(payload) });
}

export async function signAgreement(agreementId: string, payload: Record<string, unknown>) {
  return apiFetch(`/agreements/${agreementId}/sign`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function listMlsProfiles(tenantId: string) {
  return apiFetch(`/mls/profiles?tenantId=${tenantId}`);
}
