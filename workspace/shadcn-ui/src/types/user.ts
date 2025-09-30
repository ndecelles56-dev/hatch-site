/**
 * User types and role definitions for the Hatch platform
 */

export type UserRole = 'customer' | 'agent' | 'primary_broker' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  firm_id?: string;
  license_number?: string;
  verified_investor: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrokerProfile extends UserProfile {
  role: 'primary_broker';
  firm_id: string;
  license_number: string;
  firm?: {
    id: string;
    name: string;
    license_number: string;
    address: string;
    phone: string;
    email: string;
    subscription_tier: string;
    seats_purchased: number;
    seats_used: number;
  };
}

export interface RolePermissions {
  canCreateListings: boolean;
  canManageListings: boolean;
  canViewAnalytics: boolean;
  canManageAgents: boolean;
  canManageClients: boolean;
  canAccessBrokerDashboard: boolean;
  canViewCommissions: boolean;
  canManageFirm: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  customer: {
    canCreateListings: false,
    canManageListings: false,
    canViewAnalytics: false,
    canManageAgents: false,
    canManageClients: false,
    canAccessBrokerDashboard: false,
    canViewCommissions: false,
    canManageFirm: false,
  },
  agent: {
    canCreateListings: true,
    canManageListings: true,
    canViewAnalytics: true,
    canManageAgents: false,
    canManageClients: true,
    canAccessBrokerDashboard: false,
    canViewCommissions: true,
    canManageFirm: false,
  },
  primary_broker: {
    canCreateListings: true,
    canManageListings: true,
    canViewAnalytics: true,
    canManageAgents: true,
    canManageClients: true,
    canAccessBrokerDashboard: true,
    canViewCommissions: true,
    canManageFirm: true,
  },
  admin: {
    canCreateListings: true,
    canManageListings: true,
    canViewAnalytics: true,
    canManageAgents: true,
    canManageClients: true,
    canAccessBrokerDashboard: true,
    canViewCommissions: true,
    canManageFirm: true,
  },
};