import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Star, Zap, Crown, Shield } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for new agents getting started',
    icon: <Star className="w-6 h-6" />,
    features: [
      'Up to 50 client contacts',
      'Basic CRM functionality',
      'Email templates',
      'Mobile app access',
      'Standard support'
    ],
    notIncluded: [
      'Advanced analytics',
      'Team collaboration',
      'Custom branding',
      'API access'
    ],
    popular: false,
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'For established agents and small teams',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Up to 500 client contacts',
      'Advanced CRM with automation',
      'Custom email templates',
      'Advanced analytics & reporting',
      'Team collaboration tools',
      'Priority support',
      'Mobile app with offline access',
      'Integration with MLS systems'
    ],
    notIncluded: [
      'Custom branding',
      'API access'
    ],
    popular: true,
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For large teams and brokerages',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Unlimited client contacts',
      'Full CRM suite with AI insights',
      'Custom branding & white-label',
      'Advanced team management',
      'Custom integrations & API access',
      'Dedicated account manager',
      'Custom training sessions',
      'Advanced security features',
      'Custom reporting dashboards'
    ],
    notIncluded: [],
    popular: false,
    color: 'from-amber-500 to-amber-600'
  }
]

const addOns = [
  {
    name: 'Lead Generation Pro',
    price: '$49/month',
    description: 'Advanced lead capture and nurturing tools',
    icon: <Shield className="w-5 h-5" />
  },
  {
    name: 'Marketing Automation',
    price: '$39/month',
    description: 'Automated email campaigns and social media posting',
    icon: <Zap className="w-5 h-5" />
  },
  {
    name: 'Advanced Analytics',
    price: '$29/month',
    description: 'Detailed performance insights and custom reports',
    icon: <Star className="w-5 h-5" />
  }
]

export default function PricingPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your real estate business. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              plan.popular ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                {plan.icon}
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <CardDescription className="text-gray-600 mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-900 hover:bg-gray-800'
                } text-white`}
              >
                {plan.popular ? 'Start Free Trial' : 'Get Started'}
              </Button>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.notIncluded.length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {plan.notIncluded.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add-ons Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Power Up Your Plan</h2>
          <p className="text-gray-600">Enhance your experience with these optional add-ons</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {addOns.map((addon, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {addon.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                    <p className="text-sm font-medium text-blue-600">{addon.price}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{addon.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Add to Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change my plan at any time?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial available?</h3>
              <p className="text-gray-600">We offer a 14-day free trial for all plans. No credit card required to get started.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer custom enterprise solutions?</h3>
              <p className="text-gray-600">Yes, we work with large brokerages to create custom solutions. Contact our sales team to discuss your specific needs.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join thousands of real estate professionals who trust our platform to grow their business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline">
            Schedule Demo
          </Button>
        </div>
      </div>
    </div>
  )
}