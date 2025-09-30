import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Filter,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
  Users
} from 'lucide-react'

export default function BrokerListings() {
  const [searchTerm, setSearchTerm] = useState('')

  const listings = [
    {
      id: 1,
      title: "Luxury Waterfront Villa",
      address: "123 Ocean Drive, Miami Beach",
      price: 2500000,
      listingDate: "2024-01-15",
      views: 245,
      inquiries: 18,
      status: "Active",
      daysOnMarket: 45
    },
    {
      id: 2,
      title: "Modern Downtown Condo",
      address: "456 Biscayne Blvd, Miami",
      price: 750000,
      listingDate: "2024-01-20",
      views: 189,
      inquiries: 12,
      status: "Pending",
      daysOnMarket: 40
    },
    {
      id: 3,
      title: "Charming Coral Gables Home",
      address: "789 Valencia Ave, Coral Gables",
      price: 850000,
      listingDate: "2024-01-10",
      views: 156,
      inquiries: 8,
      status: "Under Contract",
      daysOnMarket: 50
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Under Contract': return 'bg-blue-100 text-blue-800'
      case 'Sold': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Listings</h1>
            <p className="text-gray-600">Monitor and manage your property listings</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Listing
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold">1,245</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inquiries</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <MessageSquare className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Days on Market</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search listings by title or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Performance</CardTitle>
            <CardDescription>Track views, inquiries, and market performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <Badge className={getStatusColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{listing.address}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Listed: {formatDate(listing.listingDate)}</span>
                        <span>{listing.daysOnMarket} days on market</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {formatPrice(listing.price)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {listing.views} views
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {listing.inquiries} inquiries
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or create a new listing.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Listing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}