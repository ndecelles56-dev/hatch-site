# Broker Dashboard Implementation Plan

## 1. Implementation Phases & Priorities

### Phase 1: Foundation & Core Infrastructure (Weeks 1-3)
**Priority: CRITICAL - Must be completed first**

#### Week 1: Authentication & Authorization System
**Components to Build:**
- `BrokerLayout.tsx` - Main layout wrapper with sidebar and header
- `PermissionGate.tsx` - Component for permission-based rendering
- `useAuth.ts` - Authentication hook with role management
- `usePermissions.ts` - Permission checking utilities

**Database Setup:**
```sql
-- Priority tables for Phase 1
CREATE TABLE firms (...);
CREATE TABLE profiles (...);
CREATE TABLE invites (...);
CREATE TABLE subscriptions (...);
```

**Features:**
- Role-based access control (primary_broker, agent)
- Subscription status integration with Stripe
- Agent invitation system
- Permission matrix implementation

**Acceptance Criteria:**
- ✅ Only users with active subscriptions can access broker dashboard
- ✅ Primary brokers can invite agents with custom permissions
- ✅ Seat limits are enforced based on subscription tier
- ✅ Unpaid accounts show read-only mode with upgrade CTA

#### Week 2: Basic Dashboard Shell & Navigation
**Components to Build:**
- `Sidebar.tsx` - Navigation with permission-based menu items
- `Header.tsx` - Top bar with user info and notifications
- `Navigation.tsx` - Route handling and breadcrumbs
- `NotificationCenter.tsx` - In-app notifications system

**Features:**
- Responsive sidebar navigation
- Permission-based menu visibility
- Basic notification system
- Subscription status indicators

**Acceptance Criteria:**
- ✅ Sidebar shows only permitted features for each user role
- ✅ Subscription warnings appear for past-due accounts
- ✅ Mobile-responsive navigation works properly

#### Week 3: Subscription & Billing Integration
**Components to Build:**
- `BillingPortal.tsx` - Stripe customer portal integration
- `SeatManagement.tsx` - Agent seat usage tracking
- `SubscriptionStatus.tsx` - Plan details and upgrade options

**Features:**
- Stripe webhook handling for subscription changes
- Seat usage monitoring and enforcement
- Plan upgrade/downgrade functionality
- Billing portal access

**Acceptance Criteria:**
- ✅ Stripe webhooks update subscription status in real-time
- ✅ Seat cap prevents 26th invite on 25-seat plan
- ✅ Billing portal allows plan changes and payment updates

### Phase 2: Core Business Features (Weeks 4-8)
**Priority: HIGH - Core revenue-generating features**

#### Week 4: Listings Management System
**Components to Build:**
- `ListingsTable.tsx` - Main listings grid with filtering/sorting
- `ListingForm.tsx` - Create/edit listing form
- `ListingDetail.tsx` - Detailed listing view
- `ListingFilters.tsx` - Advanced filtering panel
- `BulkActions.tsx` - Bulk operations for multiple listings

**Database Tables:**
```sql
CREATE TABLE listings (...);
CREATE TABLE listing_media (...);
```

**Features:**
- CRUD operations for listings
- Advanced filtering (status, type, county, agent)
- Public vs private field visibility
- Bulk status changes and agent assignments
- Search functionality with full-text search

**Acceptance Criteria:**
- ✅ Listings table loads <1.5s with 1000+ records
- ✅ Public view hides private fields 100% of the time
- ✅ Bulk actions work on selected listings
- ✅ Search returns relevant results instantly

#### Week 5: Media Management & File Uploads
**Components to Build:**
- `MediaManager.tsx` - Photo/document upload and organization
- `UploadManager.tsx` - Drag-and-drop file upload
- `MediaGallery.tsx` - Image gallery with lightbox
- `DocumentLibrary.tsx` - Document organization and sharing

**Features:**
- Drag-and-drop file uploads
- Image optimization and thumbnails
- Document categorization and visibility controls
- Media ordering and organization

**Acceptance Criteria:**
- ✅ Images upload and display properly
- ✅ Documents are categorized by type
- ✅ Visibility controls work (public/private/broker-only)
- ✅ Media loads quickly with proper caching

#### Week 6: Offers & Transaction Workflow
**Components to Build:**
- `OffersInbox.tsx` - Incoming offers dashboard
- `OfferCard.tsx` - Individual offer summary
- `OfferDetail.tsx` - Detailed offer view with timeline
- `OfferActions.tsx` - Accept/Counter/Decline actions
- `CounterOfferForm.tsx` - Counter offer creation
- `TransactionWorkspace.tsx` - Deal progress tracking

**Database Tables:**
```sql
CREATE TABLE offers (...);
CREATE TABLE offer_timeline (...);
CREATE TABLE tasks (...);
```

**Features:**
- Offers inbox with filtering and sorting
- Offer timeline with audit trail
- Accept/Counter/Decline workflow
- Automatic task creation on offer acceptance
- Transaction progress tracking

**Acceptance Criteria:**
- ✅ New offers appear instantly in inbox
- ✅ Every status change appears in timeline
- ✅ Tasks auto-create on offer acceptance
- ✅ Counter offers lock previous terms

#### Week 7: Document Management & E-Signatures
**Components to Build:**
- `DocumentLibrary.tsx` - Per-deal document organization
- `DocumentUpload.tsx` - Document upload with metadata
- `ESignatureTracker.tsx` - DocuSign status tracking
- `ComplianceChecker.tsx` - Required document validation

**Database Tables:**
```sql
CREATE TABLE documents (...);
```

**Features:**
- Document library per deal/listing
- DocuSign integration for e-signatures
- Required document templates
- Compliance warnings for missing docs

**Acceptance Criteria:**
- ✅ Documents are organized by deal/listing
- ✅ DocuSign envelopes send and track status
- ✅ Missing required docs show compliance warnings
- ✅ Brokers can download fully executed packets

#### Week 8: Basic CRM System
**Components to Build:**
- `KanbanPipeline.tsx` - Lead pipeline with drag-drop
- `LeadCard.tsx` - Individual lead summary
- `LeadDetail.tsx` - Detailed lead information
- `LeadForm.tsx` - Create/edit lead form
- `ActivityLog.tsx` - Lead activity tracking

**Database Tables:**
```sql
CREATE TABLE leads (...);
CREATE TABLE activities (...);
```

**Features:**
- Kanban pipeline with stages
- Drag-and-drop between stages
- Lead activity logging
- Basic lead management

**Acceptance Criteria:**
- ✅ Pipeline metrics match card counts
- ✅ Drag-drop updates stage instantly
- ✅ Activities are logged with timestamps
- ✅ Lead assignments work properly

### Phase 3: Advanced Features (Weeks 9-12)
**Priority: MEDIUM - Competitive differentiators**

#### Week 9: Calendar & Task Management
**Components to Build:**
- `CalendarView.tsx` - Month/Week/Day calendar views
- `EventForm.tsx` - Create/edit calendar events
- `TaskBoard.tsx` - Kanban-style task management
- `TaskCard.tsx` - Individual task display
- `ReminderSettings.tsx` - Email/SMS reminder configuration

**Database Tables:**
```sql
CREATE TABLE calendar_events (...);
CREATE TABLE calendar_event_assignees (...);
```

**Features:**
- Multi-view calendar (Month/Week/Day)
- Multi-assignee events
- Task board with deal/lead linking
- Email and SMS reminders
- ICS export functionality

**Acceptance Criteria:**
- ✅ Assigned agents see their events
- ✅ Colors are consistent across views
- ✅ Reminders fire at correct times
- ✅ Auto-created deadlines from offers

#### Week 10: Analytics & Reporting Dashboard
**Components to Build:**
- `KPIDashboard.tsx` - Main analytics overview
- `MetricCard.tsx` - Individual KPI display
- `ChartContainer.tsx` - Reusable chart wrapper
- `MarketInsights.tsx` - Market data visualization
- `AgentScorecard.tsx` - Individual agent performance
- `ExportTools.tsx` - CSV/PDF export functionality

**Features:**
- Firm KPIs dashboard
- Market intelligence by county
- Agent performance scorecards
- Data export capabilities
- Date range filtering

**Acceptance Criteria:**
- ✅ KPIs update in real-time
- ✅ Filters work by date range and county
- ✅ Exports generate CSV files
- ✅ Charts load quickly and are interactive

#### Week 11: CMA & ROI Tools
**Components to Build:**
- `CMAWizard.tsx` - Step-by-step CMA creation
- `CMAReport.tsx` - Generated CMA display
- `ROICalculator.tsx` - Investment analysis tool
- `ROIScenarios.tsx` - Multiple scenario comparison
- `CompAnalysis.tsx` - Comparable property analysis

**Database Tables:**
```sql
CREATE TABLE cma_requests (...);
CREATE TABLE cma_comps (...);
CREATE TABLE roi_models (...);
```

**Features:**
- CMA wizard with comp selection
- PDF generation and sharing
- ROI calculator with multiple metrics
- Scenario analysis and comparison
- Investment target tracking

**Acceptance Criteria:**
- ✅ CMA PDF has comps, adjustments, and estimates
- ✅ ROI calculations are accurate
- ✅ Scenarios can be saved and shared
- ✅ Target ROI badges appear in search

#### Week 12: Compliance & Audit System
**Components to Build:**
- `ComplianceTracker.tsx` - Transaction compliance scoring
- `AuditLogs.tsx` - Immutable audit trail
- `ComplianceExport.tsx` - Compliance report generation
- `DeadlineTracker.tsx` - Important date monitoring

**Database Tables:**
```sql
CREATE TABLE audit_logs (...);
```

**Features:**
- Compliance scoring per transaction
- Immutable audit logging
- Compliance export for broker records
- Deadline tracking and alerts

**Acceptance Criteria:**
- ✅ Missing docs reduce compliance score
- ✅ Audit logs show every change
- ✅ Compliance exports are complete
- ✅ Deadline alerts fire properly

### Phase 4: Polish & Optimization (Weeks 13-14)
**Priority: LOW - Performance and UX improvements**

#### Week 13: Performance Optimization
**Tasks:**
- Implement virtual scrolling for large tables
- Add React.memo for expensive components
- Optimize database queries and add indexes
- Implement service worker for offline functionality
- Add loading states and skeleton screens

**Performance Targets:**
- ✅ Search/filter responses <1.5s TTFB
- ✅ Initial page load <3s
- ✅ 99.9% uptime
- ✅ Mobile performance score >90

#### Week 14: Mobile Optimization & Final Polish
**Tasks:**
- Mobile-responsive design improvements
- Touch-friendly interactions
- Offline functionality
- Error boundary implementation
- Final testing and bug fixes

**Acceptance Criteria:**
- ✅ All features work on mobile devices
- ✅ Touch interactions are smooth
- ✅ Offline mode handles basic operations
- ✅ Error boundaries prevent app crashes

## 2. Component Integration with Existing Platform

### 2.1 Existing Components to Extend
```typescript
// Extend existing Navbar component
// File: src/components/layout/Navbar.tsx
const Navbar = () => {
  const { user, userRole } = useAuth();
  
  // Add broker-specific navigation items
  const brokerNavItems = [
    { label: 'Dashboard', href: '/broker/dashboard', roles: ['primary_broker', 'agent'] },
    { label: 'Listings', href: '/broker/listings', roles: ['primary_broker', 'agent'] },
    { label: 'Offers', href: '/broker/offers', roles: ['primary_broker', 'agent'] },
    { label: 'CRM', href: '/broker/crm', roles: ['primary_broker', 'agent'] },
    { label: 'Calendar', href: '/broker/calendar', roles: ['primary_broker', 'agent'] },
    { label: 'Analytics', href: '/broker/analytics', roles: ['primary_broker'] },
    { label: 'Admin', href: '/broker/admin', roles: ['primary_broker'] },
  ];
  
  // Filter navigation based on user role and permissions
  const visibleNavItems = brokerNavItems.filter(item => 
    item.roles.includes(userRole) && hasPermission(user.permissions, item.href)
  );
  
  return (
    // Existing navbar with additional broker items
  );
};
```

### 2.2 New Route Structure
```typescript
// File: src/App.tsx - Add broker routes
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Existing routes */}
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* New broker routes */}
            <Route path="/broker" element={<BrokerLayout />}>
              <Route path="dashboard" element={<BrokerDashboard />} />
              <Route path="listings" element={<BrokerListings />} />
              <Route path="listings/:id" element={<ListingDetail />} />
              <Route path="offers" element={<BrokerOffers />} />
              <Route path="offers/:id" element={<OfferDetail />} />
              <Route path="crm" element={<BrokerCRM />} />
              <Route path="calendar" element={<BrokerCalendar />} />
              <Route path="analytics" element={<BrokerAnalytics />} />
              <Route path="tools/cma" element={<CMAWizard />} />
              <Route path="tools/roi" element={<ROICalculator />} />
              <Route path="admin" element={<BrokerAdmin />} />
              <Route path="admin/billing" element={<BillingPortal />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
```

### 2.3 Database Integration with Existing Schema
```sql
-- Extend existing users table with broker-specific fields
ALTER TABLE profiles ADD COLUMN firm_id UUID REFERENCES firms(id);
ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '{}';

-- Link existing properties to new listings system
ALTER TABLE listings ADD COLUMN legacy_property_id UUID; -- Reference to existing properties
```

## 3. Development Workflow & Standards

### 3.1 Git Workflow
```bash
# Branch naming convention
feature/broker-listings-table
feature/broker-offer-workflow
bugfix/broker-permission-check
hotfix/broker-subscription-sync

# Commit message format
feat(broker): add listings table with filtering
fix(broker): resolve permission check for agents
docs(broker): update API documentation
test(broker): add unit tests for CRM pipeline
```

### 3.2 Code Standards
```typescript
// Component file structure
// File: src/components/broker/listings/ListingsTable.tsx

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { listingsApi } from '@/services/api/listings';
import type { Listing, ListingFilters } from '@/types/listings';

interface ListingsTableProps {
  filters?: ListingFilters;
  onFilterChange?: (filters: ListingFilters) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export const ListingsTable: React.FC<ListingsTableProps> = ({
  filters = {},
  onFilterChange,
  onSelectionChange,
}) => {
  // Component implementation
  
  return (
    <div className="space-y-4">
      {/* Component JSX */}
    </div>
  );
};

// Export for testing
export default ListingsTable;
```

### 3.3 Testing Requirements
```typescript
// Test file structure
// File: src/components/broker/listings/__tests__/ListingsTable.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ListingsTable } from '../ListingsTable';
import { mockListings } from '@/test/mocks/listings';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ListingsTable', () => {
  it('renders listings correctly', async () => {
    render(<ListingsTable />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });
  });
  
  it('handles filtering', async () => {
    const onFilterChange = jest.fn();
    render(
      <ListingsTable onFilterChange={onFilterChange} />,
      { wrapper: createWrapper() }
    );
    
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'active' },
    });
    
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'active' });
  });
});
```

## 4. Risk Mitigation & Contingency Plans

### 4.1 Technical Risks
**Risk: Complex Permission System**
- **Mitigation**: Start with simple role-based permissions, iterate to granular
- **Contingency**: Implement feature flags to disable complex permissions if needed

**Risk: Real-time Performance Issues**
- **Mitigation**: Implement proper indexing and query optimization from start
- **Contingency**: Add pagination and virtual scrolling if performance degrades

**Risk: Third-party Integration Failures**
- **Mitigation**: Build fallback mechanisms for all external services
- **Contingency**: Implement queue system for failed API calls with retry logic

### 4.2 Timeline Risks
**Risk: Feature Scope Creep**
- **Mitigation**: Strict adherence to MVP requirements in each phase
- **Contingency**: Move non-critical features to future phases

**Risk: Integration Complexity**
- **Mitigation**: Early integration testing with existing platform
- **Contingency**: Parallel development track for integration issues

## 5. Success Metrics & KPIs

### 5.1 Technical Metrics
- **Performance**: Page load times <1.5s, API responses <500ms
- **Reliability**: 99.9% uptime, <1% error rate
- **Security**: Zero data breaches, all audit requirements met
- **Scalability**: Support 1000+ concurrent users per firm

### 5.2 Business Metrics
- **User Adoption**: 80% of invited agents actively use platform within 30 days
- **Feature Utilization**: 60% of brokers use advanced features (CMA, ROI tools)
- **Customer Satisfaction**: NPS score >50
- **Revenue Impact**: 25% increase in subscription upgrades

### 5.3 Quality Metrics
- **Code Coverage**: >80% test coverage for all components
- **Bug Rate**: <2 bugs per 1000 lines of code
- **Performance**: Lighthouse score >90 for all pages
- **Accessibility**: WCAG 2.1 AA compliance

## 6. Post-Launch Roadmap

### Phase 5: Advanced Integrations (Months 4-6)
- MLS/IDX integration for automated listing imports
- Advanced market data integration (Census, FEMA)
- White-label customization options
- Advanced reporting and business intelligence

### Phase 6: AI & Automation (Months 7-12)
- AI-powered lead scoring and routing
- Automated CMA generation with ML
- Predictive analytics for market trends
- Intelligent task automation

### Phase 7: Mobile App (Months 13-18)
- Native iOS and Android apps
- Offline functionality
- Push notifications
- Mobile-optimized workflows

This comprehensive implementation plan provides a clear roadmap for building the broker dashboard system while maintaining integration with the existing Hatch platform and ensuring scalable, maintainable code.