BEGIN;

-- Add additional columns to properties for consumer projection and attribution
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS slug TEXT,
    ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS validation_summary JSONB,
    ADD COLUMN IF NOT EXISTS owner_name TEXT,
    ADD COLUMN IF NOT EXISTS owner_email TEXT,
    ADD COLUMN IF NOT EXISTS owner_phone TEXT,
    ADD COLUMN IF NOT EXISTS listing_agent_name TEXT,
    ADD COLUMN IF NOT EXISTS listing_agent_license TEXT,
    ADD COLUMN IF NOT EXISTS listing_agent_phone TEXT,
    ADD COLUMN IF NOT EXISTS listing_agent_email TEXT,
    ADD COLUMN IF NOT EXISTS listing_office_name TEXT,
    ADD COLUMN IF NOT EXISTS listing_office_phone TEXT,
    ADD COLUMN IF NOT EXISTS listing_office_email TEXT,
    ADD COLUMN IF NOT EXISTS listing_office_license TEXT;

-- Ensure slug is unique (case insensitive) when provided
CREATE UNIQUE INDEX IF NOT EXISTS properties_slug_unique
    ON properties (lower(slug))
    WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS properties_draft_unique
    ON properties (draft_id)
    WHERE draft_id IS NOT NULL;

-- Enforce http(s) URLs for cover photo when provided
ALTER TABLE properties
    ADD CONSTRAINT cover_photo_url_http_chk
    CHECK (
        cover_photo_url IS NULL OR
        cover_photo_url ~* '^https?://'
    );

-- Function to normalise slugs, photos, and cover photos prior to persistence
CREATE OR REPLACE FUNCTION properties_before_write()
RETURNS TRIGGER AS $$
DECLARE
    cleaned_photos TEXT[] := ARRAY[]::TEXT[];
    url TEXT;
BEGIN
    -- Normalise slug (lowercase, hyphenated)
    IF NEW.slug IS NOT NULL THEN
        NEW.slug := lower(regexp_replace(NEW.slug, '[^a-z0-9]+', '-', 'gi'));
        NEW.slug := regexp_replace(NEW.slug, '-{2,}', '-', 'g');
        NEW.slug := trim(BOTH '-' FROM NEW.slug);
        IF NEW.slug = '' THEN
            NEW.slug := NULL;
        END IF;
    END IF;

    -- Clean photo URLs, enforce absolute http(s), dedupe preserving order, cap at 50
    IF NEW.photos IS NOT NULL THEN
        FOREACH url IN ARRAY NEW.photos LOOP
            url := trim(url);
            IF url IS NULL OR url = '' THEN
                CONTINUE;
            END IF;
            IF url !~* '^https?://' OR url ~* '^https?://localhost' THEN
                CONTINUE;
            END IF;
            IF NOT EXISTS (
                SELECT 1 FROM unnest(cleaned_photos) existing
                WHERE lower(existing) = lower(url)
            ) THEN
                cleaned_photos := array_append(cleaned_photos, url);
            END IF;
            IF array_length(cleaned_photos, 1) >= 50 THEN
                EXIT;
            END IF;
        END LOOP;
    END IF;

    NEW.photos := cleaned_photos;

    -- Set cover photo to first valid photo if missing or invalid
    IF array_length(cleaned_photos, 1) > 0 THEN
        IF NEW.cover_photo_url IS NULL OR NEW.cover_photo_url = '' OR NEW.cover_photo_url !~* '^https?://' OR NEW.cover_photo_url ~* '^https?://localhost' THEN
            NEW.cover_photo_url := cleaned_photos[1];
        END IF;
    ELSE
        NEW.cover_photo_url := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_before_insert_trg ON properties;
DROP TRIGGER IF EXISTS properties_before_update_trg ON properties;

CREATE TRIGGER properties_before_insert_trg
    BEFORE INSERT ON properties
    FOR EACH ROW
    EXECUTE FUNCTION properties_before_write();

CREATE TRIGGER properties_before_update_trg
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION properties_before_write();

-- Event log table for broker analytics and auditing
CREATE TABLE IF NOT EXISTS property_events (
    id BIGSERIAL PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
    draft_id UUID,
    event_type TEXT NOT NULL,
    reasons JSONB,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS property_events_property_idx ON property_events(property_id);
CREATE INDEX IF NOT EXISTS property_events_firm_idx ON property_events(firm_id);
CREATE INDEX IF NOT EXISTS property_events_type_idx ON property_events(event_type);
CREATE INDEX IF NOT EXISTS property_events_created_idx ON property_events(created_at DESC);

-- Trigger to capture key lifecycle transitions
CREATE OR REPLACE FUNCTION emit_property_state_events()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.draft_id IS NOT NULL THEN
            INSERT INTO property_events (property_id, firm_id, draft_id, event_type, payload)
            VALUES (NEW.id, NEW.firm_id, NEW.draft_id, 'draft.promoted_to_property',
                jsonb_build_object('state', NEW.state, 'status', NEW.status));
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.state IS DISTINCT FROM NEW.state THEN
            IF NEW.state = 'LIVE' THEN
                INSERT INTO property_events (property_id, firm_id, draft_id, event_type, payload)
                VALUES (NEW.id, NEW.firm_id, NEW.draft_id, 'property.published',
                    jsonb_build_object('previous_state', OLD.state, 'status', NEW.status, 'published_at', NEW.published_at));
            ELSIF OLD.state = 'LIVE' AND NEW.state = 'PROPERTY_PENDING' THEN
                INSERT INTO property_events (property_id, firm_id, draft_id, event_type, payload)
                VALUES (NEW.id, NEW.firm_id, NEW.draft_id, 'property.unpublished',
                    jsonb_build_object('previous_state', OLD.state, 'status', NEW.status));
            ELSIF NEW.state = 'SOLD' THEN
                INSERT INTO property_events (property_id, firm_id, draft_id, event_type, payload)
                VALUES (
                    NEW.id,
                    NEW.firm_id,
                    NEW.draft_id,
                    'property.closed',
                    jsonb_build_object('previous_state', OLD.state, 'status', NEW.status, 'closed_at', NEW.closed_at)
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS property_state_events_trg ON properties;

CREATE TRIGGER property_state_events_trg
    AFTER INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION emit_property_state_events();

-- Reproject consumer view to expose only public-safe fields
DROP VIEW IF EXISTS vw_consumer_properties;
CREATE OR REPLACE VIEW vw_consumer_properties AS
SELECT
    p.id,
    p.slug,
    CASE
        WHEN p.state = 'LIVE' THEN COALESCE(NULLIF(lower(p.status), 'draft'), 'active')
        WHEN p.state = 'PROPERTY_PENDING' THEN 'pending'
        WHEN p.state = 'SOLD' THEN 'sold'
    END AS status,
    p.state,
    p.published_at,
    p.updated_at,
    p.address_line,
    p.street_number,
    p.street_name,
    p.street_suffix,
    p.city,
    p.state_code,
    p.zip_code,
    p.latitude,
    p.longitude,
    p.list_price,
    p.bedrooms_total,
    p.bathrooms_total,
    p.bathrooms_full,
    p.bathrooms_half,
    p.living_area_sq_ft,
    p.lot_size_sq_ft,
    p.lot_size_acres,
    p.year_built,
    p.property_type,
    p.property_sub_type,
    p.cover_photo_url,
    p.photos,
    p.public_remarks,
    p.listing_office_name AS brokerage_name,
    p.listing_office_phone AS brokerage_phone
FROM properties p
WHERE p.state IN ('LIVE', 'SOLD')
  AND p.is_test = false;

-- Refresh broker view to include new columns while keeping full fidelity
DROP VIEW IF EXISTS vw_broker_properties;
CREATE OR REPLACE VIEW vw_broker_properties AS
SELECT
    p.*
FROM properties p;

-- Re-grant privileges after view recreation
GRANT SELECT ON vw_consumer_properties TO anon;
GRANT SELECT ON vw_consumer_properties TO authenticated;
GRANT SELECT ON vw_broker_properties TO authenticated;

COMMIT;
