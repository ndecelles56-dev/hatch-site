import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MLSProperty } from '@/types/MLSProperty'
import {
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Building,
  Car,
  Thermometer,
  Droplets,
  ExternalLink,
  ImageIcon
} from 'lucide-react'

interface PropertyPreviewProps {
  property: MLSProperty | null
  isOpen: boolean
  onClose: () => void
}

function PropertyPreview({ property, isOpen, onClose }: PropertyPreviewProps) {
  if (!property) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFullAddress = () => {
    const parts = [
      property.streetNumber,
      property.streetName,
      property.streetSuffix
    ].filter(Boolean).join(' ')
    
    return `${parts}, ${property.city}, ${property.state} ${property.zipCode}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Property Preview
          </DialogTitle>
          <DialogDescription>
            Review the listing details before sharing with clients or publishing to the MLS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(property.listPrice)}
                </h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-lg">{getFullAddress()}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>MLS# {property.id}</span>
                  <span>Listed {formatDate(property.listingDate)}</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {property.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Bed className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{property.bedrooms}</span>
                <span className="text-gray-600">Bedrooms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{property.bathrooms}</span>
                <span className="text-gray-600">Bathrooms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Square className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{property.livingAreaSqFt?.toLocaleString()}</span>
                <span className="text-gray-600">Sq Ft</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{property.yearBuilt}</span>
                <span className="text-gray-600">Built</span>
              </div>
            </div>
          </div>

          {/* Photos Section */}
          {property.photos && property.photos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Photos ({property.photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.photos.slice(0, 6).map((photo, index) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              {property.photos.length > 6 && (
                <p className="text-sm text-gray-500 mt-2">
                  +{property.photos.length - 6} more photos
                </p>
              )}
            </div>
          )}

          {/* Description */}
          {property.publicRemarks && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {property.publicRemarks}
              </p>
            </div>
          )}

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Property Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type:</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                {property.propertySubType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtype:</span>
                    <span className="font-medium">{property.propertySubType}</span>
                  </div>
                )}
                {property.stories && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stories:</span>
                    <span className="font-medium">{property.stories}</span>
                  </div>
                )}
                {property.garageSpaces && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Garage Spaces:</span>
                    <span className="font-medium">{property.garageSpaces}</span>
                  </div>
                )}
                {property.garageType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Garage Type:</span>
                    <span className="font-medium">{property.garageType}</span>
                  </div>
                )}
                {property.lotSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lot Size:</span>
                    <span className="font-medium">{property.lotSize.toLocaleString()} sq ft</span>
                  </div>
                )}
                {property.lotSizeAcres && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lot Size (Acres):</span>
                    <span className="font-medium">{property.lotSizeAcres.toLocaleString()}</span>
                  </div>
                )}
                {property.county && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">County:</span>
                    <span className="font-medium">{property.county}</span>
                  </div>
                )}
                {property.subdivision && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subdivision:</span>
                    <span className="font-medium">{property.subdivision}</span>
                  </div>
                )}
                {property.architecturalStyle && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Architectural Style:</span>
                    <span className="font-medium">{property.architecturalStyle}</span>
                  </div>
                )}
                {property.latitude !== undefined && property.latitude !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latitude:</span>
                    <span className="font-medium">{property.latitude.toFixed(6)}</span>
                  </div>
                )}
                {property.longitude !== undefined && property.longitude !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Longitude:</span>
                    <span className="font-medium">{property.longitude.toFixed(6)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial & Systems */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial & Systems
              </h3>
              <div className="space-y-2 text-sm">
                {property.originalListPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-medium">{formatPrice(property.originalListPrice)}</span>
                  </div>
                )}
                {property.taxes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Taxes:</span>
                    <span className="font-medium">{formatPrice(property.taxes)}</span>
                  </div>
                )}
                {property.heatingType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heating:</span>
                    <span className="font-medium">{property.heatingType}</span>
                  </div>
                )}
                {property.coolingType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cooling:</span>
                    <span className="font-medium">{property.coolingType}</span>
                  </div>
                )}
                {property.pool && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pool:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agent Information */}
          {property.listingAgentName && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Listing Agent
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    {property.listingAgentName}
                  </div>
                  {property.listingAgentLicense && (
                    <div className="text-gray-600 mb-2">
                      License: {property.listingAgentLicense}
                    </div>
                  )}
                  {property.brokerage && (
                    <div className="flex items-center text-gray-600">
                      <Building className="w-4 h-4 mr-1" />
                      {property.brokerage}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  {property.listingAgentPhone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {property.listingAgentPhone}
                    </div>
                  )}
                  {property.listingAgentEmail && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {property.listingAgentEmail}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Virtual Tour */}
          {property.virtualTourUrl && (
            <div>
              <Button asChild className="w-full">
                <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Virtual Tour
                </a>
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PropertyPreview
