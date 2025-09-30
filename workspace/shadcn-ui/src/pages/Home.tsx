import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Home as HomeIcon,
  Building2,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  DollarSign,
  BarChart3,
  Upload,
  LogIn,
  UserPlus
} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Search,
      title: "Smart Property Search",
      description: "Advanced search filters to find your perfect property with AI-powered recommendations."
    },
    {
      icon: Building2,
      title: "Professional Listings",
      description: "High-quality property listings with detailed information and professional photography."
    },
    {
      icon: Users,
      title: "Expert Agents",
      description: "Connect with top-rated real estate professionals in your area."
    },
    {
      icon: TrendingUp,
      title: "Market Analytics",
      description: "Real-time market data and trends to make informed decisions."
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Bank-level security for all your real estate transactions and data."
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Get notified immediately when properties matching your criteria become available."
    }
  ]

  const brokerFeatures = [
    {
      icon: Upload,
      title: "Bulk Upload System",
      description: "Upload hundreds of listings at once with our CSV/Excel import system"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track leads, conversions, and market performance with detailed reports"
    },
    {
      icon: Users,
      title: "Lead Management",
      description: "Comprehensive CRM system to manage and nurture your leads"
    },
    {
      icon: Building2,
      title: "Team Collaboration",
      description: "Manage your team, assign leads, and track performance"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Home Buyer",
      content: "Hatch made finding my dream home so easy. The search filters are incredibly detailed and the agent recommendations were spot on!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Real Estate Broker",
      content: "The broker dashboard has transformed my business. The bulk upload feature saves me hours every week, and the analytics help me make better decisions.",
      rating: 5
    },
    {
      name: "Emily Chen",
      role: "Property Investor",
      content: "The market analytics and instant notifications have given me a competitive edge. I've closed 3 deals this month thanks to Hatch.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Hatch</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/properties')}>
                Properties
              </Button>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button variant="ghost" onClick={() => navigate('/register')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
              <Button onClick={() => navigate('/broker/pricing')}>
                Broker Portal
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Your Perfect Property with 
              <span className="text-blue-600"> Hatch</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The most advanced real estate platform connecting buyers, sellers, and professionals. 
              Find your dream home or grow your real estate business with powerful tools and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/properties')}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Properties
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/broker/pricing')}
                className="text-lg px-8 py-3"
              >
                <Building2 className="w-5 h-5 mr-2" />
                For Brokers
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Hatch?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the most comprehensive real estate platform with cutting-edge technology 
              and user-friendly design to make your property journey seamless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Broker Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Supercharge Your Real Estate Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful brokers and agents who use Hatch to manage listings, 
              generate leads, and close more deals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                {brokerFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button 
                  size="lg"
                  onClick={() => navigate('/broker/pricing')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  View Pricing Plans
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Success Stories
              </h3>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="text-gray-600 italic mb-2">
                    "Hatch increased my lead conversion rate by 40% in just 3 months. 
                    The analytics dashboard shows me exactly where my best leads come from."
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    - Jennifer Martinez, Top Producer
                  </p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-gray-600 italic mb-2">
                    "The bulk upload feature is a game-changer. I can now manage 500+ listings 
                    efficiently and focus on what matters most - closing deals."
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    - Robert Kim, Brokerage Owner
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who found their perfect match with Hatch
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Next Hatch?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have found their perfect property or grown their business with Hatch. 
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/properties')}
              className="text-lg px-8 py-3"
            >
              <Search className="w-5 h-5 mr-2" />
              Start Searching
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="text-lg px-8 py-3 bg-white text-blue-600 border-white hover:bg-blue-50 hover:text-blue-700"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <HomeIcon className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-bold">Hatch</span>
              </div>
              <p className="text-gray-400">
                Find Your Next Hatch. The most advanced real estate platform for buyers, sellers, and professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/properties')}>Search Properties</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/register')}>Create Account</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">Mortgage Calculator</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">Neighborhood Guide</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/broker/pricing')}>Pricing Plans</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/login')}>Broker Login</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">API Documentation</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">Support Center</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">About Us</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">Careers</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">Privacy Policy</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto">Terms of Service</Button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}