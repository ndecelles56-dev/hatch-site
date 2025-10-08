# Deal Desk & Commissions v1 – Architecture Outline

## 1. Purpose

Provide a broker-facing workspace that turns deal gross commission income (GCI) into accurate margin forecasts, applies complex commission plans, and produces auditable payout artifacts (CDA, payout register, activity log). This document captures the foundation decisions needed before implementation.

## 2. Domain Overview

### 2.1 New / Extended Entities

| Entity | Type | Key Fields | Notes |
| --- | --- | --- | --- |
| `Deal` (extend) | Existing table | `side`, `stage`, `expectedCloseDate`, `actualCloseDate`, `salePrice`, `commissionRate`, `manualGci`, `referralInId`, `referralOutId`, `marketingSpendToDate`, `expectedNet`, `actualNet`, `forecastSnapshot`, `actualSnapshot`, `lockedAt`, `lockedById`, `planVersionId` | Snapshot fields will store JSON of calculation inputs/outputs for audit. |
| `CommissionPlan` | New | `id`, `name`, `type (FLAT|TIERED|CAP)`, `description`, `definition` (JSON storing tiers/cap rules), `postCapFee`, `bonusRules`, `createdAt`, `updatedAt`, `createdById`, `archivedAt` | `definition` holds the structured rules so we can evolve without schema churn. |
| `PlanAssignment` | New | `id`, `assigneeType (USER|TEAM)`, `assigneeId`, `planId`, `effectiveStart`, `effectiveEnd`, `priority`, `notes`, `createdAt` | Priority handles overlapping assignments; store historical plan versions. |
| `CapLedger` | New | `id`, `userId`, `planId`, `periodStart`, `periodEnd`, `companyDollarAccumulated`, `capAmount`, `resetAt` | Supports quick cap progress checks. |
| `ReferralAgreement` | New | `id`, `dealSide (BUY|SELL|BOTH)`, `direction (IN|OUT)`, `counterparty`, `percentage`, `flatFee`, `documentUrl`, `notes` | Linked to `Deal` via `referralInId` / `referralOutId`. |
| `Adjustment` | New | `id`, `dealId`, `type (COMPLIANCE|RETENTION|ROUNDING|MANUAL)`, `amount`, `appliesTo (COMPANY|AGENT|NET)`, `notes`, `createdById`, `createdAt` | Required reason text per compliance rule. |
| `Payout` | New | `id`, `dealId`, `partyType (AGENT|BROKERAGE|TEAM_LEAD|MENTOR|REFERRER)`, `partyId`, `amount`, `status (PENDING|APPROVED|PAID|VOID)`, `expectedDate`, `paidDate`, `paymentMethod`, `reference`, `metadata`, `createdAt`, `updatedAt`, `approvedById`, `paidById` | `metadata` stores info such as check number, wire details. |
| `CDA` | New | `id`, `dealId`, `templateId`, `snapshot` (JSON), `generatedAt`, `generatedById`, `approvedAt`, `approvedById`, `sentToEmails`, `voidedAt`, `voidReason` | Snapshot holds the merge data in case template changes later. |
| `SpendLine` (optional) | New | `id`, `dealId`, `category`, `channel`, `amount`, `notes`, `incurredAt`, `createdAt` | Feeds ROI reporting. |
| `Activity` (extend) | Existing audit log | Add new `type` enums: `DEAL_PLAN_LOCKED`, `DEAL_PLAN_UNLOCKED`, `DEAL_ADJUSTMENT_ADDED`, `DEAL_ADJUSTMENT_REMOVED`, `DEAL_CDA_GENERATED`, `DEAL_CDA_VOIDED`, `PAYOUT_STATUS_CHANGED`, `PLAN_VERSION_SNAPSHOTTED`. Payload contains relevant IDs and before/after values. |

### 2.2 Relationships

- `Deal` ⇔ `CommissionPlan` via `planVersionId` (snapshot of plan definition at forecast time).
- `PlanAssignment` references either `User` or `Team`. Use `assigneeType` to differentiate.
- `Deal` ⇔ `ReferralAgreement` (two optional relationships).
- `Deal` ⇔ `Adjustment` (1:N), `Deal` ⇔ `Payout` (1:N), `Deal` ⇔ `CDA` (1:N).
- `CapLedger` aggregated per `User` + `planId` (with period boundaries determined by plan configuration).
- `Payout` optionally references `User`, `Team`, or `ReferralAgreement` depending on `partyType`; enforce via nullable foreign keys or union + metadata.

## 3. Calculation Pipeline

1. **GCI Determination**  
   - `gciListing = salePrice * commissionRateListing` (unless manual override).  
   - `gciBuying` analogous for buyer side. Dual-agency computes both and sums.  
   - Manual GCI overrides either side.
2. **Referral Adjustments**  
   - `referralOut` subtracts from GCI pre-split.  
   - `referralIn` recorded separately; counted in brokerage net but not split to agent (unless plan flag set in definition).
3. **Apply Commission Plan** (`CommissionPlanEvaluator`)  
   - For each side, apply plan tiers to GCI to get `companyDollar` vs `agentTake`.  
   - For cap plans, retrieve `CapLedger` YTD, determine pre- vs post-cap amounts.  
   - Support plan definition: `tiers[]` (threshold, split), `capAmount`, `capResetPolicy`, `postCapFee` (flat per deal or percentage).
4. **Team/Mentor Fees**  
   - Plan definition includes `fees[]` with `timing (PRE_CAP|POST_CAP|ALWAYS)`, `basis (PERCENTAGE|FLAT)`, `beneficiary`.  
   - Deduct from agent or company portion per config; create corresponding `Payout` entries.
5. **Bonuses/Penalties**  
   - Evaluate `bonusRules` (e.g., recruiting bonus to agent, compliance fee to brokerage).  
   - Add or subtract from relevant `Payout` line items.
6. **Brokerage Net Calculation**  
   - `brokerageNet = companyDollar + postCapFees + referralIn - referralOut - bonusesPaid - concessionsBroker - marketingSpend`.  
   - Adjust for manual adjustments.
7. **Payout Allocation**  
   - Generate `Payout[]` entries for each party with amounts rounded to cents.  
   - Ensure sum(Payouts) == `gci - referralOut + referralIn - concessions - marketingAdjustments` (after adjustments).
8. **Snapshotting**  
   - Store full calculation result as JSON in `Deal.forecastSnapshot` (inputs, plan version, ledger state, payout lines).  
   - On lock or actual reconciliation, copy to `actualSnapshot` to enable delta report.

## 4. Service Architecture (NestJS)

### 4.1 Modules

- `commission-plans` — manages `CommissionPlan`, `PlanAssignment`, cap ledger.  
- `deal-desk` — handles deal forecast, adjustments, reconciliation, locking.  
- `payouts` — manages payout lifecycle, exports.  
- `cda` — generates, stores, emails CDA PDFs.  
- `reporting` — provides summary metrics (cap progress, forecast accuracy, etc.).

### 4.2 Core Services

| Service | Responsibilities |
| --- | --- |
| `CommissionPlanService` | CRUD, validation, compile plan definitions. |
| `PlanAssignmentService` | Determine active plan for user/team at forecast time. |
| `CapLedgerService` | Track company dollar accrual, update after each deal, reset per plan period. |
| `DealForecastService` | Orchestrate plan evaluation, referral adjustments, fees, bonuses, snapshots. |
| `PayoutService` | Generate payout lines, handle approvals, mark as paid, export register. |
| `AdjustmentService` | Manage adjustments with audit logging. |
| `CdaService` | Merge snapshot data into templates, enqueue PDF/email via existing outbox. |
| `AuditService` | Persist activity entries across modules. |

### 4.3 Activity & Versioning

- Always store plan definition snapshot on the deal (no lookups later).  
- Every adjustment, plan change, CDA action writes `Activity` with payload diff.  
- Lock/unlock requires reason; recorded in `Activity` plus `Deal.lockedAt`.

## 5. API Contract (initial sketch)

| Endpoint | Method | Description | RBAC |
| --- | --- | --- | --- |
| `/commission-plans` | GET/POST/PATCH/ARCHIVE | Manage plans. | Broker only (Team Lead read). |
| `/commission-plans/:id/assignments` | GET/POST/PATCH | Manage assignments. | Broker only. |
| `/deals/:id/forecast` | POST | Compute forecast snapshot (returns line items + payouts). | Agent+ (own deals), Team Lead (team), Broker. |
| `/deals/:id/adjustments` | POST/DELETE | Manage adjustments with reasons. | Broker, Team Lead (create), Agent (propose?). |
| `/deals/:id/lock` | POST | Lock or unlock with reason. | Broker only. |
| `/payouts` | GET | Filter by status/date/team. | Broker, Accounting, Team Lead (team). |
| `/payouts/:id/approve` | POST | Approve payout. | Broker. |
| `/payouts/:id/mark-paid` | POST | Mark as paid with reference. | Broker, Accounting. |
| `/payouts/export` | GET | CSV register. | Accounting, Broker. |
| `/cda/:dealId` | POST/GET/POST void | Generate, fetch, void/reissue CDA. | Broker (approve), Team Lead (generate proposal). |
| `/reports/cap-progress` | GET | Agent cap status. | Broker, Team Lead (team). |
| `/reports/forecast-vs-actual` | GET | Comparison data. | Broker. |

All endpoints should include RBAC guards, validation, and activity logging.

## 6. Frontend Surfaces

1. **Deal Desk** (`/broker/deal-desk/:dealId`)  
   - Wizard for deal inputs (side, price, rates).  
   - Forecast panel (line items with tooltips, adjustments).  
   - Payout register (editable statuses).  
   - CDA section (generate, preview, send).
2. **Plans & Caps** (`/broker/commission-plans`)  
   - Table of plans (type, active assignments).  
   - Drawer/modal to edit tiers/caps.  
   - Cap tracker (per agent progress).
3. **Reports** (`/broker/commissions-dashboard`)  
   - Tiles: company dollar MTD, forecast accuracy, agents nearing cap.  
   - Table exports for payout register, cap progress.  
4. **Activity Timeline**  
   - Better surface within deal details showing adjustments, lock events, CDA actions.

## 7. Implementation Roadmap (Phased)

1. **Plans & Cap Ledger**  
   - Migrations for `CommissionPlan`, `PlanAssignment`, `CapLedger`.  
   - Backend CRUD & cap progress API.  
   - UI for plan management + cap tracker.  
2. **Deal Sheet Forecast (single side)**  
   - Deal schema extensions, forecast service, adjustments.  
   - Deal desk UI (inputs + forecast).  
3. **Payout Register & Exports**  
   - `Payout` table, status flows, CSV export.  
   - UI register with approvals.  
4. **CDA Generation**  
   - CDA entity, PDF service, email workflow.  
   - UI modal with preview/approval.  
5. **Close & Reconcile**  
   - Actuals intake, delta computation, lock workflow.  
   - Activity logging + audit surfaces.  
6. **Reporting & KPIs**  
   - Aggregate metrics, dashboard UI.  

Each slice should be gated via feature flag, with migrations coordinated and test suites updated (unit tests for calculation scenarios, integration tests for API endpoints).

## 8. Testing Strategy

- **Unit tests** for plan evaluator (flat, tiered, cap crossover, dual agency).  
- **Integration tests** covering API endpoints (Nest e2e suite) to ensure payouts reconcile to GCI.  
- **Snapshot tests** for CDA PDF data to guarantee stable merge fields.  
- **Performance tests** for payout export on large datasets (thousands of payouts).  
- QA acceptance scenarios per requirements document.

## 9. Open Questions / Follow-ups

- Do we need per-tenant customizable plan definition schemas or is JSON flexible enough?  
- Confirm rounding policy (Bankers vs standard).  
- Decide on template engine for CDA (existing PDF stack or new).  
- Determine if referral-in amounts ever share with agent (policy toggle in plan?).  
- How do we version plan definitions—explicit version column or diff stored within `CommissionPlan`? (Proposal: version column increments on change, stored as part of `definition`.)

This architecture baseline completes Phase 1: requirements capture, data modeling, service layout, and implementation roadmap. Future phases will convert this into Prisma migrations, Nest modules, and React surfaces.
