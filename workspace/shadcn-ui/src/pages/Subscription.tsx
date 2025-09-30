import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Zap, 
  Shield, 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  Users, 
  BarChart3, 
  Search, 
  Bell, 
  Globe, 
  Smartphone, 
  Headphones, 
  Award,
  TrendingUp,
  Building,
  MapPin,
  Eye,
  FileText,
  Mail,
  Phone
} from 'lucide-react';

interface PlanFeature {
  name: string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

interface UsageMetric {
  name: string;
  used: number;
  limit: number;
  unit: string;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  period: string;
}

const Subscription = () => {
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState('plans');

  const planFeatures: PlanFeature[] = [
    { name: 'Property Listings Access', basic: '100/month', pro: '1,000/month', enterprise: 'Unlimited' },
    { name: 'Advanced Search Filters', basic: false, pro: true, enterprise: true },
    { name: 'Property Alerts', basic: '5', pro: '50', enterprise: 'Unlimited' },
    { name: 'Saved Searches', basic: '3', pro: '25', enterprise: 'Unlimited' },
    { name: 'Market Analytics', basic: false, pro: true, enterprise: true },
    { name: 'CRM Integration', basic: false, pro: 'Basic', enterprise: 'Advanced' },
    { name: 'Lead Management', basic: false, pro: '500 leads', enterprise: 'Unlimited' },
    { name: 'Custom Reports', basic: false, pro: false, enterprise: true },
    { name: 'API Access', basic: false, pro: 'Limited', enterprise: 'Full' },
    { name: 'White Label Options', basic: false, pro: false, enterprise: true },
    { name: 'Priority Support', basic: false, pro: true, enterprise: true },
    { name: 'Phone Support', basic: false, pro: false, enterprise: true },
    { name: 'Dedicated Account Manager', basic: false, pro: false, enterprise: true }
  ];

  const usageMetrics: UsageMetric[] = [
    { name: 'Property Views', used: 750, limit: 1000, unit: 'views' },
    { name: 'Search Queries', used: 1200, limit: 2000, unit: 'searches' },
    { name: 'Property Alerts', used: 35, limit: 50, unit: 'alerts' },
    { name: 'Saved Searches', used: 18, limit: 25, unit: 'searches' },
    { name: 'API Calls', used: 8500, limit: 10000, unit: 'calls' },
    { name: 'Lead Contacts', used: 320, limit: 500, unit: 'leads' }
  ];

  const billingHistory: BillingHistory[] = [
    {
      id: '1',
      date: '2024-01-01',
      amount: 79,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'January 2024'
    },
    {
      id: '2',
      date: '2023-12-01',
      amount: 79,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'December 2023'
    },
    {
      id: '3',
      date: '2023-11-01',
      amount: 79,
      status: 'paid',
      plan: 'Pro Plan',
      period: 'November 2023'
    },
    {
      id: '4',
      date: '2023-10-01',
      amount: 29,
      status: 'paid',
      plan: 'Basic Plan',
      period: 'October 2023'
    }
  ];

  const getPlanPrice = (plan: 'basic' | 'pro' | 'enterprise', cycle: 'monthly' | 'yearly') => {
    const prices = {
      basic: { monthly: 29, yearly: 290 },
      pro: { monthly: 79, yearly: 790 },
      enterprise: { monthly: 199, yearly: 1990 }
    };
    return prices[plan][cycle];
  };

  const getYearlySavings = (plan: 'basic' | 'pro' | 'enterprise') => {
    const monthly = getPlanPrice(plan, 'monthly') * 12;
    const yearly = getPlanPrice(plan, 'yearly');
    return monthly - yearly;
  };

  const handlePlanChange = (plan: 'basic' | 'pro' | 'enterprise') => {
    if (plan === currentPlan) return;
    
    // In real app, this would integrate with Stripe
    toast.success(`Upgrading to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan...`);
    setCurrentPlan(plan);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success('Invoice downloaded successfully!');
  };

  const PlanCard = ({ 
    plan, 
    title, 
    price, 
    description, 
    features, 
    popular = false,
    current = false 
  }: {
    plan: 'basic' | 'pro' | 'enterprise';
    title: string;
    price: number;
    description: string;
    features: string[];
    popular?: boolean;
    current?: boolean;
  }) => (
    <Card className={`relative ${popular ? 'border-blue-500 shadow-lg' : ''} ${current ? 'ring-2 ring-green-500' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-3 py-1">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      {current && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-600 text-white px-3 py-1">
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          {plan === 'basic' && <Shield className="w-8 h-8 text-blue-600" />}
          {plan === 'pro' && <Zap className="w-8 h-8 text-purple-600" />}
          {plan === 'enterprise' && <Crown className="w-8 h-8 text-yellow-600" />}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="text-3xl font-bold">
          ${price}
          <span className="text-base font-normal text-gray-600">
            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
        {billingCycle === 'yearly' && (
          <div className="text-sm text-green-600 font-medium">
            Save ${getYearlySavings(plan)} per year
          </div>
        )}
        <p className="text-gray-600 text-sm">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          variant={current ? 'outline' : 'default'}
          onClick={() => handlePlanChange(plan)}
          disabled={current}
        >
          {current ? 'Current Plan' : `Upgrade to ${title}`}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription and billing preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Billing Settings
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pro Plan</h3>
                <p className="text-gray-600">Perfect for growing real estate professionals</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${getPlanPrice(currentPlan, billingCycle)}</p>
              <p className="text-sm text-gray-600">per {billingCycle === 'monthly' ? 'month' : 'year'}</p>
              <p className="text-sm text-gray-500">Next billing: Feb 1, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="features">Feature Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <Badge className="ml-2 bg-green-600 text-white text-xs">Save 20%</Badge>
              </Button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlanCard
              plan="basic"
              title="Basic"
              price={getPlanPrice('basic', billingCycle)}
              description="Essential features for individual agents"
              features={[
                '100 property listings per month',
                '5 property alerts',
                '3 saved searches',
                'Basic search filters',
                'Email support'
              ]}
              current={currentPlan === 'basic'}
            />
            
            <PlanCard
              plan="pro"
              title="Pro"
              price={getPlanPrice('pro', billingCycle)}
              description="Advanced tools for serious professionals"
              features={[
                '1,000 property listings per month',
                '50 property alerts',
                '25 saved searches',
                'Advanced search filters',
                'Market analytics',
                'Basic CRM integration',
                '500 lead management',
                'Priority support'
              ]}
              popular={true}
              current={currentPlan === 'pro'}
            />
            
            <PlanCard
              plan="enterprise"
              title="Enterprise"
              price={getPlanPrice('enterprise', billingCycle)}
              description="Complete solution for teams and brokerages"
              features={[
                'Unlimited property listings',
                'Unlimited alerts & searches',
                'Advanced CRM integration',
                'Unlimited lead management',
                'Custom reports & analytics',
                'Full API access',
                'White label options',
                'Phone support',
                'Dedicated account manager'
              ]}
              current={currentPlan === 'enterprise'}
            />
          </div>

          {/* Enterprise Contact */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Need a Custom Solution?</h3>
                  <p className="text-gray-600">Contact our sales team for enterprise pricing and custom features.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Sales
                  </Button>
                  <Button>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {usageMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{metric.name}</h3>
                    <Badge variant="outline">
                      {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                    </Badge>
                  </div>
                  <Progress 
                    value={(metric.used / metric.limit) * 100} 
                    className="h-2 mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{((metric.used / metric.limit) * 100).toFixed(1)}% used</span>
                    <span>{(metric.limit - metric.used).toLocaleString()} remaining</span>
                  </div>
                  {metric.used / metric.limit > 0.8 && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                      <div className="flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        <span>Approaching limit - consider upgrading</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <p className="text-sm text-gray-600">Average monthly usage</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+15%</div>
                  <p className="text-sm text-gray-600">Usage growth this month</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <p className="text-sm text-gray-600">Days until reset</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline">
                  Update Card
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.plan}</p>
                        <p className="text-sm text-gray-600">{invoice.period}</p>
                        <p className="text-sm text-gray-500">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount}</p>
                        <Badge 
                          className={
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Feature</th>
                      <th className="text-center py-3 px-2">
                        <div className="flex flex-col items-center">
                          <Shield className="w-5 h-5 text-blue-600 mb-1" />
                          <span>Basic</span>
                          <span className="text-sm text-gray-500">$29/mo</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-2">
                        <div className="flex flex-col items-center">
                          <Zap className="w-5 h-5 text-purple-600 mb-1" />
                          <span>Pro</span>
                          <span className="text-sm text-gray-500">$79/mo</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-2">
                        <div className="flex flex-col items-center">
                          <Crown className="w-5 h-5 text-yellow-600 mb-1" />
                          <span>Enterprise</span>
                          <span className="text-sm text-gray-500">$199/mo</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {planFeatures.map((feature, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-2 font-medium">{feature.name}</td>
                        <td className="py-3 px-2 text-center">
                          {typeof feature.basic === 'boolean' ? (
                            feature.basic ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.basic}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.pro}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {typeof feature.enterprise === 'boolean' ? (
                            feature.enterprise ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Support Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Support & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">Basic Support</h3>
                  <p className="text-sm text-gray-600">Email support with 24-48 hour response time</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Headphones className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium mb-1">Priority Support</h3>
                  <p className="text-sm text-gray-600">Email & chat support with 2-4 hour response time</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-medium mb-1">Premium Support</h3>
                  <p className="text-sm text-gray-600">Phone, email & chat with dedicated account manager</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Subscription;