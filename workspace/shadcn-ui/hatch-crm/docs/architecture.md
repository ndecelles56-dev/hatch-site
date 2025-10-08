# Architecture Overview

## Monorepo Layout

- `apps/api` — NestJS + Fastify service exposing REST API with OpenAPI metadata, Prisma data access, and integration with the event outbox.
- `apps/web` — Next.js (App Router) frontend delivering broker dashboards, contact 360, consent-aware messaging, tour booking, and compliance tooling.
- `packages/db` — Prisma schema, migrations, and seed data for the PostgreSQL datastore, including tenants, contacts, consent ledger, MLS profiles, routing metadata, and webhook definitions.
- `packages/shared` — Domain logic shared across services (consent enforcement, routing engine, MLS guardrails, journey simulation, event envelopes).
- `packages/config` — Runtime configuration helpers (reserved for future secrets/typed env parsing).
- `infra/docker` — Local runtime dependencies (PostgreSQL, Redis, MinIO S3-compatible storage, Mailhog SMTP capture).
- `docs` — Operational documentation, compliance guardrails, testing strategy, and runbooks.

## Backend Service

The Nest application composes feature-focused modules:

- `ContactsModule` — CRUD for contacts, timeline hydration, timeline summaries, and outbox emission of `lead.created` events.
- `ConsentsModule` — Consent ledger capture/revoke with global channel blocks and audit activity + `consent.captured / consent.revoked` events.
- `MessagesModule` — Email/SMS/voice (simulated) dispatch with consent enforcement, quiet hour checks, 10DLC guard, deliverability metrics, and inbound webhook normalization.
- `ToursModule` — Buyer-rep gate enforcement, capacity-aware routing integration, tour state transitions, and event emission.
- `AgreementsModule` — Buyer-rep/listing agreement lifecycle with override logging and `agreement.signed` events.
- `RoutingModule` — Capacity/performance/geography/consent-aware scoring using the shared routing engine, persisting assignment reasons for audit.
- `MlsModule` — Publishing pre-flight checks, Clear Cooperation timers, and compliance alerting.
- `DashboardsModule` — Broker KPIs (conversion, tour coverage, deliverability, deal forecast vs actual, Clear Cooperation risks).
- `JourneysModule` — Rule-engine simulation endpoint for Journeys/Playbooks.
- `WebhooksModule` + `OutboxModule` — Outbox persistence, webhook delivery with HMAC signature, retries, and manual flush controls.
- `ListingsModule` — Minimal listing catalogue endpoint for the Tour Booker UI.

Cross-cutting services include `ComplianceService` (consent/quiet-hour enforcement), `PrismaService` (database access w/ lifecycle hooks), and shared event definitions.

## Frontend Application

The Next.js app renders the minimum surfaces to operate the agent day:

- `dashboard/` — Broker metrics, deliverability, Clear Cooperation panel.
- `people/` — Contact list with consent badges and detail view (timeline, unified inbox, quick consent-aware messaging).
- `tour-booker/` — Appointment-centric booking with automatic buyer-rep gate feedback.
- `agreements/buyer-rep/` — Broker-side wizard to draft & capture buyer-rep agreements.
- `mls/preflight/` — Publishing checklist enforcing MLS disclaimers and compensation display rules.
- `login/` and `magic-link/` — SSO and consumer magic link placeholders for flows outside the MVP scope.

All frontend data access is routed through `lib/api.ts`, which talks to the Nest API using the tenant context injected via `NEXT_PUBLIC_TENANT_ID`. Quick actions (consent capture, SMS send, tour booking, pre-flight) rely on client components to demonstrate interactive flows while back-end enforcement remains centralized.

## Data Flow & Eventing

1. **Lead creation** — `POST /contacts` persists people, optional consent evidence, generates activity, and queues `lead.created` in the outbox.
2. **Consent capture** — `POST /contacts/:id/consents` creates a ledger entry, clears STOP blocks, writes audit activity, and emits `consent.captured`.
3. **Messaging** — `POST /messages/sms|email` passes through `ComplianceService` (consent, quiet hours, 10DLC), persists messages, updates deliverability metrics, and emits `message.sent` or enforces `403` errors with logged violations.
4. **Tour booking** — `POST /tours` checks buyer-rep agreements, optionally raises a `409` with wizard route, otherwise creates tour, calls routing engine, assigns agents, logs activity, and emits `tour.requested`/`tour.confirmed`.
5. **Publishing** — `POST /mls/preflight` leverages shared MLS guardrails, logging violations and enabling UI feedback; Clear Cooperation timers raise `compliance.violation_detected` events.
6. **Outbox delivery** — Background (or manual) flush loads pending events, signs payloads via HMAC, and posts to active tenant webhooks with exponential backoff.

This architecture satisfies the event-driven, consent-first CRM requirements while remaining extensible for deeper automation, queue-backed workers, and richer UI iterations.
