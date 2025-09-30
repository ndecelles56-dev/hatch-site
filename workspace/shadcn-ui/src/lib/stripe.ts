import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
    
    console.log('🔧 Initializing Stripe with key:', publishableKey.substring(0, 12) + '...')
    console.log('🔍 Full environment check:', {
      VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      hasKey: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      keyLength: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.length,
      keyPrefix: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 8)
    })
    
    // Only load Stripe if we have a real key
    if (publishableKey && (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))) {
      console.log('✅ Loading real Stripe with key:', publishableKey.substring(0, 12) + '...')
      stripePromise = loadStripe(publishableKey)
    } else {
      console.log('⚠️ No real Stripe key found, Stripe not loaded')
      stripePromise = Promise.resolve(null)
    }
  }
  return stripePromise
}

export const STRIPE_PRICE_IDS = {
  basic: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID || 'price_basic_placeholder',
  growth: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID || 'price_growth_placeholder', 
  elite: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID || 'price_elite_placeholder'
} as const

export type StripePriceId = typeof STRIPE_PRICE_IDS[keyof typeof STRIPE_PRICE_IDS]

// Helper function to check if Stripe is properly configured
export const isStripeConfigured = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  console.log('🔍 Checking Stripe configuration:', {
    hasPublishableKey: !!publishableKey,
    keyPrefix: publishableKey?.substring(0, 8),
    isValidKey: publishableKey && (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))
  })
  return publishableKey && (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))
}

// Demo mode helper
export const isDemoMode = () => {
  const configured = isStripeConfigured()
  console.log('🔍 Demo mode check:', { configured, isDemoMode: !configured })
  return !configured
}

// Get comprehensive Stripe configuration
export const getStripeConfig = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  const isConfigured = isStripeConfigured()
  
  const config = {
    isConfigured,
    isDemoMode: !isConfigured,
    publishableKey: publishableKey || 'none',
    keyPrefix: publishableKey?.substring(0, 12) || 'none',
    priceIds: STRIPE_PRICE_IDS,
    environment: {
      VITE_STRIPE_PUBLISHABLE_KEY: publishableKey,
      VITE_STRIPE_BASIC_PRICE_ID: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID,
      VITE_STRIPE_GROWTH_PRICE_ID: import.meta.env.VITE_STRIPE_GROWTH_PRICE_ID,
      VITE_STRIPE_ELITE_PRICE_ID: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID
    }
  }
  
  console.log('🔧 Complete Stripe configuration:', config)
  return config
}