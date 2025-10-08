# Testing Strategy

## Unit Tests

- **Consent Enforcement** (`packages/shared/src/__tests__/consent.spec.ts`) — verifies quiet-hours, STOP, and 10DLC guardrails for each channel/scope combination.
- **Routing Scoring** (`packages/shared/src/__tests__/routing.spec.ts`) — ensures high-scoring agents are selected, low-score fallbacks drop to team pond, and weights affect outcomes.
- **MLS Pre-flight** (`packages/shared/src/__tests__/mls.spec.ts`) — validates disclaimer/compensation rule enforcement and pass/fail response payloads.

Run via `pnpm --filter @hatch/shared test`.

## API Tests

`apps/api/test/app.e2e-spec.ts` boots the Nest app (Fastify adapter) and uses Supertest to cover:

1. Create contact → 201 with ID.
2. Send SMS without consent → 403 with descriptive reason.
3. Capture SMS consent → retry send → 201 success.
4. Request tour without BBA → 409 buyer-rep required payload.
5. Draft + sign BBA → re-request tour → confirmed with assignment.
6. MLS pre-flight → failure (missing disclaimer) then pass (disclaimer provided).

Execute with `pnpm --filter @hatch/api test`.

## Frontend & E2E

- Component coverage leverages domain unit tests; UI interaction smoke tests can be added with Playwright (recommended targets: consent capture → send SMS flow, tour booking w/ BBA gate, MLS pre-flight swap).
- Suggested workflow:
  1. `pnpm exec playwright install` (once).
  2. Author specs in `apps/web/tests/e2e` (not yet implemented) hitting the running dev servers.

## CI Pipeline (Blueprint)

1. Install dependencies (`pnpm install`).
2. Spin up PostgreSQL/Redis services (Docker service containers).
3. `pnpm --filter @hatch/db migrate` + `pnpm --filter @hatch/db seed`.
4. `pnpm lint` (`turbo run lint`).
5. `pnpm test` (`turbo run test`).
6. `pnpm build` (`turbo run build`).
7. Publish artifacts: Next standalone output, Nest compiled dist, OpenAPI spec (`/docs` endpoint on API).

## Coverage Gaps & Next Steps

- Add dedicated tests for event outbox retry policy and webhook signing.
- Implement Playwright suite exercising login stub → contact 360 → consent capture → messaging.
- Add contract tests for routing assignments (mocking agent snapshots vs Prisma queries).
- Expand compliance logging assertions (Activity records, Deliverability metrics) once audit workflows mature.
