# Compliance Guardrails

## Consent Ledger & Messaging Enforcement

- **Evidence capture** — `POST /contacts/:id/consents` requires channel, scope, verbatim disclosure, source, IP/user-agent (optional), and stores captured timestamp + actor. Records are immutable; revocations set `status = REVOKED` + `revokedAt` and create `CommunicationBlock` rows.
- **STOP / Unsubscribe** — Revoking consent or calling `ComplianceService.muteChannel` writes a global block preventing sends across all automations. Blocked sends raise `403` errors and log `Activity(type = COMPLIANCE_VIOLATION)` with reason and channel.
- **Quiet hours** — Tenant-level `quietHoursStart/End` enforced for SMS/voice unless override is provided (broker-authorized; logged in activity payloads).
- **10DLC readiness** — SMS sends require `tenant.tenDlcReady = true`; otherwise the API denies with descriptive message.
- **Email policy** — Promotional emails must originate from domains matching `EMAIL_SENDER_DOMAIN` and include `includeUnsubscribe = true`; otherwise the API returns `400`.
- **Deliverability metrics** — `DeliverabilityMetric` aggregates accepted/delivered/bounced/opt-outs by agent/channel/day for dashboard visibility.

## MLS Rules & Clear Cooperation

- **Publishing pre-flight** — `runPublishingPreflight` verifies disclaimer text, compensation rules, and Clear Cooperation SLA (marketing start vs `slaHours`). Violations return explicit error strings; UI blocks publishing until resolved.
- **Clear Cooperation timer** — `POST /mls/clear-cooperation` starts or refreshes timers per listing. Risk evaluations (GREEN/YELLOW/RED) log activities and emit `compliance.violation_detected` events when SLA breaches loom.
- **Broker dashboard** — Exposes risk state list and SLA deadlines so brokers can escalate before compliance escalations.

## Buyer-Rep Gate

- **Tour enforcement** — `ToursService.requestTour` checks for active `BUYER_REP` agreement with `status = SIGNED` + non-expired `expiryDate`. Missing agreements yield `409` responses with wizard deep link. Broker overrides require `overrideBuyerRep` + actor ID and log reason in `Activity` payload.

## Audit & Security

- **Activity log** — All consent changes, messaging denials, tour routing, agreement signatures, and compliance alerts append to `activity` for tamper-evident history.
- **AuditLog** — Reserved for field-level diffs (structure present; extend as high-sensitivity fields roll out).
- **Roles & PII** — Role enum enforced at user creation. API surface expects future decorators/guards to restrict endpoints per role (placeholder for RBAC middleware). Sensitive endpoints rely on multi-tenant scoping (tenantId required for read/write).
- **Storage** — Evidence URIs support S3/MinIO integration; seeds configure MinIO with demo bucket.

## Webhooks & Integrations

- **Outbox pattern** — Events written to `outbox` with HMAC-signed webhook delivery. Failed attempts retry with exponential backoff up to configurable max attempts (default 5). `WebhookDelivery` persists history per subscription.
- **Security** — `X-Hatch-Signature: sha256=<digest>` header computed with per-subscription secret; consumers verify before trusting payloads.

## Logging & Observability

- Consent denials, routing assignments, pre-flight violations, and Clear Cooperation status changes log structured payloads to `activity` and are emitted through outbox events for external monitoring.
- Shared request IDs can be layered via middleware (not yet implemented) to correlate frontend and backend events; guidelines captured in `docs/runbooks.md` for future work.

## Security & Retention Notes

- **Roles** — Role enum enforces least-privilege. Future work includes route guards / decorators to restrict modules by role (BROKER/TEAM_LEAD manage routing, MARKETING limited to publishing).
- **PII Handling** — PII fields remain within tenant scope; API requires tenant context on every read/write. Activity + AuditLog provide traceability for consent, agreements, overrides, and routing decisions.
- **Evidence Storage** — Agreement/consent proof URIs point to S3-compatible storage; enable bucket lifecycle + encryption per tenant policy.
- **Retention Toggles** — Introduce env toggles (e.g., `EVIDENCE_RETENTION_DAYS`, `ACTIVITY_RETENTION_DAYS`) with scheduled jobs to purge aged artifacts; documented for future iteration.
- **Transport Security** — API expected to sit behind TLS termination (reverse proxy) and leverage OAuth/OpenID for SSO.
