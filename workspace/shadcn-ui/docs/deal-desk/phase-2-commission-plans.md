# Deal Desk Phase 2 — Commission Plans & Cap Tracking

Objective: deliver the backend data foundations plus API/service contracts and the initial UI slice for defining commission plans, assigning them to agents/teams, and surfacing cap progress. This document refines the architecture decisions into implementation-ready detail.

---

## 1. Data Model (Prisma)

### 1.1 New Tables

```prisma
model CommissionPlan {
  id          String           @id @default(cuid())
  tenantId    String
  name        String
  type        CommissionPlanType
  description String?          @db.Text
  definition  Json             // normalized structure (see §2)
  postCapFee  Json?            // optional { type: 'FLAT' | 'PERCENTAGE', amount: Decimal }
  bonusRules  Json?            // optional array of bonus/fee definitions
  isArchived  Boolean          @default(false)
  version     Int              @default(1)
  createdById String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // relations
  tenant      Tenant           @relation(fields: [tenantId], references: [id])
  createdBy   User?            @relation(fields: [createdById], references: [id])
  assignments PlanAssignment[]
  snapshots   PlanSnapshot[]

  @@index([tenantId, isArchived])
  @@unique([tenantId, name, version])
}

enum CommissionPlanType {
  FLAT       // simple split
  TIERED     // multiple tiers + optional cap
  CAP        // flat split until cap, then post-cap rules
}

model PlanAssignment {
  id            String              @id @default(cuid())
  tenantId      String
  assigneeType  PlanAssigneeType
  assigneeId    String
  planId        String
  effectiveFrom DateTime
  effectiveTo   DateTime?
  priority      Int                 @default(0)
  createdById   String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  tenant        Tenant              @relation(fields: [tenantId], references: [id])
  plan          CommissionPlan      @relation(fields: [planId], references: [id])
  createdBy     User?               @relation(fields: [createdById], references: [id])

  @@index([tenantId, assigneeType, assigneeId, effectiveFrom])
  @@unique([tenantId, assigneeType, assigneeId, planId, effectiveFrom])
}

enum PlanAssigneeType {
  USER
  TEAM
}

model CapLedger {
  id               String      @id @default(cuid())
  tenantId         String
  userId           String
  planId           String
  periodStart      DateTime
  periodEnd        DateTime
  capAmount        Decimal     @db.Decimal(12,2)
  companyDollarYtd Decimal     @db.Decimal(12,2) @default(0)
  postCapFeesYtd   Decimal     @db.Decimal(12,2) @default(0)
  lastDealId       String?
  updatedAt        DateTime    @updatedAt
  createdAt        DateTime    @default(now())

  tenant           Tenant      @relation(fields: [tenantId], references: [id])
  user             User        @relation(fields: [userId], references: [id])
  plan             CommissionPlan @relation(fields: [planId], references: [id])

  @@index([tenantId, userId, planId, periodStart, periodEnd])
  @@unique([tenantId, userId, planId, periodStart])
}

model PlanSnapshot {
  id        String          @id @default(cuid())
  tenantId  String
  planId    String
  version   Int
  payload   Json
  createdAt DateTime        @default(now())
  createdById String?

  tenant    Tenant          @relation(fields: [tenantId], references: [id])
  plan      CommissionPlan  @relation(fields: [planId], references: [id])
  createdBy User?           @relation(fields: [createdById], references: [id])

  @@unique([planId, version])
}
```

> **Migration notes**  
> - `definition` uses JSON for flexibility while Prisma still enforces enums for plan types.  
> - Maintain `PlanSnapshot` so each plan edit saves a frozen version (useful for audit and for deals referencing historical versions).  
> - Add `tenantId` foreign keys and cascade on delete where appropriate.

---

## 2. Plan Definition Schema (JSON)

Use discriminated structures stored in `CommissionPlan.definition`. Validation occurs via zod before persistence.

```ts
type FlatPlanDefinition = {
  type: 'FLAT'
  split: {
    agent: number   // e.g., 0.7 for 70%
    brokerage: number
  }
  includeReferralInAgentShare?: boolean
}

type TieredPlanDefinition = {
  type: 'TIERED'
  cap: {
    amount: number
    reset: 'ANNUAL' | 'ANNIVERSARY'
    transactionFee?: { type: 'FLAT' | 'PERCENTAGE'; amount: number }
  }
  tiers: Array<{
    upToCompanyDollar?: number // null if open ended
    split: { agent: number; brokerage: number }
  }>
  includeReferralInAgentShare?: boolean
}

type CapPlanDefinition = {
  type: 'CAP'
  cap: {
    amount: number
    reset: 'ANNUAL' | 'ANNIVERSARY'
  }
  preCapSplit: { agent: number; brokerage: number }
  postCap: {
    agent: number    // typically 1.0
    brokerage: number
    transactionFee?: { type: 'FLAT' | 'PERCENTAGE'; amount: number }
  }
  includeReferralInAgentShare?: boolean
}

type FeeRule = {
  id: string
  label: string
  beneficiary: 'BROKERAGE' | 'TEAM_LEAD' | 'MENTOR' | 'AGENT'
  timing: 'PRE_CAP' | 'POST_CAP' | 'ALWAYS'
  basis: 'PERCENTAGE' | 'FLAT'
  amount: number
  applyTo: 'GCI' | 'COMPANY_DOLLAR' | 'AGENT_TAKE'
}

type BonusRule = {
  id: string
  label: string
  trigger: 'DEAL' | 'THRESHOLD'
  basis: 'PERCENTAGE' | 'FLAT'
  amount: number
  beneficiary: 'AGENT' | 'BROKERAGE' | 'TEAM'
  notes?: string
}

type CommissionPlanDefinition =
  | (FlatPlanDefinition & { fees?: FeeRule[]; bonuses?: BonusRule[] })
  | (TieredPlanDefinition & { fees?: FeeRule[]; bonuses?: BonusRule[] })
  | (CapPlanDefinition & { fees?: FeeRule[]; bonuses?: BonusRule[] });
```

Store `fees` in `CommissionPlan.definition` (rather than `postCapFee` JSON) for simplicity; the `postCapFee` column remains available for the common “flat post cap transaction fee” convenience.

---

## 3. Backend Components

### 3.1 Services

| Service | Responsibilities | Key Methods |
| --- | --- | --- |
| `CommissionPlanService` | CRUD operations, versioning, validation. | `createPlan(dto)`, `updatePlan(id, dto)`, `archivePlan(id)`, `clonePlan(id)`, `getEffectivePlanForDeal(userId, teamIds, asOfDate)` |
| `PlanAssignmentService` | Manage assignments and resolve applicable plan. | `assignPlan(dto)`, `listAssignmentsForAssignee`, `resolvePlan({ userId, teamIds, asOfDate })`, `endAssignment(id)` |
| `CapLedgerService` | Track and expose cap progress. | `getCapStatus(userId)`, `recordDeal(companyDollar, postCapFees)`, `resetPeriod(userId, planId)` |

### 3.2 Module Layout (NestJS)

```
apps/api/src/modules/commission-plans/
  ├── commission-plans.module.ts
  ├── commission-plans.controller.ts
  ├── commission-plans.service.ts
  ├── plan-assignment.service.ts
  ├── cap-ledger.service.ts
  ├── dto/
  │    ├── create-plan.dto.ts
  │    ├── update-plan.dto.ts
  │    ├── assign-plan.dto.ts
  │    ├── list-cap-progress.dto.ts
  └── validators/
       └── plan-definition.schema.ts
```

Inject `CapLedgerService` into the deal forecast phase later.

### 3.3 DTOs & Validation

- Use `zod` schema for `CommissionPlanDefinition`, convert to class-validator via `ZodValidationPipe` or custom pipe for Nest.  
- `CreatePlanDto` fields:
  ```ts
  class CreatePlanDto {
    @IsString() name: string;
    @IsEnum(CommissionPlanType) type: CommissionPlanType;
    @IsOptional() @IsString() description?: string;
    @IsNotEmptyObject() definition: unknown; // validated via Zod
    @IsOptional() postCapFee?: { type: 'FLAT' | 'PERCENTAGE'; amount: number };
    @IsOptional() bonusRules?: BonusRuleDto[];
  }
  ```
- `AssignPlanDto` includes `assigneeType`, `assigneeId`, `planId`, `effectiveFrom`, `effectiveTo`, `priority`.

### 3.4 RBAC

- **Broker** — full CRUD on plans & assignments; view cap progress; archive plans.  
- **Team Lead** — read plans; read cap progress for team; cannot edit assignments.  
- **Agent** — read-only assigned plan + personal cap progress.

Implement guards using existing request context helper (`resolveRequestContext`). Possibly add decorator to enforce tenant-level access.

---

## 4. Cap Progress API

**Endpoint**: `GET /commission-plans/cap-progress`  
**Params**: `userId?`, `teamId?`, `period? (month/year)`  
**Response**:
```json
{
  "items": [
    {
      "userId": "user-agent-1",
      "userName": "Alex Agent",
      "plan": { "id": "plan-cap-1", "name": "70/30 Cap" },
      "capAmount": 15000,
      "companyDollarYtd": 11250,
      "progressPct": 0.75,
      "projectedCapDate": "2025-07-15T00:00:00Z",
      "postCapFeesYtd": 600,
      "lastUpdatedAt": "2025-07-01T12:00:00Z"
    }
  ],
  "periodStart": "2025-01-01T00:00:00Z",
  "periodEnd": "2025-12-31T23:59:59Z"
}
```

### 4.1 Cap Projection Logic

1. Determine plan period from assignment (e.g., anniversary reset).  
2. Use last 90 days deals to compute average company dollar per deal; project remaining amount to reach cap.  
3. Provide next-deal threshold estimate (company dollar remaining vs typical per-deal amount).  
4. Store aggregated stats in `CapLedgerService` for fast retrieval.

---

## 5. Frontend Scope (Phase 2)

Routes under `/broker/commission-plans` (feature-flagged).

### 5.1 Components

- `CommissionPlanList` — table showing plan name, type, version, assignments count, last updated.  
- `CommissionPlanDrawer` — create/edit form with dynamic UI based on plan type (flat vs tiered vs cap).  
- `PlanAssignmentTable` — list of current assignments, effective dates, ability to add new assignment (modal).  
- `CapProgressTable` — agents with progress bar, cap amount, projected cap date, filter by team.  
- Use `@tanstack/react-table` for grids; `react-hook-form + zod` for forms.

### 5.2 API Hooks (`src/lib/api/hatch.ts`)

Add functions:
```ts
export async function fetchCommissionPlans(tenantId: string): Promise<CommissionPlan[]> { ... }
export async function createCommissionPlan(payload: CreatePlanPayload): Promise<CommissionPlan> { ... }
export async function updateCommissionPlan(id: string, payload: UpdatePlanPayload): Promise<CommissionPlan> { ... }
export async function assignCommissionPlan(payload: AssignPlanPayload): Promise<PlanAssignment> { ... }
export async function fetchCapProgress(params): Promise<CapProgressResponse> { ... }
```

Ensure `CommissionPlanDefinition` types mirrored client-side for validation.

### 5.3 Feature Flag

- Add constant `FEATURE_DEAL_DESK_COMMISSION_PLANS` (maybe read from config).  
- Wrap new routes/components so rollout can be staged.

---

## 6. Activity & Audit Implementation

When plan or assignment changes occur:

| Event | Activity Type | Payload |
| --- | --- | --- |
| Plan created | `COMMISSION_PLAN_CREATED` | `{ planId, version, createdBy }` |
| Plan updated | `COMMISSION_PLAN_UPDATED` | `{ planId, changes, version }` |
| Plan archived | `COMMISSION_PLAN_ARCHIVED` | `{ planId }` |
| Assignment added | `COMMISSION_PLAN_ASSIGNED` | `{ planId, assigneeType, assigneeId, effectiveFrom }` |
| Assignment ended | `COMMISSION_PLAN_ASSIGNMENT_ENDED` | `{ planAssignmentId, endedBy }` |
| Cap ledger update | `CAP_LEDGER_UPDATED` | `{ userId, planId, companyDollarYtd }` |

Implement helper `AuditService.log(eventType, payload, context)` to encapsulate.

---

## 7. Testing Plan

### Unit Tests

- `plan-definition.schema.spec.ts` — validate acceptance/rejection of plan JSON structures.  
- `commission-plans.service.spec.ts` — create/update/clone plan, ensure version increments.  
- `plan-assignment.service.spec.ts` — resolve plan given overlapping assignments, priority order.

### Integration Tests (Nest e2e)

- POST `/commission-plans` -> GET -> PATCH -> ensure data persists.  
- POST `/commission-plans/:id/assignments` -> GET cap progress -> returns correct assignment.  
- Cap ledger updates triggered via mocked deal service (use test harness to simulate deals).

### Frontend

- React component tests for dynamic tier rows, validation messaging.  
- Cypress smoke test for creating plan, assigning to agent, verifying cap table.

---

## 8. Implementation Checklist

- [ ] Create Prisma migration for new tables/enums.  
- [ ] Generate Prisma client and update `packages/db/src/index.ts` exports.  
- [ ] Implement Nest module + controllers/services.  
- [ ] Wire audit logging.  
- [ ] Add API client functions in `src/lib/api/hatch.ts`.  
- [ ] Build broker UI under `/broker/commission-plans` with feature flag.  
- [ ] Seed sample plans/assignments for demos.  
- [ ] Write unit/integration tests per above.  
- [ ] Update documentation (README, API docs).  
- [ ] QA acceptance: create/edit plan, assign to agent, view cap progress.

---

With these details, Phase 2 implementation can begin immediately: migrations and backend services first, followed by frontend. Subsequent phases plug into the same plan/cap services.***
