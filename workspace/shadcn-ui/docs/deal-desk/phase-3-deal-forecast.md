# Deal Desk Phase 3 — Deal Sheet Forecast (Single Side)

Goal: extend the data model and services so the system can compute a forecast for a deal (single transaction side), record adjustments, and provide the Deal Desk UI with line-item math plus a payout register stub. This phase consumes the Commission Plan + Cap tooling shipped in Phase 2.

---

## 1. Data Model Extensions (Prisma)

### 1.1 Deal Table

Add the following columns to the existing `Deal` model:

```prisma
model Deal {
  // existing fields ...

  side              DealSide         @default(BUYER)
  status            DealStatus       @default(PIPELINE)
  expectedCloseDate DateTime?
  actualCloseDate   DateTime?
  salePrice         Decimal?         @db.Decimal(14,2)
  commissionRate    Decimal?         @db.Decimal(6,4) // e.g. 0.03 = 3%
  manualGci         Decimal?         @db.Decimal(12,2)
  concessions       Decimal?         @db.Decimal(12,2) // broker-borne concessions
  marketingSpend    Decimal?         @db.Decimal(12,2) // to-date spend
  referralInId      String?
  referralOutId     String?
  expectedNet       Decimal?         @db.Decimal(12,2)
  actualNet         Decimal?         @db.Decimal(12,2)
  forecastSnapshot  Json?            // full calc snapshot at forecast time
  actualSnapshot    Json?            // same structure at reconciliation
  planSnapshotId    String?          // references PlanSnapshot
  lockedAt          DateTime?
  lockedById        String?

  referralIn        ReferralAgreement? @relation("ReferralIn", fields: [referralInId], references: [id])
  referralOut       ReferralAgreement? @relation("ReferralOut", fields: [referralOutId], references: [id])
  planSnapshot      PlanSnapshot?      @relation(fields: [planSnapshotId], references: [id])
  lockedBy          User?              @relation(fields: [lockedById], references: [id])
}

enum DealSide {
  BUYER
  SELLER
  DUAL
}

enum DealStatus {
  PIPELINE
  UNDER_CONTRACT
  FUNDED
  CLOSED
  CANCELLED
}
```

### 1.2 Adjustments Table

```prisma
model Adjustment {
  id          String           @id @default(cuid())
  tenantId    String
  dealId      String
  type        AdjustmentType
  appliesTo   AdjustmentTarget // COMPANY | AGENT | BROKERAGE_NET
  amount      Decimal          @db.Decimal(12,2)
  notes       String?          @db.Text
  createdById String
  createdAt   DateTime         @default(now())

  tenant      Tenant           @relation(fields: [tenantId], references: [id])
  deal        Deal             @relation(fields: [dealId], references: [id])
  createdBy   User             @relation(fields: [createdById], references: [id])

  @@index([tenantId, dealId])
}

enum AdjustmentType {
  COMPLIANCE
  RETENTION
  ROUNDING
  MANUAL
}

enum AdjustmentTarget {
  COMPANY
  AGENT
  BROKERAGE_NET
}
```

### 1.3 Payout (Stub for Phase 4)

Create the table now so forecasts can emit placeholder records (status = `PENDING`):

```prisma
model Payout {
  id           String          @id @default(cuid())
  tenantId     String
  dealId       String
  partyType    PayoutPartyType
  partyId      String?         // nullable for brokerage
  amount       Decimal         @db.Decimal(12,2)
  status       PayoutStatus    @default(PENDING)
  expectedDate DateTime?
  paidDate     DateTime?
  method       String?
  reference    String?
  metadata     Json?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  approvedById String?
  paidById     String?

  tenant       Tenant          @relation(fields: [tenantId], references: [id])
  deal         Deal            @relation(fields: [dealId], references: [id])
  approvedBy   User?           @relation("PayoutApprovedBy", fields: [approvedById], references: [id])
  paidBy       User?           @relation("PayoutPaidBy", fields: [paidById], references: [id])

  @@index([tenantId, dealId, status])
}

enum PayoutPartyType {
  AGENT
  BROKERAGE
  TEAM_LEAD
  MENTOR
  REFERRER
}

enum PayoutStatus {
  PENDING
  APPROVED
  PAID
  VOID
}
```

### 1.4 Activity Types

Add enums to existing `ActivityType`:

```
DEAL_FORECAST_CREATED
DEAL_FORECAST_RECALCULATED
DEAL_ADJUSTMENT_ADDED
DEAL_ADJUSTMENT_REMOVED
DEAL_LOCKED
DEAL_UNLOCKED
```

---

## 2. Forecast Calculation (Single Side)

### 2.1 Service Responsibilities

`DealForecastService` orchestrates the following:

1. **Input Prep**  
   - Load deal + partner info.  
   - Resolve commission plan via `PlanAssignmentService` (Phase 2).  
   - Snapshot plan definition (`PlanSnapshot`).
2. **GCI**  
   - If `manualGci` present, use it and treat commission rate as display-only.  
   - Otherwise: `gci = salePrice * commissionRate`. For dual agency (future), run per side; for Phase 3 limit to single side.
3. **Referral Adjustments**  
   - `referralOut` (percentage or flat) applied before split.  
   - `referralIn` tracked separately (added to brokerage net after splits unless plan definition says otherwise).
4. **Plan Evaluation**  
   - Use `CommissionPlanEvaluator` (Phase 2) to compute `companyDollar`, `agentTake`, `capEvents`.  
   - Update `CapLedger` with company dollar to date (no actual write yet; preview).
5. **Fees & Bonuses**  
   - Evaluate `fees`, `bonusRules` from plan definition. Each returns line items (`beneficiary`, `amount`, `timing`).
6. **Adjustments**  
   - Include manual adjustments stored on the deal (apply to target bucket).  
   - Recalculate totals accordingly.
7. **Brokerage Net**  
   ```
   brokerageNet =
     companyDollar
     + postCapFees
     + referralInAmount
     - referralOutAmount
     - bonusesPaidOut
     - concessions
     - marketingSpend
     + adjustmentsTargetBrokerageNet
   ```
8. **Payout Register**  
   - Generate array of `{ partyType, partyId, amount, basis, notes }`.  
   - Ensure rounding policy (standard half-up) and equality check: sum(payouts) matches `gci - referralOut + referralIn - concessions - marketing`.  
   - Persist to `Payout` table with status `PENDING` (phase 4 will enable approvals).
9. **Snapshot**  
   - Store JSON object keyed as:
     ```json
     {
       "inputs": { ...deal data..., "planVersion": { ... } },
       "lineItems": [
         { "id": "gci", "label": "Gross Commission", "amount": 18000 },
         { "id": "referral_out", "label": "Referral Out 25%", "amount": -4500 },
         ...
       ],
       "payouts": [ ... ],
       "totals": { "gci": 18000, "companyDollar": 6000, "agentTake": 7500, "brokerageNet": 5500 },
       "capStatus": { "preCapCompanyDollar": 6000, "postCap$: 0, ... }
     }
     ```
   - Write to `Deal.forecastSnapshot` and `Deal.expectedNet`.
10. **Activity Log**  
    - Log `DEAL_FORECAST_CREATED` or `DEAL_FORECAST_RECALCULATED` with diff payload.

### 2.2 Adjustment Rules

- Adjustments are always absolute amounts.  
- `appliesTo` decides bucket to nudge:  
  - `COMPANY` — modifies company dollar + brokerage net (not agent).  
  - `AGENT` — modifies agent take only (company dollar unchanged).  
  - `BROKERAGE_NET` — affects brokerage net after everything else.  
- Each adjustment requires `notes`; reasons may be from enumerated list + optional text.  
- Removing adjustment triggers `DEAL_ADJUSTMENT_REMOVED`.

### 2.3 Locking

- `POST /deals/:id/lock` (Broker only) sets `lockedAt`, `lockedById`, logs `DEAL_LOCKED`.  
- Lock prevents further forecast recalculation/adjustment unless broker unlocks with reason.  
- Unlock logs `DEAL_UNLOCKED` (with reason text in activity payload).

---

## 3. API Endpoints

| Endpoint | Method | Purpose | Notes |
| --- | --- | --- | --- |
| `/deals/:id/forecast/preview` | POST | Return forecast for provided inputs (without persistence). | Accepts payload overriding sale price/rate for “what-if”. |
| `/deals/:id/forecast/commit` | POST | Persist forecast snapshot + payouts + expected net. | Requires plan snapshot, writes activity log. |
| `/deals/:id/adjustments` | POST | Add adjustment. | Validates against lock status. |
| `/deals/:id/adjustments/:adjId` | DELETE | Remove adjustment. | Broker or creator? (decision: broker + team lead). |
| `/deals/:id/lock` | POST | Lock deal. | Body `{ locked: true | false, reason?: string }`. |
| `/payouts/:dealId` | GET | List payout rows for forecast. | Provided as stub for UI; approvals come in Phase 4. |

All endpoints require tenant scoping and RBAC:

- Agents: create/update own deals (preview + commit), cannot lock or remove others’ adjustments.  
- Team Leads: operate on team deals (create adjustments, but locking reserved for broker).  
- Brokers: full control.  
- Accounting (if role exists): read-only.

---

## 4. Forecast Snapshot Structure

```ts
type ForecastLineItem = {
  id: string
  label: string
  amount: number
  category: 'GCI' | 'REFERRAL' | 'SPLIT' | 'FEE' | 'BONUS' | 'ADJUSTMENT' | 'NET'
  metadata?: Record<string, unknown>
};

type ForecastSnapshot = {
  version: 1
  calculatedAt: string
  planVersion: {
    planId: string
    planName: string
    planType: CommissionPlanType
    definition: CommissionPlanDefinition
    snapshotId: string
  }
  inputs: {
    salePrice: number | null
    commissionRate: number | null
    manualGci: number | null
    concessions: number | null
    marketingSpend: number | null
    referralOut?: { percentage?: number; flatFee?: number; counterparty: string }
    referralIn?: { percentage?: number; flatFee?: number; counterparty: string }
  }
  lineItems: ForecastLineItem[]
  payouts: Array<{
    partyType: PayoutPartyType
    partyId?: string
    amount: number
    basis: 'SPLIT' | 'FEE' | 'BONUS' | 'REFERRAL'
    notes?: string
  }>
  totals: {
    gci: number
    referralOut: number
    referralIn: number
    companyDollar: number
    agentTake: number
    bonuses: number
    brokerageNet: number
  }
  adjustments: AdjustmentSummary[]
  capStatus: {
    capAmount?: number
    companyDollarYtd?: number
    progressPct?: number
    projectedCapDate?: string | null
  }
};
```

Future revisions (dual agency, actual reconciliation) will extend this structure; version field ensures compatibility.

---

## 5. Service Implementation Steps

1. **Extend Prisma Models** with migrations for deal fields, `Adjustment`, `Payout`.  
2. **Update Prisma Client** exports (`packages/db/src/index.ts`).  
3. **Create Nest Module `deal-desk`**:
   - `deal-desk.module.ts` imports `CommissionPlansModule` for plan resolution.  
   - `deal-forecast.service.ts` implements the algorithm above.  
   - `adjustments.service.ts` handles CRUD.  
   - `deal-desk.controller.ts` exposes preview/commit/adjustments/lock endpoints.  
4. **Develop Calculation Helpers**:  
   - `gci.util.ts`, `referral.util.ts`, `payout-builder.ts`.  
   - `Money` helper for rounding/precision (use `Decimal` from Prisma or `currency.js`).  
5. **Integrate Cap Ledger (read-only)**: When forecasting, call `CapLedgerService.getCapStatus(userId)`. Do not update ledger until deal closes (Phase 5).
6. **Activity Logging**: Inject `AuditService` and emit events with snapshots/diffs.  
7. **Permissions**: Use custom guard reading request context to allow:  
   - Agents: `commit` only for deals they own; adjustments allowed if they created the adjustment.  
   - Team Leads: teams under them.  
   - Brokers: full control.  
8. **Payout Staging**: On commit, populate `Payout` table (status `PENDING`). If deal re-forecasted before lock, soft-delete or update payouts (include version field to support diff).  

---

## 6. Frontend (Deal Desk Page)

### 6.1 Route & Hook Setup

- Add route `/broker/deal-desk/:dealId`.  
- Create API hooks in `src/lib/api/hatch.ts`:
  ```ts
  export async function previewDealForecast(dealId: string, payload: ForecastInput): Promise<ForecastSnapshot>;
  export async function commitDealForecast(dealId: string, payload: ForecastInput): Promise<ForecastSnapshot>;
  export async function listDealAdjustments(dealId: string): Promise<Adjustment[]>;
  export async function createDealAdjustment(dealId: string, payload: CreateAdjustmentPayload): Promise<Adjustment>;
  export async function deleteDealAdjustment(dealId: string, adjustmentId: string): Promise<void>;
  export async function lockDeal(dealId: string, payload: { locked: boolean; reason?: string }): Promise<void>;
  export async function listDealPayouts(dealId: string): Promise<Payout[]>;
  ```

### 6.2 UI Layout

```
<DealDeskLayout>
  <DealInputsPanel />
  <ForecastPanel />
  <PayoutRegister />
</DealDeskLayout>
```

- **DealInputsPanel** — form with sale price, commission rate, manual GCI toggle, referral in/out, concessions, marketing spend. Use `react-hook-form` + zod schema.  
- **ForecastPanel** — display line items w/ expand/collapse sections (GCI, Referrals, Splits, Fees, Adjustments). Include button to add adjustment (modal).  
- **PayoutRegister** — table of payout rows (party, amount, basis) read-only for now.  
- Provide “What-if forecast” button that calls preview without commit (delimited from “Save Forecast”).  
- Lock indicator + ability for broker to lock/unlock (confirmation modal capturing reason).

### 6.3 UX Considerations

- Show plan info summary at top (e.g., “Plan: 70/30 Cap, Cap Remaining $4,500”).  
- When adjustments exist, highlight their effect (line item + tooltip).  
- After commit, toast success and update local cache.  
- If deal is locked, disable inputs and show reason.  
- Add activity timeline (side drawer) to review forecast history (optional stretch).

---

## 7. Testing Strategy

### Unit Tests

- `deal-forecast.service.spec.ts`:  
  - Flat plan 70/30, manual GCI vs derived.  
  - Referral out before splits.  
  - Cap threshold: company dollar pushes agent near cap (ensures `CapLedger` consulted).  
  - Adjustments affect correct buckets.  
  - Payout sum equals expected total.

### Integration (e2e)

- Forecast commit API: seed plan assignments, call commit, assert DB snapshot + payouts inserted.  
- Adjustments: POST + DELETE reflect in snapshot and activity log.  
- Lock: once locked, further adjustments/commit return 409 or similar.  
- Agent vs broker RBAC: ensure unauthorized actions forbidden.

### Frontend

- React tests for form validation (manual GCI vs rate).  
- Integration test (Cypress) covering: edit inputs -> preview -> commit -> add adjustment -> lock.

---

## 8. Implementation Checklist

- [ ] Prisma migration for `Deal` fields, `Adjustment`, `Payout`, enums.  
- [ ] Update Prisma client exports.  
- [ ] Implement `deal-desk` Nest module (services/controllers).  
- [ ] Ensure `CommissionPlanEvaluator` accessible (Phase 2 service).  
- [ ] Rounding helper + equality checks.  
- [ ] Activity logging integrated.  
- [ ] Add API functions in `src/lib/api/hatch.ts`.  
- [ ] Build Deal Desk page components behind feature flag.  
- [ ] Seed sample deal + adjustments in seed script.  
- [ ] Write unit/e2e tests per above.  
- [ ] Update documentation/README.

Once this phase is delivered, the application can forecast deals accurately using real plans and feed the payout register for Phase 4.
