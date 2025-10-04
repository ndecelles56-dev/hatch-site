import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Heart, MapPin, Bed, Bath, Square } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Database } from '@/types/database'
import { searchConsumerProperties } from '@/lib/api/properties'

type ConsumerProperty = ConsumerPropertyRow

const PLACEHOLDER_IMAGE = '/api/placeholder/300/200'

export default function CustomerProperties() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<ConsumerProperty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await searchConsumerProperties({ limit: 100 })
        setProperties(data)
      } catch (fetchError) {
        console.error('Failed to load consumer properties', fetchError)
        setError('Unable to load properties right now. Please try again shortly.')
        setProperties([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadProperties()
  }, [])

  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties
    const term = searchTerm.toLowerCase()
    return properties.filter((property) => {
      const addressParts = [
        property.street_number,
        property.street_name,
        property.street_suffix,
        property.city,
        property.state_code,
        property.zip_code
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const remarks = (property.public_remarks ?? '').toLowerCase()
      const propertyType = (property.property_type ?? '').toLowerCase()

      return (
        addressParts.includes(term) ||
        remarks.includes(term) ||
        propertyType.includes(term)
      )
    })
  }, [properties, searchTerm])

  const formatPrice = (price?: number | null) => {
    if (!price || Number.isNaN(price)) return 'Contact for pricing'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatCount = (value?: number | null, label?: string) => {
    if (value == null) return label ? `0 ${label}` : 'N/A'
    return `${Number(value).toLocaleString()}${label ? ` ${label}` : ''}`
  }

  const primaryPhoto = (photos?: string[] | null) => {
    if (!photos || photos.length === 0) return PLACEHOLDER_IMAGE
    const valid = photos.find((url) => /^https?:\/\//i.test(url))
    return valid ?? PLACEHOLDER_IMAGE
  }

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
                <Input
                  placeholder="Search by location, property type..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button onClick={() => setSearchTerm((prev) => prev.trim())}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="text-center text-gray-600">Loading properties…</div>
        )}

        {error && !isLoading && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!isLoading && !error && filteredProperties.length === 0 && (
          <div className="text-center text-gray-600">
            No properties found. Try adjusting your search.
          </div>
        )}

        {!isLoading && !error && filteredProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => {
              const address = [
                property.street_number,
                property.street_name,
                property.street_suffix,
                property.city,
                property.state_code,
                property.zip_code
              ].filter(Boolean).join(' ')

              return (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={primaryPhoto(property.photos)}
                      alt={address || 'Property photo'}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      title="Save to favorites (coming soon)"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg truncate">
                      {property.property_type || 'Property'}
                    </CardTitle>
                    <CardDescription className="flex items-center truncate">
                      <MapPin className="h-4 w-4 mr-1" />
                      {address || 'Address coming soon'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-4">
                      {formatPrice(property.list_price)}
                    </div>

                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {formatCount(property.bedrooms_total, 'beds')}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {formatCount(property.bathrooms_total ?? property.bathrooms_full, 'baths')}
                      </span>
                      <span className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {formatCount(property.living_area_sq_ft, 'sq ft')}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate(`/customer/properties/${property.slug || property.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
