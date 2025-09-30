import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, Bed, Bath, Square, Trash2 } from 'lucide-react'

export default function CustomerFavorites() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Properties you've saved for later</p>
        </div>

        {/* Favorites List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-500">Property Image</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </Button>
            </div>
            
            <CardHeader>
              <CardTitle className="text-lg">Family Home in Coral Gables</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Coral Gables
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-4">
                $750,000
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  4 beds
                </span>
                <span className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  3 baths
                </span>
                <span className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  2400 sqft
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1">View Details</Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}