-- Sample seed data for Hatch Real Estate Platform
-- Populates orgs, memberships, listings, and supporting records

-- Auth users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440010') THEN
        INSERT INTO auth.users (id, instance_id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at, aud, role)
        VALUES ('550e8400-e29b-41d4-a716-446655440010', '00000000-0000-0000-0000-000000000000', 'broker@sunshinefl.com', '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), now(), 'authenticated', 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440011') THEN
        INSERT INTO auth.users (id, instance_id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at, aud, role)
        VALUES ('550e8400-e29b-41d4-a716-446655440011', '00000000-0000-0000-0000-000000000000', 'agent1@sunshinefl.com', '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), now(), 'authenticated', 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440012') THEN
        INSERT INTO auth.users (id, instance_id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at, aud, role)
        VALUES ('550e8400-e29b-41d4-a716-446655440012', '00000000-0000-0000-0000-000000000000', 'agent2@sunshinefl.com', '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), now(), 'authenticated', 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440020') THEN
        INSERT INTO auth.users (id, instance_id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at, aud, role)
        VALUES ('550e8400-e29b-41d4-a716-446655440020', '00000000-0000-0000-0000-000000000000', 'broker@coastalfl.com', '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), now(), 'authenticated', 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN
        INSERT INTO auth.users (id, instance_id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, email_confirmed_at, aud, role, is_super_admin)
        VALUES ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 'superadmin@hatch.dev', '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), now(), 'authenticated', 'authenticated', true);
    END IF;
END
$$;

-- Orgs
INSERT INTO public.orgs (
    id,
    type,
    status,
    name,
    slug,
    description,
    website,
    phone,
    address,
    city,
    state,
    zip_code,
    country,
    owner_user_id,
    billing_email
) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'brokerage', 'active', 'Sunshine Realty Group', 'sunshine-realty-group',
        'Boutique South Florida brokerage with focus on waterfront homes', 'https://sunshinefl.com',
        '(305) 555-0101', '123 Main St', 'Miami', 'FL', '33101', 'US', '550e8400-e29b-41d4-a716-446655440010', 'billing@sunshinefl.com'),
    ('550e8400-e29b-41d4-a716-446655440002', 'brokerage', 'active', 'Coastal Properties LLC', 'coastal-properties-llc',
        'Luxury coastal brokerage covering Broward and Palm Beach counties', 'https://coastalfl.com',
        '(954) 555-0202', '456 Ocean Ave', 'Fort Lauderdale', 'FL', '33301', 'US', '550e8400-e29b-41d4-a716-446655440020', 'billing@coastalfl.com');

-- Profiles (note: auth.users rows must exist separately in Supabase Auth)
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    display_name,
    phone,
    role,
    global_role,
    verified_investor
) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'broker@sunshinefl.com', 'Sarah', 'Johnson', 'Sarah Johnson', '(305) 555-0111', 'broker', 'USER', false),
    ('550e8400-e29b-41d4-a716-446655440011', 'agent1@sunshinefl.com', 'Mike', 'Rodriguez', 'Mike Rodriguez', '(305) 555-0112', 'agent', 'USER', false),
    ('550e8400-e29b-41d4-a716-446655440012', 'agent2@sunshinefl.com', 'Lisa', 'Chen', 'Lisa Chen', '(305) 555-0113', 'agent', 'USER', false),
    ('550e8400-e29b-41d4-a716-446655440020', 'broker@coastalfl.com', 'David', 'Thompson', 'David Thompson', '(954) 555-0211', 'broker', 'USER', false),
    ('550e8400-e29b-41d4-a716-446655440001', 'superadmin@hatch.dev', 'Hatch', 'Ops', 'Hatch Ops', '(212) 555-0000', 'admin', 'SUPER_ADMIN', false)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    global_role = EXCLUDED.global_role,
    verified_investor = EXCLUDED.verified_investor;

-- Org memberships
INSERT INTO public.org_members (
    org_id,
    user_id,
    role,
    status,
    can_manage_billing,
    invited_by,
    invited_at,
    joined_at
) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'BROKER_OWNER', 'active', true, '550e8400-e29b-41d4-a716-446655440010', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'AGENT', 'active', false, '550e8400-e29b-41d4-a716-446655440010', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 'BROKER_MANAGER', 'active', true, '550e8400-e29b-41d4-a716-446655440010', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440020', 'BROKER_OWNER', 'active', true, '550e8400-e29b-41d4-a716-446655440020', NOW(), NOW());

-- Subscriptions
INSERT INTO public.org_subscriptions (
    org_id,
    stripe_subscription_id,
    stripe_customer_id,
    product,
    plan_interval,
    price_id,
    seats_purchased,
    seats_used,
    status,
    current_period_start,
    current_period_end
) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'sub_123', 'cus_123', 'brokerage', 'monthly', 'price_brokerage_25_monthly', 25, 3, 'active', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),
    ('550e8400-e29b-41d4-a716-446655440002', 'sub_456', 'cus_456', 'brokerage', 'yearly', 'price_brokerage_50_yearly', 50, 8, 'active', NOW() - INTERVAL '90 days', NOW() + INTERVAL '275 days');

-- Permission policies (financial visibility toggle example)
INSERT INTO public.permission_policies (org_id, key, value)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'financials.visible_to_managers', jsonb_build_object('enabled', false));

-- Licenses (metadata carries plain text for trigger encryption)
INSERT INTO public.licenses (
    org_id,
    user_id,
    type,
    state,
    license_number_encrypted,
    status,
    metadata
) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', NULL, 'brokerage', 'FL', public.encrypt_license_number('FL-BK-123456'), 'verified', jsonb_build_object('license_number_plain', 'FL-BK-123456')),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'agent', 'FL', public.encrypt_license_number('FL-SL-234567'), 'verified', jsonb_build_object('license_number_plain', 'FL-SL-234567')),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 'agent', 'FL', public.encrypt_license_number('FL-SL-345678'), 'pending', jsonb_build_object('license_number_plain', 'FL-SL-345678')),
    ('550e8400-e29b-41d4-a716-446655440002', NULL, 'brokerage', 'FL', public.encrypt_license_number('FL-BK-789012'), 'verified', jsonb_build_object('license_number_plain', 'FL-BK-789012'));

-- Sample listings (properties)
INSERT INTO public.properties (
    id,
    org_id,
    agent_id,
    mls_number,
    state,
    status,
    is_test,
    source,
    address_line,
    city,
    state_code,
    zip_code,
    list_price,
    bedrooms_total,
    bathrooms_total,
    living_area_sq_ft,
    year_built,
    property_type,
    property_sub_type,
    public_remarks,
    photos,
    published_at
) VALUES
    ('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'MLS001234', 'LIVE', 'active', false, 'manual', '789 Biscayne Blvd', 'Miami', 'FL', '33132', 850000, 3, 3, 2200, 2018, 'residential', 'condo', 'Stunning waterfront condo with panoramic bay views', ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'], NOW() - INTERVAL '7 days'),
    ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 'MLS001235', 'PROPERTY_PENDING', 'draft', false, 'manual', '1000 Brickell Ave', 'Miami', 'FL', '33131', 2500000, NULL, NULL, 5000, 2015, 'commercial', 'office', 'Prime commercial space in Brickell financial district', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], NULL);

-- Leads
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'leads'
    ) THEN
        INSERT INTO public.leads (
            id,
            first_name,
            last_name,
            email,
            phone,
            source,
            stage,
            assigned_agent_id,
            org_id,
            notes
        ) VALUES
            ('550e8400-e29b-41d4-a716-446655440200', 'John', 'Smith', 'john.smith@email.com', '(305) 555-1001', 'Website', 'new', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Interested in waterfront properties'),
            ('550e8400-e29b-41d4-a716-446655440201', 'Maria', 'Garcia', 'maria.garcia@email.com', '(305) 555-1002', 'Referral', 'contacted', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Looking for investment opportunities');
    END IF;
END
$$;

-- Calendar events
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'calendar_events'
    ) THEN
        INSERT INTO public.calendar_events (
            id,
            title,
            description,
            start_time,
            end_time,
            all_day,
            location,
            created_by,
            org_id
        ) VALUES
            ('550e8400-e29b-41d4-a716-446655440300', 'Property Showing - Biscayne Condo', 'Show waterfront condo to potential buyers', '2024-01-15 14:00:00+00', '2024-01-15 15:00:00+00', false, '789 Biscayne Blvd, Miami, FL', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001'),
            ('550e8400-e29b-41d4-a716-446655440301', 'Team Meeting', 'Weekly team sync and market update', '2024-01-16 09:00:00+00', '2024-01-16 10:00:00+00', false, 'Office Conference Room', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001');
    END IF;
END
$$;
