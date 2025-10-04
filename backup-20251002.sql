


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."property_state" AS ENUM (
    'PROPERTY_PENDING',
    'LIVE',
    'SOLD'
);


ALTER TYPE "public"."property_state" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_property_state_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."enforce_property_state_transition"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        'customer'
    );
    RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "event_type" "text",
    "event_payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."analytics_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."analytics_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."analytics_events_id_seq" OWNED BY "public"."analytics_events"."id";



CREATE TABLE IF NOT EXISTS "public"."firm_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(20) NOT NULL,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "joined_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "firm_memberships_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['primary_broker'::character varying, 'agent'::character varying, 'admin'::character varying])::"text"[]))),
    CONSTRAINT "firm_memberships_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying])::"text"[])))
);


ALTER TABLE "public"."firm_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."firms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "website" character varying(255),
    "phone" character varying(50),
    "address" "text",
    "city" character varying(100),
    "state" character varying(50),
    "zip_code" character varying(20),
    "country" character varying(50) DEFAULT 'US'::character varying,
    "logo_url" "text",
    "primary_broker_id" "uuid",
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "firms_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::"text"[])))
);


ALTER TABLE "public"."firms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "role" character varying(20) NOT NULL,
    "token" character varying(255) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "expires_at" timestamp with time zone NOT NULL,
    "accepted_at" timestamp with time zone,
    "accepted_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "invitations_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['agent'::character varying, 'admin'::character varying])::"text"[]))),
    CONSTRAINT "invitations_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'expired'::character varying, 'revoked'::character varying])::"text"[])))
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "agent_id" "uuid",
    "file_name" "text",
    "source" character varying(50) DEFAULT 'bulk_upload'::character varying NOT NULL,
    "status" character varying(20) DEFAULT 'uploaded'::character varying NOT NULL,
    "payload" "jsonb",
    "mapped_payload" "jsonb",
    "error_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "listing_drafts_source_check" CHECK ((("source")::"text" = ANY ((ARRAY['bulk_upload'::character varying, 'manual'::character varying, 'mls'::character varying])::"text"[]))),
    CONSTRAINT "listing_drafts_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['uploaded'::character varying, 'processing'::character varying, 'ready'::character varying, 'error'::character varying])::"text"[])))
);


ALTER TABLE "public"."listing_drafts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mls_number" "text",
    "street_address" "text",
    "city" "text",
    "state" "text",
    "zip" "text",
    "price" numeric,
    "beds" integer,
    "baths" numeric,
    "living_area_sqft" integer,
    "property_type" "text",
    "status" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org_members" (
    "org_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "org_role" "text" DEFAULT 'agent'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "org_members_org_role_check" CHECK (("org_role" = ANY (ARRAY['owner'::"text", 'broker'::"text", 'agent'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."org_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_reset_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "code" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."password_reset_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "full_name" "text",
    "role" "text" DEFAULT 'customer'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['customer'::"text", 'broker'::"text", 'agent'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "draft_id" "uuid",
    "firm_id" "uuid" NOT NULL,
    "agent_id" "uuid",
    "mls_number" "text",
    "state" "public"."property_state" DEFAULT 'PROPERTY_PENDING'::"public"."property_state" NOT NULL,
    "status" character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    "is_test" boolean DEFAULT true NOT NULL,
    "source" character varying(50) DEFAULT 'bulk_upload'::character varying NOT NULL,
    "file_name" "text",
    "address_line" "text",
    "street_number" "text",
    "street_name" "text",
    "street_suffix" "text",
    "city" "text",
    "state_code" "text",
    "zip_code" "text",
    "county" "text",
    "latitude" numeric,
    "longitude" numeric,
    "bedrooms_total" numeric,
    "bathrooms_full" numeric,
    "bathrooms_half" numeric,
    "bathrooms_total" numeric,
    "living_area_sq_ft" numeric,
    "lot_size_sq_ft" numeric,
    "lot_size_acres" numeric,
    "year_built" integer,
    "list_price" numeric,
    "original_list_price" numeric,
    "public_remarks" "text",
    "private_remarks" "text",
    "showing_instructions" "text",
    "architectural_style" "text",
    "property_type" "text",
    "property_sub_type" "text",
    "parcel_id" "text",
    "garage_spaces" numeric,
    "garage_type" "text",
    "construction_materials" "text",
    "foundation_details" "text",
    "exterior_features" "text",
    "interior_features" "text",
    "pool_features" "text",
    "cooling" "text",
    "heating" "text",
    "parking_features" "text",
    "appliances" "text",
    "laundry_features" "text",
    "photos" "text"[],
    "published_at" timestamp with time zone,
    "closed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "slug" "text",
    "cover_photo_url" "text",
    "validation_summary" "jsonb",
    "owner_name" "text",
    "owner_email" "text",
    "owner_phone" "text",
    "listing_agent_name" "text",
    "listing_agent_license" "text",
    "listing_agent_phone" "text",
    "listing_agent_email" "text",
    "listing_office_name" "text",
    "listing_office_phone" "text",
    "listing_office_email" "text",
    "listing_office_license" "text",
    "taxes" numeric,
    "flooring" "text",
    "fireplace_features" "text",
    "kitchen_features" "text",
    "primary_suite" "text",
    "roof_type" "text",
    "property_view" "text",
    "water_source" "text",
    "sewer_system" "text",
    "subdivision" "text",
    CONSTRAINT "properties_photos_check" CHECK ((("photos" IS NULL) OR ("array_length"("photos", 1) <= 50))),
    CONSTRAINT "properties_source_check" CHECK ((("source")::"text" = ANY ((ARRAY['bulk_upload'::character varying, 'manual'::character varying, 'mls'::character varying])::"text"[]))),
    CONSTRAINT "properties_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'pending'::character varying, 'sold'::character varying, 'withdrawn'::character varying, 'expired'::character varying])::"text"[])))
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "stripe_subscription_id" character varying(255) NOT NULL,
    "stripe_customer_id" character varying(255) NOT NULL,
    "tier" character varying(20) NOT NULL,
    "seats_purchased" integer DEFAULT 25 NOT NULL,
    "seats_used" integer DEFAULT 0 NOT NULL,
    "status" character varying(20) NOT NULL,
    "current_period_start" timestamp with time zone NOT NULL,
    "current_period_end" timestamp with time zone NOT NULL,
    "trial_start" timestamp with time zone,
    "trial_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "canceled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "subscriptions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'trialing'::character varying, 'past_due'::character varying, 'canceled'::character varying, 'unpaid'::character varying, 'incomplete'::character varying, 'incomplete_expired'::character varying])::"text"[]))),
    CONSTRAINT "subscriptions_tier_check" CHECK ((("tier")::"text" = ANY ((ARRAY['basic'::character varying, 'growth'::character varying, 'elite'::character varying, 'enterprise'::character varying])::"text"[])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_broker_properties" AS
 SELECT "id",
    "draft_id",
    "firm_id",
    "agent_id",
    "mls_number",
    "state",
    "status",
    "is_test",
    "source",
    "file_name",
    "address_line",
    "street_number",
    "street_name",
    "street_suffix",
    "city",
    "state_code",
    "zip_code",
    "county",
    "latitude",
    "longitude",
    "bedrooms_total",
    "bathrooms_full",
    "bathrooms_half",
    "bathrooms_total",
    "living_area_sq_ft",
    "lot_size_sq_ft",
    "lot_size_acres",
    "year_built",
    "list_price",
    "original_list_price",
    "public_remarks",
    "private_remarks",
    "showing_instructions",
    "architectural_style",
    "property_type",
    "property_sub_type",
    "parcel_id",
    "garage_spaces",
    "garage_type",
    "construction_materials",
    "foundation_details",
    "exterior_features",
    "interior_features",
    "pool_features",
    "cooling",
    "heating",
    "parking_features",
    "appliances",
    "laundry_features",
    "photos",
    "published_at",
    "closed_at",
    "created_at",
    "updated_at"
   FROM "public"."properties" "p";


ALTER VIEW "public"."vw_broker_properties" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_consumer_properties" AS
 SELECT "id",
    "draft_id",
    "firm_id",
    "agent_id",
    "mls_number",
    "state",
    "status",
    "is_test",
    "source",
    "file_name",
    "address_line",
    "street_number",
    "street_name",
    "street_suffix",
    "city",
    "state_code",
    "zip_code",
    "county",
    "latitude",
    "longitude",
    "bedrooms_total",
    "bathrooms_full",
    "bathrooms_half",
    "bathrooms_total",
    "living_area_sq_ft",
    "lot_size_sq_ft",
    "lot_size_acres",
    "year_built",
    "list_price",
    "original_list_price",
    "public_remarks",
    "private_remarks",
    "showing_instructions",
    "architectural_style",
    "property_type",
    "property_sub_type",
    "parcel_id",
    "garage_spaces",
    "garage_type",
    "construction_materials",
    "foundation_details",
    "exterior_features",
    "interior_features",
    "pool_features",
    "cooling",
    "heating",
    "parking_features",
    "appliances",
    "laundry_features",
    "photos",
    "published_at",
    "closed_at",
    "created_at",
    "updated_at"
   FROM "public"."properties" "p"
  WHERE (("state" = ANY (ARRAY['LIVE'::"public"."property_state", 'SOLD'::"public"."property_state"])) AND ("is_test" = false));


ALTER VIEW "public"."vw_consumer_properties" OWNER TO "postgres";


ALTER TABLE ONLY "public"."analytics_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."analytics_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."firm_memberships"
    ADD CONSTRAINT "firm_memberships_firm_id_user_id_key" UNIQUE ("firm_id", "user_id");



ALTER TABLE ONLY "public"."firm_memberships"
    ADD CONSTRAINT "firm_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."firms"
    ADD CONSTRAINT "firms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."firms"
    ADD CONSTRAINT "firms_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."listing_drafts"
    ADD CONSTRAINT "listing_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_pkey" PRIMARY KEY ("org_id", "user_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_codes"
    ADD CONSTRAINT "password_reset_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



CREATE INDEX "firm_memberships_firm_idx" ON "public"."firm_memberships" USING "btree" ("firm_id");



CREATE INDEX "firm_memberships_role_idx" ON "public"."firm_memberships" USING "btree" ("role");



CREATE INDEX "firm_memberships_user_idx" ON "public"."firm_memberships" USING "btree" ("user_id");



CREATE INDEX "firms_primary_broker_idx" ON "public"."firms" USING "btree" ("primary_broker_id");



CREATE INDEX "firms_slug_idx" ON "public"."firms" USING "btree" ("slug");



CREATE INDEX "idx_listings_city" ON "public"."listings" USING "btree" ("city");



CREATE INDEX "idx_listings_price" ON "public"."listings" USING "btree" ("price");



CREATE INDEX "idx_listings_property_type" ON "public"."listings" USING "btree" ("property_type");



CREATE INDEX "idx_listings_state" ON "public"."listings" USING "btree" ("state");



CREATE INDEX "idx_password_reset_codes_code" ON "public"."password_reset_codes" USING "btree" ("code");



CREATE INDEX "idx_password_reset_codes_email" ON "public"."password_reset_codes" USING "btree" ("email");



CREATE INDEX "idx_password_reset_codes_expires_at" ON "public"."password_reset_codes" USING "btree" ("expires_at");



CREATE INDEX "invitations_email_idx" ON "public"."invitations" USING "btree" ("email");



CREATE INDEX "invitations_firm_idx" ON "public"."invitations" USING "btree" ("firm_id");



CREATE INDEX "invitations_status_idx" ON "public"."invitations" USING "btree" ("status");



CREATE INDEX "invitations_token_idx" ON "public"."invitations" USING "btree" ("token");



CREATE INDEX "listing_drafts_agent_idx" ON "public"."listing_drafts" USING "btree" ("agent_id");



CREATE INDEX "listing_drafts_firm_idx" ON "public"."listing_drafts" USING "btree" ("firm_id");



CREATE INDEX "listing_drafts_status_idx" ON "public"."listing_drafts" USING "btree" ("status");



CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "profiles_role_idx" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "properties_city_state_idx" ON "public"."properties" USING "btree" ("lower"("city"), "state_code");



CREATE UNIQUE INDEX "properties_firm_mls_unique" ON "public"."properties" USING "btree" ("firm_id", "lower"("mls_number")) WHERE ("mls_number" IS NOT NULL);



CREATE INDEX "properties_lat_lon_idx" ON "public"."properties" USING "btree" ("latitude", "longitude");



CREATE UNIQUE INDEX "properties_slug_unique" ON "public"."properties" USING "btree" ("lower"("slug")) WHERE ("slug" IS NOT NULL);



CREATE INDEX "properties_state_is_test_idx" ON "public"."properties" USING "btree" ("state", "is_test");



CREATE INDEX "properties_status_idx" ON "public"."properties" USING "btree" ("status");



CREATE INDEX "properties_zip_idx" ON "public"."properties" USING "btree" ("zip_code");



CREATE INDEX "subscriptions_firm_idx" ON "public"."subscriptions" USING "btree" ("firm_id");



CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "subscriptions_stripe_idx" ON "public"."subscriptions" USING "btree" ("stripe_subscription_id");



CREATE OR REPLACE TRIGGER "enforce_property_state_transition_trg" BEFORE UPDATE ON "public"."properties" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_property_state_transition"();



CREATE OR REPLACE TRIGGER "update_firm_memberships_updated_at" BEFORE UPDATE ON "public"."firm_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_firms_updated_at" BEFORE UPDATE ON "public"."firms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invitations_updated_at" BEFORE UPDATE ON "public"."invitations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_listing_drafts_updated_at" BEFORE UPDATE ON "public"."listing_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_properties_updated_at" BEFORE UPDATE ON "public"."properties" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."firm_memberships"
    ADD CONSTRAINT "firm_memberships_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."firm_memberships"
    ADD CONSTRAINT "firm_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."firms"
    ADD CONSTRAINT "firms_primary_broker_id_fkey" FOREIGN KEY ("primary_broker_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."listing_drafts"
    ADD CONSTRAINT "listing_drafts_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."listing_drafts"
    ADD CONSTRAINT "listing_drafts_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "public"."listing_drafts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can update all profiles" ON "public"."profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = 'admin'::"text")))));



CREATE POLICY "Allow password reset code operations" ON "public"."password_reset_codes" USING (true);



CREATE POLICY "Insert listings (auth only)" ON "public"."listings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Read listings" ON "public"."listings" FOR SELECT USING (true);



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "allow_create_firm" ON "public"."firms" FOR INSERT TO "authenticated" WITH CHECK (("primary_broker_id" = "auth"."uid"()));



CREATE POLICY "allow_primary_broker_manage_invitations" ON "public"."invitations" TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."role")::"text" = 'primary_broker'::"text") AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



CREATE POLICY "allow_primary_broker_manage_memberships" ON "public"."firm_memberships" TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships_1"."firm_id"
   FROM "public"."firm_memberships" "firm_memberships_1"
  WHERE (("firm_memberships_1"."user_id" = "auth"."uid"()) AND (("firm_memberships_1"."role")::"text" = 'primary_broker'::"text") AND (("firm_memberships_1"."status")::"text" = 'active'::"text")))));



CREATE POLICY "allow_primary_broker_manage_subscription" ON "public"."subscriptions" TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."role")::"text" = 'primary_broker'::"text") AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



CREATE POLICY "allow_primary_broker_update_firm" ON "public"."firms" FOR UPDATE TO "authenticated" USING (("primary_broker_id" = "auth"."uid"()));



CREATE POLICY "allow_read_firm_invitations" ON "public"."invitations" FOR SELECT TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."role")::"text" = ANY ((ARRAY['primary_broker'::character varying, 'admin'::character varying])::"text"[])) AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



CREATE POLICY "allow_read_own_firm" ON "public"."firms" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



CREATE POLICY "allow_read_own_membership" ON "public"."firm_memberships" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("firm_id" IN ( SELECT "firm_memberships_1"."firm_id"
   FROM "public"."firm_memberships" "firm_memberships_1"
  WHERE (("firm_memberships_1"."user_id" = "auth"."uid"()) AND (("firm_memberships_1"."role")::"text" = ANY ((ARRAY['primary_broker'::character varying, 'admin'::character varying])::"text"[])) AND (("firm_memberships_1"."status")::"text" = 'active'::"text"))))));



CREATE POLICY "allow_read_own_subscription" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



ALTER TABLE "public"."firm_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."firms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_drafts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "listing_drafts_broker_mutate" ON "public"."listing_drafts" TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text"))))) WITH CHECK (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



CREATE POLICY "listing_drafts_broker_read" ON "public"."listing_drafts" FOR SELECT TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "org members read" ON "public"."org_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."org_members" "m"
  WHERE (("m"."org_id" = "org_members"."org_id") AND ("m"."user_id" = "auth"."uid"()) AND ("m"."org_role" = ANY (ARRAY['owner'::"text", 'broker'::"text"])))))));



CREATE POLICY "org readable by members" ON "public"."organizations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."org_members" "m"
  WHERE (("m"."org_id" = "organizations"."id") AND ("m"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."org_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "owners insert listings" ON "public"."listings" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "owners update own listings" ON "public"."listings" FOR UPDATE USING (("auth"."uid"() = "created_by"));



ALTER TABLE "public"."password_reset_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles self read" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles self update" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles self upsert" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "properties_authenticated_live_read" ON "public"."properties" FOR SELECT TO "authenticated" USING ((("state" = ANY (ARRAY['LIVE'::"public"."property_state", 'SOLD'::"public"."property_state"])) AND ("is_test" = false)));



CREATE POLICY "properties_broker_modify" ON "public"."properties" TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text"))))) WITH CHECK (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



CREATE POLICY "properties_broker_read" ON "public"."properties" FOR SELECT TO "authenticated" USING (("firm_id" IN ( SELECT "firm_memberships"."firm_id"
   FROM "public"."firm_memberships"
  WHERE (("firm_memberships"."user_id" = "auth"."uid"()) AND (("firm_memberships"."status")::"text" = 'active'::"text")))));



CREATE POLICY "properties_public_live_read" ON "public"."properties" FOR SELECT TO "anon" USING ((("state" = ANY (ARRAY['LIVE'::"public"."property_state", 'SOLD'::"public"."property_state"])) AND ("is_test" = false)));



CREATE POLICY "public read listings" ON "public"."listings" FOR SELECT USING (true);



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."enforce_property_state_transition"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_property_state_transition"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_property_state_transition"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."firm_memberships" TO "anon";
GRANT ALL ON TABLE "public"."firm_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."firm_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."firms" TO "anon";
GRANT ALL ON TABLE "public"."firms" TO "authenticated";
GRANT ALL ON TABLE "public"."firms" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."listing_drafts" TO "anon";
GRANT ALL ON TABLE "public"."listing_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_drafts" TO "service_role";



GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT ALL ON TABLE "public"."org_members" TO "anon";
GRANT ALL ON TABLE "public"."org_members" TO "authenticated";
GRANT ALL ON TABLE "public"."org_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."password_reset_codes" TO "anon";
GRANT ALL ON TABLE "public"."password_reset_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."password_reset_codes" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."properties" TO "anon";
GRANT ALL ON TABLE "public"."properties" TO "authenticated";
GRANT ALL ON TABLE "public"."properties" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."vw_broker_properties" TO "anon";
GRANT ALL ON TABLE "public"."vw_broker_properties" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_broker_properties" TO "service_role";



GRANT ALL ON TABLE "public"."vw_consumer_properties" TO "anon";
GRANT ALL ON TABLE "public"."vw_consumer_properties" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_consumer_properties" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
