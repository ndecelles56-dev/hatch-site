BEGIN;

-- Custom enum for property state
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_state') THEN
        CREATE TYPE property_state AS ENUM ('PROPERTY_PENDING', 'LIVE', 'SOLD');
    END IF;
END $$;

-- Drafts table to persist uploads before promotion
CREATE TABLE IF NOT EXISTS listing_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    file_name TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'bulk_upload' CHECK (source IN ('bulk_upload', 'manual', 'mls')),
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'error')),
    payload JSONB,
    mapped_payload JSONB,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS listing_drafts_firm_idx ON listing_drafts(firm_id);
CREATE INDEX IF NOT EXISTS listing_drafts_agent_idx ON listing_drafts(agent_id);
CREATE INDEX IF NOT EXISTS listing_drafts_status_idx ON listing_drafts(status);

-- Properties table (single source of truth)
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    draft_id UUID REFERENCES listing_drafts(id) ON DELETE SET NULL,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE NOT NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    mls_number TEXT,
    state property_state NOT NULL DEFAULT 'PROPERTY_PENDING',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'pending', 'sold', 'withdrawn', 'expired')),
    is_test BOOLEAN NOT NULL DEFAULT true,
    source VARCHAR(50) NOT NULL DEFAULT 'bulk_upload' CHECK (source IN ('bulk_upload', 'manual', 'mls')),
    file_name TEXT,
    address_line TEXT,
    street_number TEXT,
    street_name TEXT,
    street_suffix TEXT,
    city TEXT,
    state_code TEXT,
    zip_code TEXT,
    county TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    bedrooms_total NUMERIC,
    bathrooms_full NUMERIC,
    bathrooms_half NUMERIC,
    bathrooms_total NUMERIC,
    living_area_sq_ft NUMERIC,
    lot_size_sq_ft NUMERIC,
    lot_size_acres NUMERIC,
    year_built INTEGER,
    list_price NUMERIC,
    original_list_price NUMERIC,
    public_remarks TEXT,
    private_remarks TEXT,
    showing_instructions TEXT,
    architectural_style TEXT,
    property_type TEXT,
    property_sub_type TEXT,
    parcel_id TEXT,
    garage_spaces NUMERIC,
    garage_type TEXT,
    construction_materials TEXT,
    foundation_details TEXT,
    exterior_features TEXT,
    interior_features TEXT,
    pool_features TEXT,
    cooling TEXT,
    heating TEXT,
    parking_features TEXT,
    appliances TEXT,
    laundry_features TEXT,
    photos TEXT[] CHECK (photos IS NULL OR array_length(photos, 1) <= 50),
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE UNIQUE INDEX IF NOT EXISTS properties_firm_mls_unique
    ON properties (firm_id, lower(mls_number))
    WHERE mls_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS properties_state_is_test_idx ON properties(state, is_test);
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_city_state_idx ON properties(lower(city), state_code);
CREATE INDEX IF NOT EXISTS properties_zip_idx ON properties(zip_code);
CREATE INDEX IF NOT EXISTS properties_lat_lon_idx ON properties(latitude, longitude);

-- Reuse timestamp trigger
CREATE TRIGGER update_listing_drafts_updated_at BEFORE UPDATE ON listing_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- State transition enforcement
CREATE OR REPLACE FUNCTION enforce_property_state_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.state <> 'PROPERTY_PENDING' THEN
            RAISE EXCEPTION 'New properties must start in PROPERTY_PENDING state';
        END IF;
        RETURN NEW;
    END IF;

    IF OLD.state = NEW.state THEN
        RETURN NEW;
    END IF;

    IF OLD.state = 'PROPERTY_PENDING' AND NEW.state IN ('PROPERTY_PENDING', 'LIVE') THEN
        RETURN NEW;
    ELSIF OLD.state = 'LIVE' AND NEW.state IN ('LIVE', 'PROPERTY_PENDING', 'SOLD') THEN
        RETURN NEW;
    ELSIF OLD.state = 'SOLD' AND NEW.state = 'SOLD' THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid property state transition: % -> %', OLD.state, NEW.state;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_property_state_transition_trg
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION enforce_property_state_transition();

-- Views
CREATE OR REPLACE VIEW vw_broker_properties AS
SELECT p.*
FROM properties p;

CREATE OR REPLACE VIEW vw_consumer_properties AS
SELECT p.*
FROM properties p
WHERE p.state IN ('LIVE', 'SOLD')
  AND p.is_test = false;

-- Enable RLS
ALTER TABLE listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Draft policies
CREATE POLICY listing_drafts_broker_read ON listing_drafts
    FOR SELECT TO authenticated
    USING (firm_id IN (
        SELECT firm_id FROM firm_memberships
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY listing_drafts_broker_mutate ON listing_drafts
    FOR ALL TO authenticated
    USING (firm_id IN (
        SELECT firm_id FROM firm_memberships
        WHERE user_id = auth.uid() AND status = 'active'
    ))
    WITH CHECK (firm_id IN (
        SELECT firm_id FROM firm_memberships
        WHERE user_id = auth.uid() AND status = 'active'
    ));

-- Property policies
CREATE POLICY properties_broker_read ON properties
    FOR SELECT TO authenticated
    USING (firm_id IN (
        SELECT firm_id FROM firm_memberships
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY properties_broker_modify ON properties
    FOR ALL TO authenticated
    USING (firm_id IN (
        SELECT firm_id FROM firm_memberships
        WHERE user_id = auth.uid() AND status = 'active'
    ))
    WITH CHECK (firm_id IN (
        SELECT firm_id FROM firm_memberships
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY properties_public_live_read ON properties
    FOR SELECT TO anon
    USING (state IN ('LIVE', 'SOLD') AND is_test = false);

CREATE POLICY properties_authenticated_live_read ON properties
    FOR SELECT TO authenticated
    USING (state IN ('LIVE', 'SOLD') AND is_test = false);

-- Helpful grants for views
GRANT SELECT ON vw_consumer_properties TO anon;
GRANT SELECT ON vw_consumer_properties TO authenticated;
GRANT SELECT ON vw_broker_properties TO authenticated;

COMMIT;
