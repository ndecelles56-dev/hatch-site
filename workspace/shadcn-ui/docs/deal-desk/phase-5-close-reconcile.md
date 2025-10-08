# Deal Desk Phase 5 — Close & Reconcile (Actuals vs Forecast)

Goal: allow brokers to record actual closing data, compare to the forecast, handle deltas with adjustments, and lock the deal. This phase also ensures cap ledger updates and activity logs reflect the final state.

---

## 1. Data Model Updates

### 1.1 Deal Table (fields added in Phase 3, now utilized)

- `actualCloseDate`
- `actualNet`
- `actualSnapshot`

Additional fields to add now:

```prisma
model Deal {
  // ...
  actualSalePrice     Decimal? @db.Decimal(14,2)
  actualCommissionRate Decimal? @db.Decimal(6,4)
  actualConcessions   Decimal? @db.Decimal(12,2)
  actualMarketingSpend Decimal? @db.Decimal(12,2)
  reconciliationNotes String?  @db.Text
  reconciledAt        DateTime?
  reconciledById      String?

  reconciledBy        User?    @relation(fields: [reconciledById], references: [id])
}
```

### 1.2 Cap Ledger Updates

- After reconciliation, update `CapLedger` record for the agent (company dollar contributions) based on actual numbers.

### 1.3 Payout Actuals

- When actual data deviates, update `Payout` amounts/status if necessary (e.g., mark as paid or adjust amounts).
- Add `varianceAmount` field to `Payout` to track difference between forecasted and actual amount (optional but helpful).

```prisma
model Payout {
  // ...
  varianceAmount Decimal? @db.Decimal(12,2)
}
```

### 1.4 Activity Types

Add to `ActivityType`:
- `DEAL_RECONCILED`
- `DEAL_REOPENED`
- `DEAL_PAYOUT_ADJUSTED`

---

## 2. Reconciliation Workflow

### 2.1 Steps

1. **Input Actuals**  
   - Broker or authorized user enters actual sale price, commission rate/GCI, concessions, marketing spend, actual referral amounts if changed.
2. **Recompute**  
   - Run the same calculation pipeline with actual data (`DealForecastService` can handle actual scenario).  
   - Compare line items with forecast snapshot.  
   - Produce `actualSnapshot` similar structure with `totals`, `payouts`, etc.
3. **Delta Calculation**  
   - Generate difference list for UI: line item diff and payout diff.  
   - If difference is within tolerance, broker can approve; otherwise add manual adjustments.  
   - Adjustments added at this stage should be tagged with `type=RECONCILIATION`.
4. **Cap Ledger Update**  
   - Update `CapLedger` with actual company dollar; mark post-cap fees.  
   - If deal crosses cap, record event (maybe new table `CapEvent` optional).
5. **Payout Adjustment**  
   - Update existing payout records:  
     - If actual payout differs, set `varianceAmount` and optionally create new `Adjustment` or update amount (depending on policy).  
     - If payout already paid, differences may create new payout or require manual note.
6. **Lock & Activity**  
   - Once reconciliation is confirmed, set `reconciledAt`, `reconciledBy`, `actualNet`.  
   - Log `DEAL_RECONCILED` with payload summarizing deltas.  
   - Deal remains locked; reopen requires broker with reason (`DEAL_REOPENED`).  
   - `Deal.lockedAt` already set; unlocking should also reset `reconciledAt` to null.
7. **Reporting Data**  
   - Provide data to reports: forecast vs actual accuracy, net variance, referral impact, etc.

### 2.2 Tolerance Policy

- Define threshold (e.g., ±$50 or ±1%) to auto-approve differences; if exceeded, require adjustments before locking.  
- Configuration can be stored per tenant (future).

---

## 3. API Endpoints

| Endpoint | Method | Description | RBAC |
| --- | --- | --- | --- |
| `/deals/:id/reconciliation` | POST | Commit actual data; body contains actual sale price, rate, concessions, etc. | Broker, Team Lead (if allowed) |
| `/deals/:id/reconciliation/preview` | POST | Preview actual vs forecast without saving. | Broker, Team Lead |
| `/deals/:id/reopen` | POST | Reopen deal after reconciliation (requires reason). | Broker only |
| `/reports/forecast-accuracy` | GET | Provide accuracy metrics (deal-level). | Broker |

### Request Payload Example

```json
{
  "actualSalePrice": 650000,
  "actualCommissionRate": 0.03,
  "actualManualGci": null,
  "actualConcessions": 2000,
  "actualMarketingSpend": 450,
  "referralIn": { "percentage": 0.05, "counterparty": "Broker X" },
  "referralOut": { "percentage": 0.25, "counterparty": "Team Y" },
  "notes": "Extra staging cost from brokerage"
}
```

Response includes:
```json
{
  "forecastSnapshot": { ... },
  "actualSnapshot": { ... },
  "delta": {
    "totals": {
      "gci": 500,
      "brokerageNet": -200,
      "agentTake": 250
    },
    "payouts": [
      { "payoutId": "po_1", "forecastAmount": 12000, "actualAmount": 11950, "variance": -50 }
    ]
  },
  "requiresAdjustment": true
}
```

---

## 4. Cap Ledger Interaction

- On reconciliation commit:
  - `CapLedgerService.recordDealActuals({ userId, planId, companyDollar, postCapFees, dealId })`.
  - Service calculates new progress, determines if cap reached, and updates period record.
- Optional: create `CapEvent` table to record events like cap reached date.

---

## 5. Activity Logging

- `DEAL_RECONCILED`: includes `dealId`, `forecastTotals`, `actualTotals`, `variance`, `notes`.  
- `DEAL_REOPENED`: includes `reason`, resets `reconciledAt`.  
- `DEAL_PAYOUT_ADJUSTED`: triggered when actual payout differs and amount changed.  
- For adjustments added during reconciliation, reuse `DEAL_ADJUSTMENT_ADDED` with `type=RECONCILIATION`.

---

## 6. Frontend UX

### 6.1 Deal Desk Reconciliation Panel

- After lock, show “Enter actuals” button (broker).  
- Form to input actual data; show preview with forecast vs actual comparison (side-by-side).  
- Highlight differences: use colored deltas (green if favorable, red if not).  
- Provide ability to add reconciliation adjustment (type locked to `RECONCILIATION`).  
- Show cap progress update (if cap reached).

### 6.2 Deal Lock Status

- Show locked & reconciled badges.  
- Provide “Reopen deal” option (broker only) with reason input; enters activity log.

### 6.3 Reporting Updates

- Add tile/view under commissions dashboard:
  - Forecast accuracy gauge.  
  - Table of deals with high variance (drill down).

### 6.4 Payout Updates

- If actual payout differs from forecast, reflect new amount & variance in payout table.  
- Provide visual indicator (e.g., tooltip “Adjusted +$50 at close”).

---

## 7. Testing Strategy

### Unit Tests

- Reconciliation service handles manual GCI, referral differences, adjustments.  
- Cap ledger updates correctly when cold start vs partial progress.  
- Payout variance calculations accurate.

### Integration Tests

- Reconciliation API: commit actuals -> check DB for `actualSnapshot`, `actualNet`, `reconciledAt`, `payout variance`.  
- Delta requires adjustment: ensure API returns `requiresAdjustment = true` if beyond tolerance.  
- Reopen API resets states and logs activity.  
- Cap ledger increments after reconciliation.

### Frontend Tests

- Cypress: forecast -> lock -> enter actuals -> confirm delta display -> commit -> reopen.  
- Ensure role-based restrictions for adjustments/lock/unlock.

---

## 8. Implementation Checklist

- [ ] Extend Prisma schema for actual fields, `varianceAmount`.  
- [ ] Update services: `DealForecastService` to handle actual inputs & delta calculation.  
- [ ] Implement `DealReconciliationService` (wraps forecast + adjustments + payouts).  
- [ ] Add reconciliation endpoints + RBAC guards.  
- [ ] Update `CapLedgerService` to persist actual contributions.  
- [ ] Enhance `PayoutService` to handle variance updates.  
- [ ] Update frontend Deal Desk page with actuals form, delta display, lock & reopen flows.  
- [ ] Update reporting API to include forecast vs actual metrics.  
- [ ] Write unit/integration tests.  
- [ ] Update docs/README & seeds (sample actuals).

Completion of Phase 5 yields a closed-loop process from forecast to actual funding with controlled adjustments, enabling accurate reporting and cap tracking.
