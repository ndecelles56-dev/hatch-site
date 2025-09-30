import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { createCheckoutSession } from '@/api/stripe'
import { STRIPE_PRICE_IDS, isDemoMode, isStripeConfigured, getStripeConfig } from '@/lib/stripe'
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Headphones,
  Loader2,
  Building2,
  Sparkles,
  AlertCircle,
  Info
} from 'lucide-react'

const plans = [
  {
    id: 'basic',
    name: 'Basic Broker',
    price: 79,
    priceId: STRIPE_PRICE_IDS.basic,
    description: 'Perfect for individual agents getting started',
    badge: null,
    icon: Building2,
    color: 'bg-blue-500',
    features: [
      'Up to 25 active listings',
      'Basic CRM tools',
      'Email support',
      'Mobile app access',
      'Basic analytics',
      'Lead capture forms',
    ]
  },
  {
    id: 'growth',
    name: 'Growth Broker',
    price: 149,
    priceId: STRIPE_PRICE_IDS.growth,
    description: 'Ideal for growing teams and established agents',
    badge: 'Most Popular',
    icon: Zap,
    color: 'bg-green-500',
    features: [
      'Up to 100 active listings',
      'Advanced CRM with automation',
      'Priority email & chat support',
      'Team collaboration tools',
      'Advanced analytics & reporting',
      'Lead capture & nurturing',
      'MLS integration',
      'Custom branding',
      'Social media tools',
    ]
  },
  {
    id: 'elite',
    name: 'Elite Broker',
    price: 249,
    priceId: STRIPE_PRICE_IDS.elite,
    description: 'For large teams and brokerages needing everything',
    badge: 'Best Value',
    icon: Crown,
    color: 'bg-purple-500',
    features: [
      'Unlimited active listings',
      'Full CRM suite with AI insights',
      'Dedicated account manager',
      'Advanced team management',
      'Custom analytics dashboard',
      'Advanced lead scoring',
      'Full MLS & third-party integrations',
      'White-label solution',
      'Advanced marketing automation',
      'API access',
      'Custom training sessions',
    ]
  }
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stripeConfig, setStripeConfig] = useState<any>(null)

  useEffect(() => {
    const config = getStripeConfig()
    setStripeConfig(config)
    console.log('🔧 Stripe Configuration:', config)
    console.log('👤 User authentication state:', { user: !!user, userId: user?.id, email: user?.email })
  }, [user])

  const handleSubscribe = async (plan: typeof plans[0]) => {
    console.log('🎯 Subscribe button clicked for:', plan.name)
    console.log('👤 Current user state:', { user: !!user, userId: user?.id, email: user?.email })

    setLoadingPlan(plan.id)
    setError(null)

    // Add timeout to prevent infinite spinning
    const timeoutId = setTimeout(() => {
      console.log('⏰ Checkout timeout - stopping loading state')
      setLoadingPlan(null)
      setError('Checkout timed out. Please try again.')
    }, 15000)

    try {
      // Use real user if authenticated, otherwise create demo user
      const userInfo = user && user.id && user.email 
        ? { id: user.id, email: user.email }
        : { id: `demo_${Date.now()}`, email: 'demo@example.com' }

      console.log('🚀 Starting checkout process for:', plan.name)
      console.log('👤 User info for checkout:', userInfo)
      console.log('💳 Price ID:', plan.priceId)

      const result = await createCheckoutSession({
        priceId: plan.priceId,
        userId: userInfo.id,
        userEmail: userInfo.email,
        planName: plan.name,
      })

      // Clear timeout since we got a result
      clearTimeout(timeoutId)

      console.log('✅ Checkout session created:', result)

      if (result?.url) {
        console.log('🔄 Redirecting to checkout:', result.url)
        
        // Ensure we're not redirecting to /auth
        if (result.url.includes('/auth')) {
          console.error('❌ Invalid redirect URL detected:', result.url)
          throw new Error('Invalid checkout URL - please try again')
        }
        
        // Immediate redirect
        window.location.href = result.url
      } else {
        throw new Error('No checkout URL received from session')
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('❌ Checkout error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Checkout failed: ${errorMessage}`)
      setLoadingPlan(null)
    }
  }

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@hatch.com?subject=Enterprise%20Plan%20Inquiry'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Unlock the full potential of your real estate business with our professional tools and features.
          </p>
          
          {/* Authentication Status */}
          <div className="max-w-md mx-auto mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              {user ? `✅ Logged in as: ${user.email}` : '⚠️ Not logged in - will use demo checkout'}
            </p>
          </div>
          
          {/* Stripe Configuration Status */}
          {stripeConfig && (
            <div className={`max-w-md mx-auto mb-8 p-4 border rounded-lg ${
              stripeConfig.isConfigured 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                <Info className={`w-5 h-5 mr-2 ${
                  stripeConfig.isConfigured ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <p className={`text-sm font-medium ${
                  stripeConfig.isConfigured ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {stripeConfig.isConfigured ? '✅ Stripe Configured' : '⚠️ Demo Mode'}
                </p>
              </div>
              <p className={`text-xs mt-1 ${
                stripeConfig.isConfigured ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {stripeConfig.isConfigured 
                  ? 'Real Stripe integration - will redirect to checkout'
                  : 'Demo mode - will show success page'
                }
              </p>
            </div>
          )}
          
          {error && (
            <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-600 text-sm font-medium">Checkout Error</p>
              </div>
              <p className="text-red-600 text-xs mt-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-800 underline text-xs mt-2"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              30-day money-back guarantee
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Headphones className="w-4 h-4 mr-2" />
              24/7 customer support
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isLoading = loadingPlan === plan.id
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.badge === 'Most Popular' 
                    ? 'border-2 border-blue-500 scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                    {plan.badge === 'Most Popular' && <Crown className="w-3 h-3 inline mr-1" />}
                    {plan.badge === 'Best Value' && <Zap className="w-3 h-3 inline mr-1" />}
                    {plan.badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Button 
                    className="w-full text-lg py-6" 
                    size="lg"
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading}
                    variant={plan.badge === 'Most Popular' ? 'default' : 'outline'}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Checkout...
                      </>
                    ) : (
                      <>
                        {user ? 'Subscribe Now' : 'Try Demo Checkout'}
                      </>
                    )}
                  </Button>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      What's included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <Check className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enterprise Plan */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Enterprise</CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Custom solution for large organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>✓ Unlimited agents</div>
                <div>✓ Custom integrations</div>
                <div>✓ Advanced API access</div>
                <div>✓ White-label solution</div>
                <div>✓ Dedicated infrastructure</div>
                <div>✓ Custom reporting</div>
                <div>✓ Priority support</div>
                <div>✓ Custom contracts</div>
              </div>
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={handleContactSales}
              >
                Contact Sales for Custom Pricing
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h3>
                <p className="text-gray-600 text-sm">
                  No setup fees! You only pay the monthly subscription fee. Start using all features immediately.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">
                  We accept all major credit cards (Visa, MasterCard, American Express) and ACH bank transfers.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your first month.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                <p className="text-gray-600 text-sm">
                  Absolutely! We use bank-level encryption and are SOC 2 compliant. Your data is always protected.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until your current billing period ends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Need help choosing the right plan?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you find the perfect solution for your business.
          </p>
          <Button variant="outline" size="lg" onClick={handleContactSales}>
            <Headphones className="w-4 h-4 mr-2" />
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
}