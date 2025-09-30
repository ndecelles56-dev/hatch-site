export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  max_listings?: number;
  max_clients?: number;
  priority_support?: boolean;
  analytics_access?: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface UsageMetrics {
  listings_used: number;
  clients_used: number;
  max_listings: number;
  max_clients: number;
}

export interface BillingInfo {
  card_last_four?: string;
  card_brand?: string;
  billing_email?: string;
  billing_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details: Record<string, unknown>;
  created: number;
}

export interface Invoice {
  id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  created: number;
  due_date?: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  lines: {
    data: Array<{
      description?: string;
      amount: number;
      period?: {
        start: number;
        end: number;
      };
    }>;
  };
}

export interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  plans: SubscriptionPlan[];
  usage: UsageMetrics | null;
  billingInfo: BillingInfo | null;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  refreshSubscription: () => Promise<void>;
  updateSubscription: (planId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  updatePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  downloadInvoice: (invoiceId: string) => Promise<void>;
}