# Deal Desk Phase 7 — Testing & Hardening

Objective: ensure the entire Deal Desk & Commissions feature set is production-ready. This phase focuses on polishing test coverage (unit, integration, e2e), performance checks, auditing/observability, and release readiness.

---

## 1. Testing Matrix

### 1.1 Unit Tests

| Area | Coverage |
| --- | --- |
| Commission Plan evaluator | Flat, tiered, cap crossover, referral policies, fee/bonus calculations, rounding. |
| Cap Ledger | Accumulation, reset per period, cap reach detection. |
| Deal Forecast | GCI computation, adjustments, brokerage net, payout rounding, dual-agency (if implemented). |
| Adjustments | Target application, validation, tolerance. |
| Payout Service | Approve/mark paid transitions, variance updates. |
| CDA Service | Snapshot assembly, template merge logic (mock file output). |
| Reporting queries | Parameter handling, JSON conversions. |

### 1.2 Integration Tests (Nest e2e)

- CRUD flows: Commission plans, plan assignments.  
- Deal forecast commit -> adjustments -> lock -> reconcile -> payouts -> CDA generation.  
- RBAC scenarios: agent/team lead/broker/accounting access checks.  
- Reporting endpoints with seeded data.  
- Export endpoints returning CSV/links.  
- Payout approvals integrated with activity logs.

### 1.3 Frontend Tests

- Component tests for plan editor, deal inputs, forecast panel, payout register, CDA modal, reporting tiles.  
- Cypress flows:  
  - Agent creates deal, runs forecast, adds adjustment.  
  - Broker locks deal, generates CDA, approves payouts, marks paid, reconciles actuals.  
  - Reporting dashboard filter interactions.  

### 1.4 Regression

- Ensure existing CRM functionality unaffected (contacts, tours, etc.).  
- Run full API test suite + UI smoke tests pre-release.

---

## 2. Performance & Scalability

### 2.1 Forecast Engine

- Benchmark forecast commit for large deals (complex tiers, multiple fees).  
- Ensure calculations stay <200ms per request.  
- Optimize plan evaluator (memoize tier lookups, avoid repeated JSON parse).

### 2.2 Reporting Queries

- Run load tests for aggregated dashboards (5k+ deals).  
- Use Postgres indexes/materialized views if queries >1s.  
- Possibly cache expensive metrics with TTL (Redis) and invalidate on deal reconciliation.

### 2.3 Exports

- For large payout exports, stream response to avoid memory spikes.  
- Limit export size or paginate plus background job if needed.

---

## 3. Observability & Monitoring

- Add structured logging at key events (forecast commit, CDA generation, payout status).  
- Attach correlation IDs using existing logging utilities.  
- Metrics:  
  - Count of forecasts processed, errors.  
  - CDA generation success/failure.  
  - Payout approvals per day.  
- Alerts:  
  - Forecast engine errors > threshold.  
  - CDA generation failures.  
  - Reporting query latency spikes.

If using a monitoring stack (Datadog, OpenTelemetry), instrument services with spans.

---

## 4. Data Validation & Migration Strategies

- Double-check Prisma migrations executed cleanly in staging.  
- Provide fallback data migration scripts (e.g., initial cap ledger seeded to zero).  
- Add DB constraints where necessary (e.g., no overlapping plan assignments).  
- Provide SQL scripts to roll back latest migrations if needed.

---

## 5. Security & Compliance

- Verify RBAC enforcement on all new endpoints.  
- Ensure CDA PDF storage secure (S3 bucket policies, signed URLs).  
- Activity logs: confirm all manual interventions (adjustments, lock/unlock, payout approvals) recorded.  
- Confirm rounding policy documented (one place in code & docs).  
- On data export (CSV), include disclaimers and mask sensitive info if required.

---

## 6. Release Plan

### 6.1 Feature Flags

- Wrap Deal Desk UI and API routes behind feature flag toggled per tenant.  
- Stage release (internal testing) before enabling for all brokers.

### 6.2 Documentation

- Update README / knowledge base with user guide.  
- Record short Loom/guide for brokers on new workflow.  
- Provide API docs (OpenAPI update) for new endpoints.

### 6.3 Training & Support

- Brief support team on new flows.  
- Provide migration notes for existing deals (e.g., manual entry required for historical deals).

---

## 7. QA Checklist

- [ ] All unit tests pass with >80% coverage for key services.  
- [ ] Integration and Cypress suites green.  
- [ ] Performance benchmarks meet targets.  
- [ ] RBAC manual verification across roles.  
- [ ] Activities & audit logs cross-checked for sample flows.  
- [ ] Reporting numbers reconcile with manual spreadsheet for sample data.  
- [ ] CDA PDFs validated for accuracy/layout.  
- [ ] Seed data updated; demo scenario works end-to-end.  
- [ ] Documentation complete (architecture, user guide, API).  
- [ ] Rollback plan documented.

Phase 7 concludes the Deal Desk initiative by ensuring the stack is hardened, observable, and well-tested before general availability.
