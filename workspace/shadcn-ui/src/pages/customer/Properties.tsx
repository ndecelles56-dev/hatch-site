import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Heart, MapPin, Bed, Bath, Square } from 'lucide-react'

const mockProperties = [
  {
    id: 1,
    title: "Modern Downtown Condo",
    price: 450000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    location: "Downtown Miami",
    image: "/api/placeholder/300/200",
    favorite: false
  },
  {
    id: 2,
    title: "Family Home in Coral Gables",
    price: 750000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    location: "Coral Gables",
    image: "/api/placeholder/300/200",
    favorite: true
  },
  {
    id: 3,
    title: "Luxury Waterfront Villa",
    price: 1200000,
    beds: 5,
    baths: 4,
    sqft: 3500,
    location: "Key Biscayne",
    image: "/api/placeholder/300/200",
    favorite: false
  }
]

export default function CustomerProperties() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Home</h1>
          <p className="text-gray-600">Browse our extensive collection of properties</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by location, property type..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500">Property Image</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <Heart className={`h-4 w-4 ${property.favorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-4">
                  ${property.price.toLocaleString()}
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.beds} beds
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.baths} baths
                  </span>
                  <span className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    {property.sqft} sqft
                  </span>
                </div>
                
                <Button className="w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}