# Data Model Overview

## Core Entities

- **Organization** — Top-level corporate account; owns one or more `Tenant` records.
- **Tenant** — Brokerage workspace (multi-tenant boundary). Stores quiet hours, 10DLC readiness, Clear Cooperation timers, webhook subscriptions, routing history, and deliverability metrics.
- **User** — Staff account (BROKER, TEAM_LEAD, AGENT, ISA, MARKETING, LENDER) scoped to a tenant & organization with team memberships, owned contacts, tours, assignments, and activities.
- **Team & TeamMembership** — Routing and reporting grouping for users; used for pond fallback routing.
- **Person** — Contact (lead/client) capturing identity, stage, preferred channels, owner, tags, assignment history, documents, tours, agreements, deals, and activity stream.
- **Consent** — Append-only ledger fulfilling evidence requirements (channel, scope, status, verbatim text, source, IP, user-agent, evidence URI). Revocations are timestamped, and related `CommunicationBlock` rows mute channels globally.
- **Listing** — MLS listing metadata; linked to tours, deals, offers, and Clear Cooperation timers.
- **Tour** — Appointment between contact and listing with routing score, status transitions, and assigned agent.
- **Agreement** — Buyer-rep or listing agreement lifecycle with signature log, overrides, and linkage to deals.
- **Deal** — Pipeline opportunity tracking stage, forecast/actual GCI, financials, and relationship to listings/offers.
- **Offer** — Structured offer terms with versioning metadata.
- **MLSProfile** — Per-MLS policy configuration (disclaimer text, compensation rules, Clear Cooperation SLA window) used by the publishing pre-flight.
- **Message** — Unified inbox entries (email, SMS, voice) with deliverability status, metadata, and ties to people/users.
- **Activity** — Append-only audit log for notable events (lead created, consent captured, tour events, compliance violations, routing decisions).
- **Outbox** — Durable event queue for webhook delivery with retry metadata and linkage to WebhookSubscription + WebhookDelivery.
- **Assignment & AssignmentReason** — Routing outcome, scored agent/team, and recorded contributing factors for audit/tuning.
- **Journey & JourneySimulation** — Declarative automation (Triggers → Conditions → Actions) with simulation history for safe testing.
- **ClearCooperationTimer** — Tracks SLA countdown triggered by marketing activity; risk states surface in dashboards and compliance alerts.
- **DeliverabilityMetric** — Aggregated per-channel metrics (accepted, delivered, bounced, complaints, opt-outs) by agent/day.
- **AuditLog** — Field-level change log for sensitive objects; ensures compliance & reporting readiness.

## Migrations & Seeds

The Prisma schema encodes the relationships above. `pnpm --filter @hatch/db migrate:dev` applies migrations to the configured PostgreSQL instance. Seed data (`pnpm --filter @hatch/db seed`) provisions:

- Organization `org-hatch`, tenant `tenant-hatch` with quiet hours, 10DLC enabled.
- Users `user-broker`, `user-agent`, `user-isa` with sample roles.
- Contacts `Casey ColdLead` (no consent) and `Morgan Mover` (active buyer with signed BBA), including consent artifacts, tours, and messages.
- MLS profile `Miami MLS` with disclaimers and Clear Cooperation SLA.
- Clear Cooperation timer, deliverability metrics, webhook subscription, and outbox bootstrap event.

This baseline supports the demo flows (consent capture, messaging, tour booking, pre-flight) immediately after applying migrations and seeding.
