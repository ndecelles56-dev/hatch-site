import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Heart, 
  MessageSquare, 
  Search,
  MapPin,
  Calendar,
  Bell,
  User
} from 'lucide-react'

export default function CustomerDashboard() {
  const recentSearches = [
    { location: 'Miami Beach, FL', type: 'Condo', priceRange: '$300K - $500K' },
    { location: 'Coral Gables, FL', type: 'House', priceRange: '$600K - $800K' },
    { location: 'Aventura, FL', type: 'Townhouse', priceRange: '$400K - $600K' }
  ]

  const savedProperties = [
    { id: 1, address: '123 Ocean Drive', price: '$450,000', type: 'Condo', bedrooms: 2, bathrooms: 2 },
    { id: 2, address: '456 Coral Way', price: '$750,000', type: 'House', bedrooms: 3, bathrooms: 3 },
    { id: 3, address: '789 Biscayne Blvd', price: '$520,000', type: 'Townhouse', bedrooms: 2, bathrooms: 2.5 }
  ]

  const recentInquiries = [
    { property: '123 Ocean Drive', agent: 'Sarah Johnson', status: 'Pending', date: '2024-01-15' },
    { property: '456 Coral Way', agent: 'Mike Rodriguez', status: 'Responded', date: '2024-01-14' },
    { property: '789 Biscayne Blvd', agent: 'Lisa Chen', status: 'Scheduled', date: '2024-01-13' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Track your property searches, favorites, and inquiries</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Search Properties</h3>
              <p className="text-sm text-gray-600">Find your dream home</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Saved Properties</h3>
              <p className="text-sm text-gray-600">{savedProperties.length} properties saved</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Inquiries</h3>
              <p className="text-sm text-gray-600">{recentInquiries.length} active inquiries</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Profile</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Recent Searches
              </CardTitle>
              <CardDescription>Your latest property searches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSearches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center mb-1">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium">{search.location}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {search.type} • {search.priceRange}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Search Again
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Saved Properties
              </CardTitle>
              <CardDescription>Properties you've favorited</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium mb-1">{property.address}</div>
                      <div className="text-sm text-gray-600">
                        {property.type} • {property.bedrooms}bd {property.bathrooms}ba
                      </div>
                      <div className="text-lg font-bold text-green-600">{property.price}</div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Saved Properties
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Recent Inquiries
            </CardTitle>
            <CardDescription>Track your property inquiries and agent responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInquiries.map((inquiry, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Home className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{inquiry.property}</span>
                      <Badge 
                        variant={inquiry.status === 'Responded' ? 'default' : inquiry.status === 'Scheduled' ? 'secondary' : 'outline'}
                      >
                        {inquiry.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Agent: {inquiry.agent} • {inquiry.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Inquiries
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Stay updated on your property interests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Bell className="h-4 w-4 text-blue-500 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">New property match found!</div>
                  <div className="text-sm text-gray-600">3 new properties match your Miami Beach search criteria</div>
                </div>
                <Button size="sm">View</Button>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <MessageSquare className="h-4 w-4 text-green-500 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">Agent responded to your inquiry</div>
                  <div className="text-sm text-gray-600">Sarah Johnson replied about 123 Ocean Drive</div>
                </div>
                <Button size="sm">Reply</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}