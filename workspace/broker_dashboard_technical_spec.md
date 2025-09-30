# Broker Dashboard Technical Specification

## 1. System Architecture Overview

### 1.1 Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (global) + React Query (server state)
- **Database**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth + Row Level Security
- **File Storage**: Supabase Storage
- **Payments**: Stripe (subscriptions + billing)
- **Email**: SendGrid
- **SMS**: Twilio
- **E-Signatures**: DocuSign API
- **Maps**: Mapbox GL JS

### 1.2 System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase      │    │  External APIs  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │◄──►│ │ PostgreSQL  │ │    │ │   Stripe    │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ ├─────────────┤ │    │ ├─────────────┤ │    │ ├─────────────┤ │
│ │ State Mgmt  │ │    │ │ Real-time   │ │    │ │  DocuSign   │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ ├─────────────┤ │    │ ├─────────────┤ │    │ ├─────────────┤ │
│ │ API Layer   │ │◄──►│ │ Auth + RLS  │ │    │ │  SendGrid   │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. Database Schema & Data Models

### 2.1 Core Tables

```sql
-- Firms and Organizations
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  seats_purchased INTEGER DEFAULT 1,
  seats_used INTEGER DEFAULT 0,
  subscription_id VARCHAR(255), -- Stripe subscription ID
  stripe_customer_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles with Roles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('primary_broker', 'agent', 'admin')),
  permissions JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  license_number VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Agent Invitations
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  permissions JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id),
  mls_number VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'withdrawn', 'expired')),
  property_type VARCHAR(100) NOT NULL,
  address JSONB, -- {street, city, state, zip, county, lat, lng}
  details JSONB, -- beds, baths, sqft, lot_size, year_built, etc.
  public_fields JSONB DEFAULT '{}', -- Fields visible to public
  private_fields JSONB DEFAULT '{}', -- Broker-only fields
  features TEXT[], -- Array of features
  tags TEXT[], -- Array of tags
  search_vector TSVECTOR, -- Full-text search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing Media
CREATE TABLE listing_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('photo', 'video', 'floorplan', 'document')),
  url TEXT NOT NULL,
  filename VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'broker_only')),
  order_index INTEGER DEFAULT 0,
  alt_text VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers and Transactions
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id),
  agent_id UUID REFERENCES profiles(id),
  offer_price DECIMAL(12,2) NOT NULL,
  terms JSONB, -- financing, contingencies, closing date, etc.
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'countered', 'accepted', 'declined', 'withdrawn', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  internal_notes TEXT, -- Broker-only notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offer Timeline/History
CREATE TABLE offer_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- 'submitted', 'countered', 'accepted', etc.
  actor_id UUID REFERENCES profiles(id),
  details JSONB,
  previous_values JSONB, -- For audit trail
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- 'listing', 'offer', 'lead', 'firm'
  entity_id UUID NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'contract', 'disclosure', 'inspection', etc.
  filename VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500),
  url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'broker_only')),
  uploader_id UUID REFERENCES profiles(id),
  version INTEGER DEFAULT 1,
  docusign_envelope_id VARCHAR(255), -- For e-signature tracking
  docusign_status VARCHAR(100), -- 'sent', 'delivered', 'completed', etc.
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  entity_type VARCHAR(50), -- 'listing', 'offer', 'lead', null for general tasks
  entity_id UUID,
  assignee_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  stage VARCHAR(100) DEFAULT 'new' CHECK (stage IN ('new', 'qualified', 'shown', 'offer', 'under_contract', 'closed', 'lost')),
  source VARCHAR(100), -- 'website', 'referral', 'social', etc.
  tags TEXT[],
  notes TEXT,
  contact_preferences JSONB, -- preferred contact method, times, etc.
  last_contact TIMESTAMP WITH TIME ZONE,
  next_followup TIMESTAMP WITH TIME ZONE,
  value_estimate DECIMAL(12,2), -- Estimated deal value
  probability INTEGER CHECK (probability >= 0 AND probability <= 100), -- Closing probability %
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'lead', 'listing', 'offer', etc.
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id),
  type VARCHAR(100) NOT NULL, -- 'call', 'email', 'meeting', 'note', 'status_change', etc.
  description TEXT NOT NULL,
  details JSONB, -- Additional structured data
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(500),
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
  is_all_day BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE for recurring events
  created_by UUID REFERENCES profiles(id),
  entity_type VARCHAR(50), -- 'listing', 'offer', 'lead' for linked events
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar Event Assignees (Many-to-Many)
CREATE TABLE calendar_event_assignees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  UNIQUE(event_id, user_id)
);

-- CMA (Comparative Market Analysis)
CREATE TABLE cma_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES listings(id), -- Optional: linked to specific listing
  lead_id UUID REFERENCES leads(id), -- Optional: linked to specific lead
  subject_property JSONB NOT NULL, -- Property details for analysis
  comp_rules JSONB NOT NULL, -- Search criteria: radius, recency, bed/bath range, etc.
  results JSONB, -- Analysis results and final valuation
  pdf_url TEXT, -- Generated PDF report
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMA Comparable Properties
CREATE TABLE cma_comps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cma_id UUID REFERENCES cma_requests(id) ON DELETE CASCADE,
  property_id UUID, -- Reference to listings table if internal
  external_data JSONB, -- Property data if from external source (MLS)
  adjustments JSONB, -- Price adjustments made
  final_adjusted_value DECIMAL(12,2),
  weight DECIMAL(3,2) DEFAULT 1.0, -- Weighting in final analysis
  included BOOLEAN DEFAULT TRUE, -- Whether included in final calculation
  notes TEXT
);

-- ROI Models
CREATE TABLE roi_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES listings(id), -- Optional: linked to specific listing
  lead_id UUID REFERENCES leads(id), -- Optional: linked to specific lead
  name VARCHAR(255) NOT NULL,
  inputs JSONB NOT NULL, -- Purchase price, down payment, interest rate, etc.
  outputs JSONB, -- Calculated metrics: cap rate, cash-on-cash, DSCR, etc.
  scenarios JSONB, -- Multiple scenarios with different assumptions
  target_metrics JSONB, -- Target ROI thresholds
  meets_targets BOOLEAN, -- Whether property meets investment criteria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions (Stripe Integration)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'active', 'past_due', 'canceled', etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  seats INTEGER NOT NULL,
  plan_id VARCHAR(255) NOT NULL, -- Stripe price ID
  plan_name VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor Verifications
CREATE TABLE investor_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verification_type VARCHAR(100) NOT NULL, -- 'accredited', 'qualified', 'institutional'
  documents JSONB, -- Array of document URLs and metadata
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID REFERENCES firms(id),
  user_id UUID REFERENCES profiles(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'view', etc.
  before_values JSONB, -- State before change
  after_values JSONB, -- State after change
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Indexes for Performance

```sql
-- Search and filtering indexes
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector);
CREATE INDEX idx_listings_firm_status ON listings(firm_id, status);
CREATE INDEX idx_listings_agent_status ON listings(agent_id, status);
CREATE INDEX idx_listings_price_range ON listings(price) WHERE status = 'active';
CREATE INDEX idx_listings_location ON listings USING GIN((address->'county'));

-- CRM indexes
CREATE INDEX idx_leads_firm_stage ON leads(firm_id, stage);
CREATE INDEX idx_leads_agent_stage ON leads(agent_id, stage);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);

-- Calendar indexes
CREATE INDEX idx_calendar_events_firm_time ON calendar_events(firm_id, start_time);
CREATE INDEX idx_calendar_assignees_user ON calendar_event_assignees(user_id);

-- Audit and compliance indexes
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
```

### 2.3 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)

-- Firm-level access policy
CREATE POLICY "Users can only access their firm's data" ON listings
  FOR ALL USING (
    firm_id IN (
      SELECT firm_id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Agent-specific access policy (for assigned-only scope)
CREATE POLICY "Agents can only see assigned listings" ON listings
  FOR SELECT USING (
    CASE 
      WHEN (
        SELECT permissions->'listings'->>'scope' 
        FROM profiles 
        WHERE user_id = auth.uid()
      ) = 'assigned_only'
      THEN agent_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
      ELSE firm_id IN (
        SELECT firm_id FROM profiles WHERE user_id = auth.uid()
      )
    END
  );

-- Permission-based policies
CREATE POLICY "Users need edit permission for listings" ON listings
  FOR UPDATE USING (
    firm_id IN (
      SELECT firm_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND (permissions->'listings'->>'edit')::boolean = true
    )
  );
```

## 3. API Specifications

### 3.1 Authentication & Authorization APIs

```typescript
// Auth types
interface User {
  id: string;
  email: string;
  role: 'primary_broker' | 'agent' | 'admin';
  firmId: string;
  permissions: PermissionMatrix;
}

interface PermissionMatrix {
  listings: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    scope: 'firm_wide' | 'assigned_only';
  };
  offers: {
    view: boolean;
    respond: boolean;
    scope: 'firm_wide' | 'assigned_only';
  };
  // ... other permissions
}

// API endpoints
POST /api/auth/invite-agent
POST /api/auth/accept-invite
GET /api/auth/permissions
PUT /api/auth/permissions/:userId
```

### 3.2 Listings Management APIs

```typescript
interface Listing {
  id: string;
  firmId: string;
  agentId: string;
  mlsNumber?: string;
  title: string;
  description: string;
  price: number;
  status: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired';
  propertyType: string;
  address: Address;
  details: PropertyDetails;
  publicFields: Record<string, any>;
  privateFields: Record<string, any>;
  features: string[];
  tags: string[];
  media: ListingMedia[];
  createdAt: string;
  updatedAt: string;
}

// API endpoints
GET /api/listings?filter=status:active&sort=price:desc&page=1&limit=20
POST /api/listings
PUT /api/listings/:id
DELETE /api/listings/:id
POST /api/listings/bulk-action
GET /api/listings/:id/media
POST /api/listings/:id/media
DELETE /api/listings/:id/media/:mediaId
```

### 3.3 Offers & Transactions APIs

```typescript
interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  agentId: string;
  offerPrice: number;
  terms: OfferTerms;
  status: 'submitted' | 'reviewed' | 'countered' | 'accepted' | 'declined';
  timeline: OfferTimelineEntry[];
  documents: Document[];
  tasks: Task[];
}

// API endpoints
GET /api/offers?status=submitted&sort=createdAt:desc
POST /api/offers
PUT /api/offers/:id/accept
PUT /api/offers/:id/counter
PUT /api/offers/:id/decline
POST /api/offers/:id/request-docs
GET /api/offers/:id/timeline
```

### 3.4 CRM APIs

```typescript
interface Lead {
  id: string;
  firmId: string;
  agentId: string;
  name: string;
  email: string;
  phone: string;
  stage: 'new' | 'qualified' | 'shown' | 'offer' | 'under_contract' | 'closed' | 'lost';
  source: string;
  tags: string[];
  notes: string;
  activities: Activity[];
  valueEstimate: number;
  probability: number;
}

// API endpoints
GET /api/leads?stage=qualified&agent=:agentId
POST /api/leads
PUT /api/leads/:id
PUT /api/leads/:id/stage
POST /api/leads/:id/activities
GET /api/leads/pipeline-stats
```

### 3.5 Calendar & Tasks APIs

```typescript
interface CalendarEvent {
  id: string;
  firmId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
  assignees: string[];
  entityType?: string;
  entityId?: string;
}

// API endpoints
GET /api/calendar/events?start=2024-01-01&end=2024-01-31
POST /api/calendar/events
PUT /api/calendar/events/:id
DELETE /api/calendar/events/:id
GET /api/tasks?assignee=:userId&status=new
POST /api/tasks
PUT /api/tasks/:id/complete
```

### 3.6 Analytics APIs

```typescript
interface FirmKPIs {
  newLeads: number;
  offersSubmitted: number;
  acceptanceRate: number;
  averageTimeToAccept: number;
  listingsByStatus: Record<string, number>;
  revenue: number;
  period: string;
}

// API endpoints
GET /api/analytics/firm-kpis?period=30d&county=broward
GET /api/analytics/market-data?county=broward&period=30d
GET /api/analytics/agent-scorecard/:agentId
GET /api/analytics/export?type=listings&format=csv
```

## 4. Component Architecture

### 4.1 Component Hierarchy

```
src/
├── components/
│   ├── broker/
│   │   ├── layout/
│   │   │   ├── BrokerLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   ├── listings/
│   │   │   ├── ListingsTable.tsx
│   │   │   ├── ListingForm.tsx
│   │   │   ├── ListingDetail.tsx
│   │   │   ├── MediaManager.tsx
│   │   │   ├── BulkActions.tsx
│   │   │   └── ListingFilters.tsx
│   │   ├── offers/
│   │   │   ├── OffersInbox.tsx
│   │   │   ├── OfferCard.tsx
│   │   │   ├── OfferDetail.tsx
│   │   │   ├── OfferActions.tsx
│   │   │   ├── CounterOfferForm.tsx
│   │   │   └── TransactionWorkspace.tsx
│   │   ├── crm/
│   │   │   ├── KanbanPipeline.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   ├── LeadDetail.tsx
│   │   │   ├── ActivityLog.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   └── AutoRoutingRules.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── EventForm.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── ReminderSettings.tsx
│   │   ├── analytics/
│   │   │   ├── KPIDashboard.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── ChartContainer.tsx
│   │   │   ├── MarketInsights.tsx
│   │   │   ├── AgentScorecard.tsx
│   │   │   └── ExportTools.tsx
│   │   ├── tools/
│   │   │   ├── CMAWizard.tsx
│   │   │   ├── CMAReport.tsx
│   │   │   ├── ROICalculator.tsx
│   │   │   ├── ROIScenarios.tsx
│   │   │   ├── ComplianceTracker.tsx
│   │   │   └── ScenarioAnalysis.tsx
│   │   ├── admin/
│   │   │   ├── SeatManagement.tsx
│   │   │   ├── AgentInvites.tsx
│   │   │   ├── PermissionsMatrix.tsx
│   │   │   ├── BillingPortal.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   └── FirmSettings.tsx
│   │   └── shared/
│   │       ├── DataTable.tsx
│   │       ├── FilterPanel.tsx
│   │       ├── SearchInput.tsx
│   │       ├── UploadManager.tsx
│   │       ├── NotificationCenter.tsx
│   │       ├── PermissionGate.tsx
│   │       └── LoadingStates.tsx
│   └── ui/ (shadcn/ui components)
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   ├── useListings.ts
│   ├── useOffers.ts
│   ├── useLeads.ts
│   ├── useCalendar.ts
│   ├── useAnalytics.ts
│   ├── useRealtime.ts
│   └── useNotifications.ts
├── stores/
│   ├── authStore.ts
│   ├── firmStore.ts
│   ├── uiStore.ts
│   └── notificationStore.ts
├── services/
│   ├── api/
│   │   ├── listings.ts
│   │   ├── offers.ts
│   │   ├── leads.ts
│   │   ├── calendar.ts
│   │   ├── analytics.ts
│   │   └── documents.ts
│   ├── integrations/
│   │   ├── stripe.ts
│   │   ├── docusign.ts
│   │   ├── sendgrid.ts
│   │   └── twilio.ts
│   └── utils/
│       ├── permissions.ts
│       ├── validation.ts
│       ├── formatting.ts
│       └── calculations.ts
└── types/
    ├── auth.ts
    ├── listings.ts
    ├── offers.ts
    ├── leads.ts
    ├── calendar.ts
    └── analytics.ts
```

### 4.2 Key Component Specifications

#### BrokerLayout Component
```typescript
interface BrokerLayoutProps {
  children: React.ReactNode;
}

const BrokerLayout: React.FC<BrokerLayoutProps> = ({ children }) => {
  const { user, permissions } = useAuth();
  const { firm } = useFirm();
  
  // Handle subscription status
  // Render sidebar with permission-based navigation
  // Show seat usage and billing alerts
  // Handle real-time notifications
};
```

#### ListingsTable Component
```typescript
interface ListingsTableProps {
  filters?: ListingFilters;
  onFilterChange?: (filters: ListingFilters) => void;
  onBulkAction?: (action: string, listingIds: string[]) => void;
}

const ListingsTable: React.FC<ListingsTableProps> = ({
  filters,
  onFilterChange,
  onBulkAction
}) => {
  // Implement virtual scrolling for large datasets
  // Real-time updates via Supabase subscriptions
  // Bulk selection and actions
  // Sortable columns with server-side sorting
  // Inline editing for quick updates
};
```

#### KanbanPipeline Component
```typescript
interface KanbanPipelineProps {
  leads: Lead[];
  onStageChange: (leadId: string, newStage: string) => void;
  onLeadClick: (lead: Lead) => void;
}

const KanbanPipeline: React.FC<KanbanPipelineProps> = ({
  leads,
  onStageChange,
  onLeadClick
}) => {
  // Drag and drop between stages
  // Real-time updates when other agents make changes
  // Stage-specific metrics and counts
  // Quick actions on lead cards
  // Auto-routing rules visualization
};
```

## 5. State Management Architecture

### 5.1 Zustand Stores

```typescript
// Auth Store
interface AuthState {
  user: User | null;
  permissions: PermissionMatrix | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
}

// Firm Store
interface FirmState {
  firm: Firm | null;
  subscription: Subscription | null;
  agents: Agent[];
  isLoading: boolean;
  fetchFirm: () => Promise<void>;
  inviteAgent: (email: string, permissions: PermissionMatrix) => Promise<void>;
  updateAgentPermissions: (agentId: string, permissions: PermissionMatrix) => Promise<void>;
}

// UI Store
interface UIState {
  sidebarCollapsed: boolean;
  activeFilters: Record<string, any>;
  selectedItems: string[];
  notifications: Notification[];
  toggleSidebar: () => void;
  setFilters: (filters: Record<string, any>) => void;
  addNotification: (notification: Notification) => void;
}
```

### 5.2 React Query Configuration

```typescript
// Query client setup with optimistic updates
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        // Global error handling
        toast.error(error.message);
      },
    },
  },
});

// Example query hooks
export const useListings = (filters: ListingFilters) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsApi.getListings(filters),
    keepPreviousData: true,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: listingsApi.createListing,
    onSuccess: (newListing) => {
      // Optimistic update
      queryClient.setQueryData(['listings'], (old: Listing[]) => [
        newListing,
        ...old,
      ]);
      
      toast.success('Listing created successfully');
    },
  });
};
```

## 6. Real-time Features Implementation

### 6.1 Supabase Real-time Subscriptions

```typescript
// Real-time hooks
export const useRealtimeListings = (firmId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const subscription = supabase
      .channel('listings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
          filter: `firm_id=eq.${firmId}`,
        },
        (payload) => {
          // Update React Query cache
          queryClient.invalidateQueries(['listings']);
          
          // Show notification for relevant changes
          if (payload.eventType === 'INSERT') {
            toast.success('New listing added');
          }
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [firmId, queryClient]);
};

// Real-time offer updates
export const useRealtimeOffers = (agentId: string) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  
  useEffect(() => {
    const subscription = supabase
      .channel('offers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
          filter: `agent_id=eq.${agentId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New offer notification
            toast.success('New offer received!');
            playNotificationSound();
          }
          
          // Update offers list
          fetchOffers();
        }
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [agentId]);
};
```

## 7. Integration Specifications

### 7.1 Stripe Integration

```typescript
// Subscription management
class StripeService {
  async createCheckoutSession(priceId: string, firmId: string) {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, firmId }),
    });
    
    return response.json();
  }
  
  async createPortalSession(customerId: string) {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });
    
    return response.json();
  }
  
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.updated':
        await this.updateSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelSubscription(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }
}
```

### 7.2 DocuSign Integration

```typescript
// E-signature service
class DocuSignService {
  async sendEnvelope(
    documentData: Buffer,
    signers: Signer[],
    templateId?: string
  ) {
    const envelope = {
      emailSubject: 'Please sign this document',
      documents: [{
        documentBase64: documentData.toString('base64'),
        name: 'Contract.pdf',
        fileExtension: 'pdf',
        documentId: '1',
      }],
      recipients: {
        signers: signers.map((signer, index) => ({
          email: signer.email,
          name: signer.name,
          recipientId: (index + 1).toString(),
          tabs: {
            signHereTabs: [{
              documentId: '1',
              pageNumber: '1',
              xPosition: '100',
              yPosition: '100',
            }],
          },
        })),
      },
      status: 'sent',
    };
    
    const response = await this.apiClient.createEnvelope(envelope);
    return response;
  }
  
  async getEnvelopeStatus(envelopeId: string) {
    return await this.apiClient.getEnvelope(envelopeId);
  }
}
```

### 7.3 Communication Services

```typescript
// Email service
class EmailService {
  async sendOfferNotification(offer: Offer, template: string) {
    const templateData = {
      offerPrice: formatCurrency(offer.offerPrice),
      propertyAddress: offer.listing.address,
      buyerName: offer.buyer.name,
      agentName: offer.agent.name,
    };
    
    await sendgrid.send({
      to: offer.agent.email,
      from: 'notifications@hatch.com',
      templateId: template,
      dynamicTemplateData: templateData,
    });
  }
}

// SMS service
class SMSService {
  async sendUrgentNotification(phone: string, message: string) {
    await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  }
}
```

## 8. Performance Optimization

### 8.1 Database Optimization
- Implement proper indexing for all search queries
- Use materialized views for complex analytics
- Implement query result caching with Redis
- Use connection pooling for database connections

### 8.2 Frontend Optimization
- Implement virtual scrolling for large data tables
- Use React.memo and useMemo for expensive calculations
- Implement code splitting for route-based chunks
- Use service workers for offline functionality

### 8.3 Caching Strategy
```typescript
// Multi-level caching
class CacheService {
  // Browser cache (React Query)
  queryCache = new QueryClient();
  
  // Session storage for user preferences
  sessionCache = {
    set: (key: string, value: any) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    get: (key: string) => {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    },
  };
  
  // Local storage for persistent settings
  persistentCache = {
    set: (key: string, value: any) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    get: (key: string) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    },
  };
}
```

## 9. Security Implementation

### 9.1 Authentication & Authorization
- Implement JWT tokens with refresh mechanism
- Use Supabase RLS for database-level security
- Implement permission-based UI rendering
- Add audit logging for all sensitive operations

### 9.2 Data Protection
```typescript
// Permission checking utility
export const checkPermission = (
  userPermissions: PermissionMatrix,
  resource: string,
  action: string,
  scope?: 'firm_wide' | 'assigned_only'
): boolean => {
  const resourcePermissions = userPermissions[resource];
  if (!resourcePermissions) return false;
  
  const hasPermission = resourcePermissions[action];
  if (!hasPermission) return false;
  
  if (scope && resourcePermissions.scope !== 'firm_wide' && scope === 'firm_wide') {
    return false;
  }
  
  return true;
};

// Component wrapper for permission-based rendering
export const PermissionGate: React.FC<{
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ resource, action, children, fallback = null }) => {
  const { permissions } = useAuth();
  
  if (!permissions || !checkPermission(permissions, resource, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
```

## 10. Testing Strategy

### 10.1 Unit Testing
```typescript
// Component testing with React Testing Library
describe('ListingsTable', () => {
  it('should render listings correctly', () => {
    const mockListings = [
      { id: '1', title: 'Test Property', price: 500000 },
    ];
    
    render(<ListingsTable listings={mockListings} />);
    
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('$500,000')).toBeInTheDocument();
  });
  
  it('should handle bulk actions', async () => {
    const onBulkAction = jest.fn();
    const mockListings = [
      { id: '1', title: 'Test Property 1', price: 500000 },
      { id: '2', title: 'Test Property 2', price: 600000 },
    ];
    
    render(
      <ListingsTable 
        listings={mockListings} 
        onBulkAction={onBulkAction} 
      />
    );
    
    // Select listings and perform bulk action
    fireEvent.click(screen.getByTestId('select-all'));
    fireEvent.click(screen.getByText('Change Status'));
    
    expect(onBulkAction).toHaveBeenCalledWith('status_change', ['1', '2']);
  });
});
```

### 10.2 Integration Testing
```typescript
// API integration testing
describe('Listings API', () => {
  it('should create listing with proper permissions', async () => {
    const mockUser = { id: '1', role: 'agent', firmId: 'firm1' };
    const listingData = {
      title: 'Test Property',
      price: 500000,
      propertyType: 'residential',
    };
    
    const response = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${generateToken(mockUser)}`)
      .send(listingData)
      .expect(201);
      
    expect(response.body.title).toBe('Test Property');
    expect(response.body.firmId).toBe('firm1');
  });
});
```

### 10.3 End-to-End Testing
```typescript
// E2E testing with Playwright
test('broker can create and manage listings', async ({ page }) => {
  // Login as broker
  await page.goto('/auth');
  await page.fill('[data-testid=email]', 'broker@test.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login]');
  
  // Navigate to listings
  await page.click('[data-testid=nav-listings]');
  await expect(page).toHaveURL('/broker/listings');
  
  // Create new listing
  await page.click('[data-testid=create-listing]');
  await page.fill('[data-testid=title]', 'Test Property');
  await page.fill('[data-testid=price]', '500000');
  await page.click('[data-testid=save-listing]');
  
  // Verify listing appears in table
  await expect(page.locator('[data-testid=listings-table]')).toContainText('Test Property');
});
```

This comprehensive technical specification provides the foundation for implementing a full-featured broker dashboard system that meets all the competitive requirements outlined in the original document.