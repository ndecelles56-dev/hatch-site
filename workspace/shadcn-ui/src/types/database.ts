export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string
          type: Database['public']['Enums']['org_type']
          status: Database['public']['Enums']['org_status']
          name: string
          slug: string | null
          description: string | null
          website: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          logo_url: string | null
          owner_user_id: string | null
          billing_email: string | null
          stripe_customer_id: string | null
          grace_period_ends_at: string | null
          metadata: Json | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type?: Database['public']['Enums']['org_type']
          status?: Database['public']['Enums']['org_status']
          name: string
          slug?: string | null
          description?: string | null
          website?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          logo_url?: string | null
          owner_user_id?: string | null
          billing_email?: string | null
          stripe_customer_id?: string | null
          grace_period_ends_at?: string | null
          metadata?: Json | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: Database['public']['Enums']['org_type']
          status?: Database['public']['Enums']['org_status']
          name?: string
          slug?: string | null
          description?: string | null
          website?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          logo_url?: string | null
          owner_user_id?: string | null
          billing_email?: string | null
          stripe_customer_id?: string | null
          grace_period_ends_at?: string | null
          metadata?: Json | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: Database['public']['Enums']['org_member_role']
          status: Database['public']['Enums']['org_member_status']
          permissions: Json | null
          can_manage_billing: boolean
          metadata: Json | null
          invited_by: string | null
          invited_at: string | null
          accepted_at: string | null
          removed_at: string | null
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: Database['public']['Enums']['org_member_role']
          status?: Database['public']['Enums']['org_member_status']
          permissions?: Json | null
          can_manage_billing?: boolean
          metadata?: Json | null
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          removed_at?: string | null
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: Database['public']['Enums']['org_member_role']
          status?: Database['public']['Enums']['org_member_status']
          permissions?: Json | null
          can_manage_billing?: boolean
          metadata?: Json | null
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          removed_at?: string | null
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      org_subscriptions: {
        Row: {
          id: string
          org_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          product: Database['public']['Enums']['subscription_product']
          plan_interval: Database['public']['Enums']['subscription_interval']
          price_id: string | null
          seats_purchased: number
          seats_used: number
          status: Database['public']['Enums']['subscription_state']
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          metadata: Json | null
          grace_period_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          product?: Database['public']['Enums']['subscription_product']
          plan_interval?: Database['public']['Enums']['subscription_interval']
          price_id?: string | null
          seats_purchased?: number
          seats_used?: number
          status?: Database['public']['Enums']['subscription_state']
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          metadata?: Json | null
          grace_period_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          product?: Database['public']['Enums']['subscription_product']
          plan_interval?: Database['public']['Enums']['subscription_interval']
          price_id?: string | null
          seats_purchased?: number
          seats_used?: number
          status?: Database['public']['Enums']['subscription_state']
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          metadata?: Json | null
          grace_period_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      org_invitations: {
        Row: {
          id: string
          org_id: string
          invited_by: string
          email: string
          role: Database['public']['Enums']['org_member_role']
          token: string
          status: Database['public']['Enums']['invite_status']
          expires_at: string
          accepted_at: string | null
          accepted_by: string | null
          invited_member_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          invited_by: string
          email: string
          role?: Database['public']['Enums']['org_member_role']
          token: string
          status?: Database['public']['Enums']['invite_status']
          expires_at: string
          accepted_at?: string | null
          accepted_by?: string | null
          invited_member_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          invited_by?: string
          email?: string
          role?: Database['public']['Enums']['org_member_role']
          token?: string
          status?: Database['public']['Enums']['invite_status']
          expires_at?: string
          accepted_at?: string | null
          accepted_by?: string | null
          invited_member_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      licenses: {
        Row: {
          id: string
          org_id: string | null
          user_id: string | null
          type: Database['public']['Enums']['license_type']
          state: string
          license_number_encrypted: string
          license_number_last4: string | null
          license_number_hash: string | null
          status: Database['public']['Enums']['license_status']
          verification_notes: string | null
          verification_status_changed_by: string | null
          verification_status_changed_at: string | null
          docs_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          type: Database['public']['Enums']['license_type']
          state: string
          license_number_encrypted: string
          license_number_last4?: string | null
          license_number_hash?: string | null
          status?: Database['public']['Enums']['license_status']
          verification_notes?: string | null
          verification_status_changed_by?: string | null
          verification_status_changed_at?: string | null
          docs_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          user_id?: string | null
          type?: Database['public']['Enums']['license_type']
          state?: string
          license_number_encrypted?: string
          license_number_last4?: string | null
          license_number_hash?: string | null
          status?: Database['public']['Enums']['license_status']
          verification_notes?: string | null
          verification_status_changed_by?: string | null
          verification_status_changed_at?: string | null
          docs_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      permission_policies: {
        Row: {
          id: string
          org_id: string
          key: string
          value: Json
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          key: string
          value: Json
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          key?: string
          value?: Json
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_user_id: string | null
          org_id: string | null
          action: string
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          org_id?: string | null
          action: string
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_user_id?: string | null
          org_id?: string | null
          action?: string
          meta?: Json | null
          created_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          value: Json
          scope_type: string | null
          scope_id: string | null
          enabled: boolean | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          scope_type?: string | null
          scope_id?: string | null
          enabled?: boolean | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          scope_type?: string | null
          scope_id?: string | null
          enabled?: boolean | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listing_drafts: {
        Row: {
          id: string
          org_id: string
          agent_id: string | null
          file_name: string | null
          source: 'bulk_upload' | 'manual' | 'mls'
          status: 'uploaded' | 'processing' | 'ready' | 'error'
          payload: Json | null
          mapped_payload: Json | null
          error_details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          agent_id?: string | null
          file_name?: string | null
          source?: 'bulk_upload' | 'manual' | 'mls'
          status?: 'uploaded' | 'processing' | 'ready' | 'error'
          payload?: Json | null
          mapped_payload?: Json | null
          error_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          agent_id?: string | null
          file_name?: string | null
          source?: 'bulk_upload' | 'manual' | 'mls'
          status?: 'uploaded' | 'processing' | 'ready' | 'error'
          payload?: Json | null
          mapped_payload?: Json | null
          error_details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          draft_id: string | null
          org_id: string
          agent_id: string | null
          mls_number: string | null
          state: 'PROPERTY_PENDING' | 'LIVE' | 'SOLD'
          status: 'draft' | 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired'
          is_test: boolean
          source: 'bulk_upload' | 'manual' | 'mls'
          file_name: string | null
          address_line: string | null
          street_number: string | null
          street_name: string | null
          street_suffix: string | null
          city: string | null
          state_code: string | null
          zip_code: string | null
          county: string | null
          latitude: number | null
          longitude: number | null
          bedrooms_total: number | null
          bathrooms_full: number | null
          bathrooms_half: number | null
          bathrooms_total: number | null
          living_area_sq_ft: number | null
          lot_size_sq_ft: number | null
          lot_size_acres: number | null
          year_built: number | null
          list_price: number | null
          original_list_price: number | null
          public_remarks: string | null
          private_remarks: string | null
          showing_instructions: string | null
          architectural_style: string | null
          property_type: string | null
          property_sub_type: string | null
          parcel_id: string | null
          garage_spaces: number | null
          garage_type: string | null
          construction_materials: string | null
          foundation_details: string | null
          exterior_features: string | null
          interior_features: string | null
          pool_features: string | null
          cooling: string | null
          heating: string | null
          parking_features: string | null
          appliances: string | null
          laundry_features: string | null
          taxes: number | null
          flooring: string | null
          fireplace_features: string | null
          kitchen_features: string | null
          primary_suite: string | null
          roof_type: string | null
          property_view: string | null
          water_source: string | null
          sewer_system: string | null
          subdivision: string | null
          slug: string | null
          cover_photo_url: string | null
          validation_summary: Json | null
          owner_name: string | null
          owner_email: string | null
          owner_phone: string | null
          listing_agent_name: string | null
          listing_agent_license: string | null
          listing_agent_phone: string | null
          listing_agent_email: string | null
          listing_office_name: string | null
          listing_office_phone: string | null
          listing_office_email: string | null
          listing_office_license: string | null
          photos: string[] | null
          published_at: string | null
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          draft_id?: string | null
          org_id: string
          agent_id?: string | null
          mls_number?: string | null
          state?: 'PROPERTY_PENDING' | 'LIVE' | 'SOLD'
          status?: 'draft' | 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired'
          is_test?: boolean
          source?: 'bulk_upload' | 'manual' | 'mls'
          file_name?: string | null
          address_line?: string | null
          street_number?: string | null
          street_name?: string | null
          street_suffix?: string | null
          city?: string | null
          state_code?: string | null
          zip_code?: string | null
          county?: string | null
          latitude?: number | null
          longitude?: number | null
          bedrooms_total?: number | null
          bathrooms_full?: number | null
          bathrooms_half?: number | null
          bathrooms_total?: number | null
          living_area_sq_ft?: number | null
          lot_size_sq_ft?: number | null
          lot_size_acres?: number | null
          year_built?: number | null
          list_price?: number | null
          original_list_price?: number | null
          public_remarks?: string | null
          private_remarks?: string | null
          showing_instructions?: string | null
          architectural_style?: string | null
          property_type?: string | null
          property_sub_type?: string | null
          parcel_id?: string | null
          garage_spaces?: number | null
          garage_type?: string | null
          construction_materials?: string | null
          foundation_details?: string | null
          exterior_features?: string | null
          interior_features?: string | null
          pool_features?: string | null
          cooling?: string | null
          heating?: string | null
          parking_features?: string | null
          appliances?: string | null
          laundry_features?: string | null
          taxes?: number | null
          flooring?: string | null
          fireplace_features?: string | null
          kitchen_features?: string | null
          primary_suite?: string | null
          roof_type?: string | null
          property_view?: string | null
          water_source?: string | null
          sewer_system?: string | null
          subdivision?: string | null
          slug?: string | null
          cover_photo_url?: string | null
          validation_summary?: Json | null
          owner_name?: string | null
          owner_email?: string | null
          owner_phone?: string | null
          listing_agent_name?: string | null
          listing_agent_license?: string | null
          listing_agent_phone?: string | null
          listing_agent_email?: string | null
          listing_office_name?: string | null
          listing_office_phone?: string | null
          listing_office_email?: string | null
          listing_office_license?: string | null
          photos?: string[] | null
          published_at?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          draft_id?: string | null
          org_id?: string
          agent_id?: string | null
          mls_number?: string | null
          state?: 'PROPERTY_PENDING' | 'LIVE' | 'SOLD'
          status?: 'draft' | 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired'
          is_test?: boolean
          source?: 'bulk_upload' | 'manual' | 'mls'
          file_name?: string | null
          address_line?: string | null
          street_number?: string | null
          street_name?: string | null
          street_suffix?: string | null
          city?: string | null
          state_code?: string | null
          zip_code?: string | null
          county?: string | null
          latitude?: number | null
          longitude?: number | null
          bedrooms_total?: number | null
          bathrooms_full?: number | null
          bathrooms_half?: number | null
          bathrooms_total?: number | null
          living_area_sq_ft?: number | null
          lot_size_sq_ft?: number | null
          lot_size_acres?: number | null
          year_built?: number | null
          list_price?: number | null
          original_list_price?: number | null
          public_remarks?: string | null
          private_remarks?: string | null
          showing_instructions?: string | null
          architectural_style?: string | null
          property_type?: string | null
          property_sub_type?: string | null
          parcel_id?: string | null
          garage_spaces?: number | null
          garage_type?: string | null
          construction_materials?: string | null
          foundation_details?: string | null
          exterior_features?: string | null
          interior_features?: string | null
          pool_features?: string | null
          cooling?: string | null
          heating?: string | null
          parking_features?: string | null
          appliances?: string | null
          laundry_features?: string | null
          taxes?: number | null
          flooring?: string | null
          fireplace_features?: string | null
          kitchen_features?: string | null
          primary_suite?: string | null
          roof_type?: string | null
          property_view?: string | null
          water_source?: string | null
          sewer_system?: string | null
          subdivision?: string | null
          slug?: string | null
          cover_photo_url?: string | null
          validation_summary?: Json | null
          owner_name?: string | null
          owner_email?: string | null
          owner_phone?: string | null
          listing_agent_name?: string | null
          listing_agent_license?: string | null
          listing_agent_phone?: string | null
          listing_agent_email?: string | null
          listing_office_name?: string | null
          listing_office_phone?: string | null
          listing_office_email?: string | null
          listing_office_license?: string | null
          photos?: string[] | null
          published_at?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_events: {
        Row: {
          id: number
          property_id: string | null
          org_id: string | null
          draft_id: string | null
          event_type: string
          reasons: Json | null
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          property_id?: string | null
          org_id?: string | null
          draft_id?: string | null
          event_type: string
          reasons?: Json | null
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          property_id?: string | null
          org_id?: string | null
          draft_id?: string | null
          event_type?: string
          reasons?: Json | null
          payload?: Json | null
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          source: string | null
          stage:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'proposal'
            | 'negotiation'
            | 'closed'
            | 'lost'
          assigned_agent_id: string | null
          org_id: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          source?: string | null
          stage?:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'proposal'
            | 'negotiation'
            | 'closed'
            | 'lost'
          assigned_agent_id?: string | null
          org_id: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          source?: string | null
          stage?:
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'proposal'
            | 'negotiation'
            | 'closed'
            | 'lost'
          assigned_agent_id?: string | null
          org_id?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          all_day: boolean
          location: string | null
          created_by: string
          org_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          all_day?: boolean
          location?: string | null
          created_by: string
          org_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          all_day?: boolean
          location?: string | null
          created_by?: string
          org_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          phone: string | null
          role:
            | 'customer'
            | 'agent'
            | 'broker'
            | 'admin'
            | 'staff'
            | 'investor'
            | 'primary_broker'
          global_role: Database['public']['Enums']['global_role']
          avatar_url: string | null
          bio: string | null
          license_number: string | null
          verified_investor: boolean
          metadata: Json | null
          active_org_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          phone?: string | null
          role?:
            | 'customer'
            | 'agent'
            | 'broker'
            | 'admin'
            | 'staff'
            | 'investor'
            | 'primary_broker'
          global_role?: Database['public']['Enums']['global_role']
          avatar_url?: string | null
          bio?: string | null
          license_number?: string | null
          verified_investor?: boolean
          metadata?: Json | null
          active_org_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          phone?: string | null
          role?:
            | 'customer'
            | 'agent'
            | 'broker'
            | 'admin'
            | 'staff'
            | 'investor'
            | 'primary_broker'
          global_role?: Database['public']['Enums']['global_role']
          avatar_url?: string | null
          bio?: string | null
          license_number?: string | null
          verified_investor?: boolean
          metadata?: Json | null
          active_org_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      vw_broker_properties: {
        Row: Database['public']['Tables']['properties']['Row']
      }
      vw_consumer_properties: {
        Row: {
          id: string
          slug: string | null
          status: string | null
          state: 'PROPERTY_PENDING' | 'LIVE' | 'SOLD'
          published_at: string | null
          updated_at: string
          address_line: string | null
          street_number: string | null
          street_name: string | null
          street_suffix: string | null
          city: string | null
          state_code: string | null
          zip_code: string | null
          latitude: number | null
          longitude: number | null
          list_price: number | null
          bedrooms_total: number | null
          bathrooms_total: number | null
          bathrooms_full: number | null
          bathrooms_half: number | null
          living_area_sq_ft: number | null
          lot_size_sq_ft: number | null
          lot_size_acres: number | null
          year_built: number | null
          property_type: string | null
          property_sub_type: string | null
          cover_photo_url: string | null
          photos: string[] | null
          public_remarks: string | null
          brokerage_name: string | null
          brokerage_phone: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      global_role: 'SUPER_ADMIN' | 'SUPPORT_ADMIN' | 'USER'
      org_type: 'brokerage' | 'personal'
      org_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'suspended'
      org_member_role: 'BROKER_OWNER' | 'BROKER_MANAGER' | 'AGENT' | 'PENDING'
      org_member_status: 'active' | 'invited' | 'inactive' | 'removed'
      subscription_product: 'agent_solo' | 'brokerage'
      subscription_interval: 'monthly' | 'yearly'
      subscription_state:
        | 'active'
        | 'trialing'
        | 'past_due'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'unpaid'
      license_type: 'agent' | 'brokerage'
      license_status: 'unverified' | 'pending' | 'verified' | 'rejected'
      invite_status: 'sent' | 'accepted' | 'revoked' | 'expired'
    }
  }
}
