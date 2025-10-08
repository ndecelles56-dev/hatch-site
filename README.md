# Hatch CRM Monorepo

Hatch CRM is a contact-first, consent-driven CRM for real estate brokerages. This Turborepo provides:

- `apps/api` — NestJS + Fastify REST API with Prisma/PostgreSQL, Redis-backed outbox, routing engine, and compliance guardrails.
- `apps/web` — Next.js (App Router) frontend for broker dashboard, Contact 360, Tour Booker, Buyer-Rep wizard, and MLS publishing pre-flight.
- `packages/db` — Prisma schema, migrations, and seeds for multi-tenant domain entities.
- `packages/shared` — Domain utilities (consent enforcement, routing, MLS rules, journey simulation, event envelopes).
- `infra/docker` — Local dependencies (Postgres, Redis, MinIO, Mailhog).
- `docs/` — Architecture, data model, testing plan, compliance guardrails, and runbooks.

## Quick Start

```bash
cp .env.example .env
pnpm install
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter @hatch/db migrate:dev
pnpm --filter @hatch/db seed
pnpm --filter @hatch/api dev    # http://localhost:4000 (OpenAPI at /docs)
pnpm --filter @hatch/web dev    # http://localhost:3000
```

Seeded demo showcases:

1. Attempt SMS to Casey → blocked (no consent).
2. Capture SMS consent via Contact 360 Quick Actions → send succeeds.
3. Request tour without BBA → API returns buyer-rep required payload.
4. Draft + sign BBA in wizard → re-request tour → confirmed & routed.
5. Publishing pre-flight fails without MLS disclaimer → pass after adding required text.

## Documentation

- [Architecture](docs/architecture.md)
- [Data Model](docs/data-model.md)
- [Compliance Guardrails](docs/compliance.md)
- [Testing Strategy](docs/testing.md)
- [Runbooks](docs/runbooks.md)
