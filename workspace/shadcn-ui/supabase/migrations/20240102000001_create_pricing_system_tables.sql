-- Pricing System Database Schema
-- Creates tables for firms, subscriptions, memberships, and invitations

BEGIN;

-- Create firms table for broker companies
CREATE TABLE IF NOT EXISTS firms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    logo_url TEXT,
    primary_broker_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create subscriptions table for Stripe subscription management
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'growth', 'elite', 'enterprise')),
    seats_purchased INTEGER NOT NULL DEFAULT 25,
    seats_used INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create firm_memberships table for user-firm relationships
CREATE TABLE IF NOT EXISTS firm_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('primary_broker', 'agent', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(firm_id, user_id)
);

-- Create invitations table for agent invitations
CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    invited_by UUID REFERENCES auth.users(id) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('agent', 'admin')),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS firms_primary_broker_idx ON firms(primary_broker_id);
CREATE INDEX IF NOT EXISTS firms_slug_idx ON firms(slug);
CREATE INDEX IF NOT EXISTS subscriptions_firm_idx ON subscriptions(firm_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS firm_memberships_firm_idx ON firm_memberships(firm_id);
CREATE INDEX IF NOT EXISTS firm_memberships_user_idx ON firm_memberships(user_id);
CREATE INDEX IF NOT EXISTS firm_memberships_role_idx ON firm_memberships(role);
CREATE INDEX IF NOT EXISTS invitations_firm_idx ON invitations(firm_id);
CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations(email);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON invitations(token);
CREATE INDEX IF NOT EXISTS invitations_status_idx ON invitations(status);

-- Setup Row Level Security (RLS)
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for firms
CREATE POLICY "allow_read_own_firm" ON firms FOR SELECT TO authenticated 
USING (
    id IN (
        SELECT firm_id FROM firm_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

CREATE POLICY "allow_primary_broker_update_firm" ON firms FOR UPDATE TO authenticated 
USING (primary_broker_id = auth.uid());

CREATE POLICY "allow_create_firm" ON firms FOR INSERT TO authenticated 
WITH CHECK (primary_broker_id = auth.uid());

-- RLS Policies for subscriptions
CREATE POLICY "allow_read_own_subscription" ON subscriptions FOR SELECT TO authenticated 
USING (
    firm_id IN (
        SELECT firm_id FROM firm_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

CREATE POLICY "allow_primary_broker_manage_subscription" ON subscriptions FOR ALL TO authenticated 
USING (
    firm_id IN (
        SELECT firm_id FROM firm_memberships 
        WHERE user_id = auth.uid() AND role = 'primary_broker' AND status = 'active'
    )
);

-- RLS Policies for firm_memberships
CREATE POLICY "allow_read_own_membership" ON firm_memberships FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR firm_id IN (
    SELECT firm_id FROM firm_memberships 
    WHERE user_id = auth.uid() AND role IN ('primary_broker', 'admin') AND status = 'active'
));

CREATE POLICY "allow_primary_broker_manage_memberships" ON firm_memberships FOR ALL TO authenticated 
USING (
    firm_id IN (
        SELECT firm_id FROM firm_memberships 
        WHERE user_id = auth.uid() AND role = 'primary_broker' AND status = 'active'
    )
);

-- RLS Policies for invitations
CREATE POLICY "allow_read_firm_invitations" ON invitations FOR SELECT TO authenticated 
USING (
    firm_id IN (
        SELECT firm_id FROM firm_memberships 
        WHERE user_id = auth.uid() AND role IN ('primary_broker', 'admin') AND status = 'active'
    )
);

CREATE POLICY "allow_primary_broker_manage_invitations" ON invitations FOR ALL TO authenticated 
USING (
    firm_id IN (
        SELECT firm_id FROM firm_memberships 
        WHERE user_id = auth.uid() AND role = 'primary_broker' AND status = 'active'
    )
);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON firms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_firm_memberships_updated_at BEFORE UPDATE ON firm_memberships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;