import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { createCheckoutSession } from '@/lib/api/billing'
import { useAuth } from '@/contexts/AuthContext'
import {
  Check,
  Loader2,
  Megaphone,
  ShieldCheck,
  User,
  Users2,
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  product: 'agent_solo' | 'brokerage'
  seats: number
  monthlyPrice: number
  yearlyPrice: number
  badge?: string
  badgeTone?: 'primary' | 'secondary'
  features: string[]
}

const plans: Plan[] = [
  {
    id: 'agent-solo',
    name: 'Agent Solo',
    description: 'Full Hatch toolkit for a single agent or ISA working solo.',
    product: 'agent_solo',
    seats: 1,
    monthlyPrice: 79,
    yearlyPrice: 828,
    features: [
      '1 seat with full feature access',
      'AI listing copy + marketing assets',
      'Automated email & SMS follow ups',
      'Lead routing + personal CRM workflows',
      'MLS + portal sync for your listings',
    ],
  },
  {
    id: 'brokerage-25',
    name: 'Brokerage 25',
    description: 'Bundle for new teams that need branded marketing and seat governance.',
    product: 'brokerage',
    seats: 25,
    monthlyPrice: 499,
    yearlyPrice: 5290,
    badge: 'Great for new teams',
    badgeTone: 'secondary',
    features: [
      '25 seats with role-based permissions',
      'Centralized listings + lead routing',
      'Shared asset library & templates',
      'Seat usage analytics & basic dashboards',
      'Priority onboarding support',
    ],
  },
  {
    id: 'brokerage-50',
    name: 'Brokerage 50',
    description: 'Scale-ready plan with advanced analytics and automation hooks.',
    product: 'brokerage',
    seats: 50,
    monthlyPrice: 899,
    yearlyPrice: 9490,
    badge: 'Most Popular',
    badgeTone: 'primary',
    features: [
      '50 seats + billing overrides',
      'Advanced analytics & goal tracking',
      'Compliance logs & document vault',
      'Automation webhooks + integrations',
      'Dedicated CSM & quarterly reviews',
    ],
  },
  {
    id: 'brokerage-100',
    name: 'Brokerage 100',
    description: 'Enterprise governance, security reviews, and high-volume tooling.',
    product: 'brokerage',
    seats: 100,
    monthlyPrice: 1499,
    yearlyPrice: 15890,
    features: [
      '100 seats with granular policies',
      'Custom SSO + security assessments',
      'Multi-market MLS integrations',
      'Migration playbooks & workshops',
      'Priority SLA + roadmap input',
    ],
  },
]

const contactSales = {
  heading: 'Need more than 100 seats?',
  body: 'Talk with us for bespoke bundles, enterprise onboarding, and tailored SLAs.',
  actionText: 'Contact Sales',
  actionHref: 'mailto:sales@hatch.dev?subject=Custom%20Hatch%20Plan',
}

const Pricing: React.FC = () => {
  const { activeOrgId, activeMembership } = useAuth()
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const intervalCopy = useMemo(
    () => ({
      monthly: { label: '/month', helper: 'Billed monthly' },
      yearly: { label: '/year', helper: 'Billed annually (2 months free)' },
    }),
    []
  )

  const renderPrice = (plan: Plan) => {
    const value = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
    return `$${value.toLocaleString()}`
  }

  const handleCheckout = async (plan: Plan) => {
    try {
      setLoadingPlan(plan.id)
      const { url } = await createCheckoutSession({
        product: plan.product,
        interval,
        seats: plan.seats,
        orgId: activeOrgId ?? undefined,
        orgName: activeMembership?.org?.name,
      })
      window.location.href = url
    } catch (error) {
      console.error('Checkout failed', error)
      const description = error instanceof Error ? error.message : 'Please try again in a few minutes.'
      toast({
        title: 'Unable to start checkout',
        description,
        variant: 'destructive',
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="px-6 py-10 space-y-10">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="gap-2 text-sm">
          <ShieldCheck className="h-4 w-4" /> Seat-based Hatch subscriptions
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900">Choose the plan that fits your brokerage</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Every plan includes the Hatch marketing, listings, and agent enablement suite. Pick the seat bundle that
          matches your team — or talk with sales for something custom.
        </p>
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full p-1">
          <Button
            size="sm"
            variant={interval === 'monthly' ? 'default' : 'ghost'}
            onClick={() => setInterval('monthly')}
            className="rounded-full"
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant={interval === 'yearly' ? 'default' : 'ghost'}
            onClick={() => setInterval('yearly')}
            className="rounded-full"
          >
            Yearly
          </Button>
        </div>
        <p className="text-sm text-gray-500">{intervalCopy[interval].helper}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const badgeTone = plan.badgeTone === 'secondary' ? 'secondary' : 'default'
          const isPopular = plan.badgeTone === 'primary'

          return (
            <Card
              key={plan.id}
              className={`relative h-full flex flex-col ${
                isPopular ? 'border-purple-500 ring-2 ring-purple-100 shadow-lg' : 'hover:shadow-lg transition-shadow'
              }`}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    {plan.product === 'agent_solo' ? <User className="h-4 w-4" /> : <Users2 className="h-4 w-4" />}
                    <span>{plan.seats} seat{plan.seats === 1 ? '' : 's'} included</span>
                  </div>
                  {plan.badge && <Badge variant={badgeTone}>{plan.badge}</Badge>}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {plan.description}
                </CardDescription>
                <div>
                  <span className="text-4xl font-bold text-gray-900">{renderPrice(plan)}</span>
                  <span className="text-gray-500 ml-2">{intervalCopy[interval].label}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-6">
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-auto"
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
                    </span>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="max-w-5xl mx-auto border-dashed">
        <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-700">
            <Megaphone className="h-6 w-6" />
          </div>
          <div className="space-y-2 flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">{contactSales.heading}</h2>
            <p className="text-gray-600">{contactSales.body}</p>
          </div>
          <Button asChild variant="outline" className="whitespace-nowrap">
            <a href={contactSales.actionHref}>{contactSales.actionText}</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Pricing
