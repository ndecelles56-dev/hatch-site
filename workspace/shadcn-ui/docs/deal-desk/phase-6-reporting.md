# Deal Desk Phase 6 — Reporting & KPIs

Objective: surface the KPIs defined in the spec (forecast accuracy, company dollar/net by team/period, cap progress, referral mix, CDA approval timing) via backend reporting APIs and frontend dashboards.

---

## 1. Reporting Dimensions & Metrics

### 1.1 Core Metrics

| Metric | Definition | Source |
| --- | --- | --- |
| Forecast Accuracy | % difference between forecast `expectedNet` and actual `actualNet`; target ±10% on ≥80% of deals. | `Deal.forecastSnapshot`, `Deal.actualSnapshot` |
| Company Dollar | Sum of company dollar per deal (forecast and actual). | `forecastSnapshot.totals.companyDollar`, cap ledger |
| Brokerage Net | Net margin (forecast vs actual). | snapshots |
| Cap Progress | Cap remaining per agent; time-to-cap. | `CapLedger` |
| Referral Mix | Count/sum of referral in/out amounts. | `ReferralAgreement`, `Deal` snapshots |
| CDA Approval Time | Time from CDA generation to approval/sent. | `CDA.generatedAt`, `approvedAt`, `sentTo` |
| Days to CDA | Generated to actual sending (median). | `CDA` |
| Payout Status Summary | Counts/amounts per payout status. | `Payout` |

### 1.2 Dimensions / Filters

- Time: day, week, month, quarter, year (based on `actualCloseDate` or `expectedCloseDate`).  
- Team / Agent: join via `Deal.agentId`, `PlanAssignment`.  
- Deal Side: buyer/seller/dual.  
- Channel: via `SpendLine.channel`, optional.  
- Plan: `deal.planSnapshot.planId`.

---

## 2. Reporting Data Strategy

### 2.1 Real-time vs Aggregated

- For MVP, rely on SQL aggregation (views or materialized views) since data volume is manageable.  
- Optionally create nightly materialized views if performance becomes an issue.  
- Use `CapLedger` for quick cap progress; aggregate deals for forecast accuracy.

### 2.2 Suggested Tables/Views

1. `deal_forecast_actual_view`: columns for deal id, agent, team, close date, forecast net, actual net, variance, accuracy flags.  
2. `company_dollar_summary_view`: sum of company dollar by period/team/agent (use `forecastSnapshot` JSON -> aggregated).  
3. `referral_summary_view`: counts/amounts for referral in/out.  
4. `cda_metrics_view`: durations between generated/approved/sent.  
5. `payout_summary_view`: sums by status/dates.

(Views can be implemented as SQL definitions or query builder in service.)

---

## 3. Backend Implementation

### 3.1 Reporting Module (Nest)

```
apps/api/src/modules/reporting/
  ├── reporting.module.ts
  ├── reporting.controller.ts
  ├── reporting.service.ts
  ├── dto/
  │    ├── date-range.dto.ts
  │    ├── team-filter.dto.ts
  │    └── pagination.dto.ts
  └── queries/
       ├── forecast-accuracy.sql
       ├── company-dollar.sql
       ├── cap-progress.sql
       ├── referrals.sql
       └── cda-metrics.sql
```

### 3.2 API Endpoints

| Endpoint | Description | Response |
| --- | --- | --- |
| `GET /reports/forecast-accuracy` | Filter by date range/team/agent. | `{ items: [], accuracyRate, dealsWithinTolerance }` |
| `GET /reports/company-dollar` | Summaries by period/team. | array of rows with forecast vs actual. |
| `GET /reports/forecast-vs-actual` | Table of deals with variance. | list of deals + delta. |
| `GET /reports/cap-progress` | Already planned (Phase 2 but extend). | extend to include actual cap contributions. |
| `GET /reports/referral-mix` | IN/OUT counts/amounts. | aggregated data. |
| `GET /reports/cda-timing` | CDA approval durations. | medians, distribution. |
| `GET /reports/payout-status` | Summary of payouts. | counts/amounts per status. |

All endpoints accept filters `dateFrom`, `dateTo`, `teamId`, `agentId`, `planId`, `status`.

### 3.3 RBAC

- Broker: full access.  
- Team Lead: restricted to their team’s deals (filter by team).  
- Accounting: read access for payout/cap reports.  
- Agents: optional access to personal metrics (scope-limited).

### 3.4 Data Access

- Use Prisma raw queries or SQL template files to leverage JSON -> numeric conversion. Example:
  ```sql
  SELECT
    d."id",
    (d."forecastSnapshot" -> 'totals' ->> 'brokerageNet')::numeric AS forecast_net,
    (d."actualSnapshot" -> 'totals' ->> 'brokerageNet')::numeric AS actual_net,
    ((d."actualSnapshot" -> 'totals' ->> 'brokerageNet')::numeric -
     (d."forecastSnapshot" -> 'totals' ->> 'brokerageNet')::numeric) AS variance
  FROM "Deal" d
  WHERE d."tenantId" = $1
    AND d."actualCloseDate" BETWEEN $2 AND $3;
  ```

- For performance, consider indexes on JSON fields using computed columns if necessary.

---

## 4. Frontend Dashboards

### 4.1 `/broker/commissions-dashboard`

Sections:
- **Top Tiles**  
  - `Company Dollar MTD` (actual), `Forecast Accuracy (rolling 90 days)`, `Agents Near Cap`, `Referral Mix (In vs Out)`, `Median Days to CDA`.
- **Cap Progress Table**  
  - Extend from Phase 2 data, show actual contributions.
- **Forecast vs Actual Table**  
  - List deals with high variance, filters by team/agent.
- **Referral Impact Chart**  
  - Bar or pie chart showing referrals in/out amounts per channel.
- **Payout Status Summary**  
  - Pie or stacked bar (pending/approved/paid).
- **CDA Timing Chart**  
  - Histogram or timeline for generated -> approved -> sent durations.

### 4.2 Components & Hooks

- Add hooks to `src/lib/api/hatch.ts`:
  ```ts
  export async function fetchForecastAccuracy(params: ReportFilter): Promise<ForecastAccuracyResponse>;
  export async function fetchCompanyDollarReport(params: ReportFilter): Promise<CompanyDollarResponse>;
  export async function fetchReferralMixReport(params: ReportFilter): Promise<ReferralMixResponse>;
  export async function fetchCdaTimingReport(params: ReportFilter): Promise<CdaTimingResponse>;
  export async function fetchPayoutStatusSummary(params: ReportFilter): Promise<PayoutStatusSummary>;
  ```

- Implement charts using existing library (e.g., Recharts).
- Ensure date filters shared across components (context or state).

### 4.3 Export Options

- Provide CSV export for key reports (company dollar, variance, payouts).  
- Call the same backend endpoints with `format=csv` option; return file link.

---

## 5. Testing Plan

### Backend

- Unit tests for service query builders (validate parameterization).  
- Integration tests hitting each endpoint with seeded data (use `prisma` with fixtures).

### Frontend

- Component tests ensure tiles/charts render with sample data.  
- Cypress test verifying filters update charts/tables.

### Performance

- Load test aggregated endpoints with sample dataset (thousands of deals) to ensure acceptable response time (<1s).  
- If needed, add indexes or precomputed materialized views.

---

## 6. Implementation Checklist

- [ ] Create reporting module & controller in Nest.  
- [ ] Implement SQL queries / Prisma raw queries for each metric.  
- [ ] Add feature flag for dashboard route.  
- [ ] Build frontend dashboard with tiles, charts, tables.  
- [ ] Add exports & download UX.  
- [ ] Write unit/integration tests.  
- [ ] Document metrics definitions in README (`docs/deal-desk/reporting.md`?).  
- [ ] Set up seed data to populate reporting demos.  
- [ ] Ensure security (RBAC) on endpoints.  
- [ ] Monitor query performance; add indexes if necessary.

Completing Phase 6 provides the analytics layer on top of the Deal Desk data, enabling brokers and accounting to monitor performance and cap progression.
