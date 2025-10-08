# Runbooks

## Local Development

1. `cp .env.example .env` and adjust secrets (API JWT, webhook secret, default tenant/user IDs).
2. Start infrastructure: `docker compose -f infra/docker/docker-compose.yml up -d` (PostgreSQL, Redis, MinIO, Mailhog).
3. Install dependencies: `pnpm install` (run at `hatch-crm/`).
4. Generate Prisma client & apply migrations: `pnpm --filter @hatch/db migrate:dev`.
5. Seed demo data: `pnpm --filter @hatch/db seed`.
6. Start API: `pnpm --filter @hatch/api dev` (port 4000).
7. Start web: `pnpm --filter @hatch/web dev` (port 3000).
8. Open `http://localhost:3000/dashboard` for the broker view.

## Testing

- Unit (shared domain logic): `pnpm --filter @hatch/shared test`
- API (Jest + Supertest): `pnpm --filter @hatch/api test`
- Frontend (Vitest placeholders) + E2E: tbd (Playwright harness recommended; see `docs/testing.md`).

## Seeded Demo Flow Walkthrough

1. Navigate to **People** → open `Casey ColdLead`.
2. Attempt to send SMS → blocked (no consent).
3. Capture SMS consent via Quick Actions → send SMS succeeds.
4. Go to **Tour Booker** → select `Casey` + listing `123 Harbor Way` → receives buyer-rep required response.
5. Open **BBA Wizard** → draft & sign buyer-rep for Casey.
6. Retry **Tour Booker** → tour confirmed (routing auto-assigns agent).
7. Go to **MLS Preflight** → run without disclaimer (fails) → insert disclaimer (passes).

## Operations & Troubleshooting

- **Database migrations**: run `pnpm --filter @hatch/db migrate` in CI/CD pipelines before deploying API.
- **Outbox delivery**: manual flush `POST /webhooks/outbox/flush` when debugging webhook retries.
- **Consent violations**: check `activity` table for entries with `type = 'COMPLIANCE_VIOLATION'` (includes reason + channel).
- **Clear Cooperation**: use `POST /mls/clear-cooperation` to log marketing events; inspect `GET /mls/dashboard` for status.
- **Routing**: review `assignment` & `assignmentReason` tables for scored candidates, or `routing_log` JSON payloads for debugging.

## Deployment Blueprint

- Containerize API & web (Next standalone) with CI pipelines running `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm --filter @hatch/db migrate`, `pnpm --filter @hatch/db seed` (for staging only).
- Provision managed Postgres, Redis, object storage (S3/MinIO), SMTP/email gateway, SMS provider.
- Configure GitHub Actions (example workflow stub included) to run unit/API tests and build artifacts on PR.
