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
      firms: {
        Row: {
          id: string
          name: string
          license_number: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          subscription_tier: 'basic' | 'professional' | 'enterprise' | 'custom'
          seats_purchased: number
          seats_used: number
          subscription_status: 'active' | 'inactive' | 'suspended'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          license_number?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          subscription_tier?: 'basic' | 'professional' | 'enterprise' | 'custom'
          seats_purchased?: number
          seats_used?: number
          subscription_status?: 'active' | 'inactive' | 'suspended'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          license_number?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          subscription_tier?: 'basic' | 'professional' | 'enterprise' | 'custom'
          seats_purchased?: number
          seats_used?: number
          subscription_status?: 'active' | 'inactive' | 'suspended'
          stripe_customer_id?: string | null
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
          phone: string | null
          role: 'primary_broker' | 'agent' | 'staff' | 'investor' | 'customer' | 'admin'
          firm_id: string | null
          license_number: string | null
          permissions: Json | null
          verified_investor: boolean
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'primary_broker' | 'agent' | 'staff' | 'investor' | 'customer' | 'admin'
          firm_id?: string | null
          license_number?: string | null
          permissions?: Json | null
          verified_investor?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'primary_broker' | 'agent' | 'staff' | 'investor' | 'customer' | 'admin'
          firm_id?: string | null
          license_number?: string | null
          permissions?: Json | null
          verified_investor?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          mls_number: string | null
          property_type: 'residential' | 'commercial' | 'land' | 'multifamily' | 'industrial'
          status: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired'
          address: string
          city: string
          state: string
          zip_code: string
          county: string
          latitude: number | null
          longitude: number | null
          price: number
          square_feet: number | null
          lot_size: number | null
          bedrooms: number | null
          bathrooms: number | null
          year_built: number | null
          description: string | null
          noi: number | null
          cap_rate: number | null
          cash_on_cash: number | null
          listing_agent_id: string
          firm_id: string
          public_allowed: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mls_number?: string | null
          property_type: 'residential' | 'commercial' | 'land' | 'multifamily' | 'industrial'
          status?: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired'
          address: string
          city: string
          state: string
          zip_code: string
          county: string
          latitude?: number | null
          longitude?: number | null
          price: number
          square_feet?: number | null
          lot_size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          year_built?: number | null
          description?: string | null
          noi?: number | null
          cap_rate?: number | null
          cash_on_cash?: number | null
          listing_agent_id: string
          firm_id: string
          public_allowed?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mls_number?: string | null
          property_type?: 'residential' | 'commercial' | 'land' | 'multifamily' | 'industrial'
          status?: 'active' | 'pending' | 'sold' | 'withdrawn' | 'expired'
          address?: string
          city?: string
          state?: string
          zip_code?: string
          county?: string
          latitude?: number | null
          longitude?: number | null
          price?: number
          square_feet?: number | null
          lot_size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          year_built?: number | null
          description?: string | null
          noi?: number | null
          cap_rate?: number | null
          cash_on_cash?: number | null
          listing_agent_id?: string
          firm_id?: string
          public_allowed?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
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
          stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost'
          assigned_agent_id: string | null
          firm_id: string
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
          stage?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost'
          assigned_agent_id?: string | null
          firm_id: string
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
          stage?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost'
          assigned_agent_id?: string | null
          firm_id?: string
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
          firm_id: string
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
          firm_id: string
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
          firm_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}