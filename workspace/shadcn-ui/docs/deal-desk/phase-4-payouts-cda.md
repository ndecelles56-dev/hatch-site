# Deal Desk Phase 4 — Payout Register & CDA Generation

Objective: turn the forecasted payout lines into a managed register (approve/mark paid/export) and produce CDAs (Commission Disbursement Authorization) as PDF artifacts with emailing workflow.

---

## 1. Data Model Additions

### 1.1 Payout Enhancements

Extend the `Payout` model created in Phase 3 with audit fields:

```prisma
model Payout {
  // existing fields...
  approvedAt   DateTime?
  paidAt       DateTime?
  approvedById String?
  paidById     String?
  exportBatchId String?       // optional grouping for register exports

  approvedBy   User? @relation("PayoutApprovedBy", fields: [approvedById], references: [id])
  paidBy       User? @relation("PayoutPaidBy", fields: [paidById], references: [id])
}
```

Add indexes:
```prisma
@@index([tenantId, status, expectedDate])
@@index([tenantId, paidDate])
```

### 1.2 CDA Table (if not already created)

```prisma
model CDA {
  id            String   @id @default(cuid())
  tenantId      String
  dealId        String
  templateId    String
  snapshot      Json      // merged data at generation time
  fileUrl       String?   // stored location (S3, etc.)
  generatedAt   DateTime  @default(now())
  generatedById String
  approvedAt    DateTime?
  approvedById  String?
  sentTo        String[]  @default([])
  voidedAt      DateTime?
  voidReason    String?

  tenant        Tenant @relation(fields: [tenantId], references: [id])
  deal          Deal   @relation(fields: [dealId], references: [id])
  generatedBy   User   @relation(fields: [generatedById], references: [id])
  approvedBy    User?  @relation("CDAApprovedBy", fields: [approvedById], references: [id])

  @@index([tenantId, dealId, generatedAt])
}
```

### 1.3 Activity Types

Add to `ActivityType`:
- `PAYOUT_APPROVED`
- `PAYOUT_MARKED_PAID`
- `PAYOUT_EXPORT_CREATED`
- `CDA_GENERATED`
- `CDA_APPROVED`
- `CDA_SENT`
- `CDA_VOIDED`

---

## 2. Backend Services

### 2.1 PayoutService (Enhancements)

Responsibilities:
- Approve payout: set status `APPROVED`, record `approvedAt/by`, log activity.
- Mark as paid: set status `PAID`, record `paidAt/by`, method, reference, log activity.
- Void payout: optional (maybe for adjustments).
- Export register: query payouts by filters, mark `exportBatchId`, generate CSV/JSON.

Methods:
```ts
approvePayout(payoutId, userCtx)
markPayoutPaid(payoutId, { method, reference, paidAt }, userCtx)
listPayouts(filter)
exportPayouts(filter) => { batchId, url }
```

### 2.2 CDAService

Responsibilities:
- Merge forecast snapshot + adjustments into CDA template.
- Render PDF (use existing PDF generator or add library like `pdfmake` or `@react-pdf/renderer` on server).
- Store output in object storage (existing S3 or local).  
- Trigger email via Outbox events.
- Approve / void workflow.

Methods:
```ts
generateCda(dealId, templateId, recipients, generatedBy)
approveCda(cdaId, approvedBy)
sendCda(cdaId, recipients)
voidCda(cdaId, reason, userCtx)
getCda(dealId)
```

### 2.3 Controllers / Endpoints

| Endpoint | Method | Description | RBAC |
| --- | --- | --- | --- |
| `/payouts` | GET | Filter by status/date/team | Broker, Accounting, Team Lead (team scope) |
| `/payouts/:id/approve` | POST | Approve payout | Broker |
| `/payouts/:id/mark-paid` | POST | Body `{ paidAt?, method?, reference? }` | Broker, Accounting |
| `/payouts/export` | POST | Body `{ filter, format }`, returns export info | Broker, Accounting |
| `/deals/:dealId/cda` | POST | Generate CDA | Broker (Team Lead propose?) |
| `/cda/:id/approve` | POST | Approve CDA | Broker |
| `/cda/:id/send` | POST | Send CDA to recipients | Broker (Accounting?) |
| `/cda/:id/void` | POST | Void with reason | Broker |
| `/cda/:dealId` | GET | Fetch latest CDA(s) | Broker, Team Lead (read) |

### 2.4 RBAC

- Brokers: full control.  
- Team Leads: read payouts, propose CDA but cannot approve/mark paid.  
- Agents: read their payouts (maybe via `GET /payouts?userId=`).  
- Accounting: mark paid, export register, read CDA.

---

## 3. Payout Register Export

- Accept filters: date range, status, team, agent.  
- Generate CSV with columns: `Deal ID`, `Deal Name`, `Party Type`, `Party`, `Amount`, `Status`, `Expected Date`, `Paid Date`, `Method`, `Reference`, `Cap Status`, `Plan`.  
- Save export record (batch id, createdAt, createdBy) for audit; optionally store file link.  
- Consider large dataset streaming; use Node stream or `nest-csv-export`.

Audit log `PAYOUT_EXPORT_CREATED` with filter summary + batch id.

---

## 4. CDA Templates

- Maintain templates in configuration or DB table (beyond MVP?). For now, store static template in code or S3 and merge using snapshot.  
- Snapshot to contain fields:  
  - Deal details (price, address, buyer/seller).  
  - Payout allocations.  
  - CDA metadata (escrow contact info, brokerage info).  
- Template merge engine should support conditional sections (referral, bonus lines).  
- When generating, store `CDA.snapshot` (for record) + `fileUrl` after upload.  
- Email dispatch: reuse Outbox with event `cda.generated`.

---

## 5. Frontend Components

### 5.1 Payout Register Page (Phase 4)

Route: `/broker/payouts`

Sections:
- **Filters**: status, agent/team, date range (expected/paid), amount range.  
- **Table**: party, deal, amount, status, dates, method, reference.  
- Actions:  
  - Approve (button per row, confirm).  
  - Mark Paid (opens modal to collect method/reference/paid date).  
  - Export (opens dialog for filters & format).  
- **CSV Export**: show toast with success + download link (call API to fetch file).

### 5.2 Deal Desk — Payout Panel Enhancements

- After forecast commit, show payout rows with status badges.  
- If user has rights, display approve/mark paid actions inline.  
- Show history (activity log entries) for payout events.

### 5.3 CDA Modal

- Triggered from deal page (button “Generate CDA”).  
- Form fields: select template, recipients (escrow emails), include message.  
- Preview area showing PDF (use PDF viewer or render as image).  
- Actions: `Generate Draft`, `Approve`, `Send to Escrow`.  
- Display status timeline (Generated -> Approved -> Sent -> Voided).  
- Download link for generated CDA.

---

## 6. Activity Logging

Ensure each step logs to `Activity` table:
- `PAYOUT_APPROVED`: payload includes `{ payoutId, amount, approvedBy }`.  
- `PAYOUT_MARKED_PAID`: includes method/reference/paidAt.  
- `PAYOUT_EXPORT_CREATED`: includes filter summary, batch id, record count.  
- `CDA_GENERATED`: includes `cdaId`, `templateId`, `recipients`.  
- `CDA_APPROVED`: includes `approvedBy`.  
- `CDA_SENT`: includes `recipients`.  
- `CDA_VOIDED`: includes `reason`.  
- Optionally email event logs (Outbox already in place).

---

## 7. Testing Plan

### Unit Tests

- `payout.service.spec.ts`: approve, mark paid, status transitions, validations (no double approvals).  
- `cda.service.spec.ts`: snapshot assembly, template merge, void/approve flows.  
- `payout-export.service.spec.ts`: filter combos, CSV generation, activity logging.

### Integration Tests

- POST `/payouts/:id/approve` -> assert DB updates + activity.  
- POST `/payouts/:id/mark-paid` -> ensures status & paidAt set, no approval bypass.  
- POST `/deals/:dealId/cda` -> generates record; GET returns same; POST `/cda/:id/approve` restricts to brokers.  
- Export endpoint returns valid CSV, marks batch id, logs activity.  
- RBAC tests for roles (Team Lead can't mark paid).

### Frontend Tests

- Component tests for mark-paid modal validation.  
- Integration (Cypress) flows: approve payout, mark paid, export register, generate CDA, send to escrow.

---

## 8. Implementation Checklist

- [ ] Extend Prisma schema for Payout fields + CDA table + new activity types.  
- [ ] Generate migration & update Prisma client exports.  
- [ ] Implement payout controller/service enhancements.  
- [ ] Implement CDA module (PDF generation + email).  
- [ ] Integrate Outbox event for `cda.generated` and `cda.sent`.  
- [ ] Build `/broker/payouts` page + API hooks.  
- [ ] Update Deal Desk payout panel with status controls.  
- [ ] Add CDA modal UI.  
- [ ] Write tests per plan.  
- [ ] Update seed script with example payouts/CDA.  
- [ ] Document workflow updates.

Completion of Phase 4 enables brokers to approve and pay out deals confidently while producing required CDA documents.
