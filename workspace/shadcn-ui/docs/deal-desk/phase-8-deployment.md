# Deal Desk Phase 8 — Deployment Enablement & Documentation

Objective: prepare the Deal Desk & Commissions feature for release by finalizing documentation, seeds, feature flags, and deployment procedures. This phase ensures smooth rollout, observability, and support handoff.

---

## 1. Documentation Deliverables

- **Architecture Docs**: consolidate phases 1–7 into a single overview (`docs/deal-desk/README.md`). Include data model diagrams, service interactions, calculation flow, and reporting summary.
- **API Reference**: update OpenAPI spec (Nest Swagger) with new routes (commission plans, deal forecast, payouts, CDA, reporting). Regenerate static docs if applicable.
- **User Guide**: create broker-facing guide (markdown or Notion) covering:  
  - Plan management  
  - Deal desk workflow (forecast, adjustments, lock, reconcile)  
  - CDA generation & payout approvals  
  - Reporting dashboard usage
- **Troubleshooting Guide**: common issues (e.g., forecast mismatch, CDA failing, cap ledger discrepancy) and resolution steps.
- **Release Notes**: summarizing new functionality, breaking changes, migration requirements.

---

## 2. Feature Flags & Configuration

- Introduce feature flag `feature.dealDeskCommission` (read from config/ENV).  
  - Backend guard for new routes.  
  - Frontend gating for navigation & pages.  
  - Provide mechanism to enable per tenant (e.g., `Tenant.features` array or config table).
- Document toggle procedure: enabling in staging, internal tenants, then production.

---

## 3. Seed Data & Demo Setup

- Extend seed script (`packages/db/src/seed.ts`):  
  - Sample commission plans (flat, tiered cap).  
  - Plan assignments for mock agents.  
  - Example deals with forecasts and payouts.  
  - CDA template references & sample generated CDA.  
- Provide `seed:deal-desk` command to quickly populate demo data for QA/sales.

---

## 4. Migration & Rollout Steps

- Ensure Prisma migrations for all phases are consolidated and re-run on staging.  
- Prepare automation to run `pnpm --filter @hatch/db migrate deploy` during release.  
- Provide rollback instructions (migration revert).  
- Confirm seeds idempotent so they can be re-run post-migration.

---

## 5. Observability & Alerts (from Phase 7)

- Configure logging sinks (e.g., log shipping to Datadog) for new modules.  
- Add dashboards for key metrics (forecast accuracy, CDA success rate).  
- Set alerts for major failures (CDA generation errors, payout export failures).

---

## 6. Support & Training

- Conduct internal demo/training session for broker ops/support.  
- Create FAQ and macros for customer support.  
- Outline escalation path (who handles plan definition bugs, calculation mismatches).

---

## 7. Deployment Checklist

- [ ] Feature flag defaults off in production.  
- [ ] All migrations applied in staging + tested.  
- [ ] Seed data updated and verified.  
- [ ] Documentation published (architecture, user guide, API).  
- [ ] Monitoring dashboards created.  
- [ ] QA signoff (Phase 7 tests complete).  
- [ ] Communication plan ready (release notes, training).  
- [ ] Rollback plan documented (migrations, feature flag).  
- [ ] Production release schedule coordinated with stakeholders.

Once Phase 8 is complete, Deal Desk & Commissions is ready for staged rollout behind feature flags with full documentation and support alignment.
