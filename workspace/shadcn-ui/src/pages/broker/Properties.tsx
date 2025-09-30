import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useBroker } from '@/contexts/BrokerContext'
import { MLSProperty } from '@/types/MLSProperty'
import BulkUpload from '@/components/BulkUpload'
import PropertyPreview from '@/components/PropertyPreview'
import {
  Building2,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Calendar,
  Users,
  Phone,
  Mail,
  Star,
  MoreHorizontal,
  Upload,
  Plus,
  User,
  Building,
  Car,
  Home,
  ImageIcon
} from 'lucide-react'

export default function Properties() {
  const { properties, leads, addProperty, updateProperty, deleteProperty } = useBroker()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<MLSProperty | null>(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [showPropertyPreview, setShowPropertyPreview] = useState(false)
  const [previewProperty, setPreviewProperty] = useState<MLSProperty | null>(null)

  // Filter properties based on search term with proper null checks
  const filteredProperties = properties.filter(property => {
    const address = `${property.streetNumber || ''} ${property.streetName || ''} ${property.streetSuffix || ''}, ${property.city || ''}, ${property.state || ''} ${property.zipCode || ''}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    
    return address.includes(searchLower) ||
           (property.listingAgentName || '').toLowerCase().includes(searchLower) ||
           (property.propertyType || '').toLowerCase().includes(searchLower) ||
           (property.publicRemarks || '').toLowerCase().includes(searchLower)
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sold': return 'bg-blue-100 text-blue-800'
      case 'withdrawn': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get leads for a specific property
  const getPropertyLeads = (propertyId: string) => {
    return leads.filter(lead => lead.propertyId === propertyId)
  }

  const handleBulkUploadComplete = (draftListings: any[]) => {
    // Convert draft listings to properties and add them
    draftListings.forEach(draft => {
      const property = {
        title: `${draft.mappedData.streetNumber || ''} ${draft.mappedData.streetName || ''} ${draft.mappedData.streetSuffix || ''}`.trim(),
        address: `${draft.mappedData.streetNumber || ''} ${draft.mappedData.streetName || ''} ${draft.mappedData.streetSuffix || ''}, ${draft.mappedData.city || ''}, ${draft.mappedData.state || ''} ${draft.mappedData.zipCode || ''}`.trim(),
        price: draft.mappedData.listPrice || 0,
        status: draft.status === 'ready' ? 'active' : 'draft' as 'active' | 'pending' | 'sold' | 'draft',
        type: 'residential' as 'residential' | 'commercial' | 'land',
        bedrooms: draft.mappedData.bedrooms || 0,
        bathrooms: draft.mappedData.bathrooms || 0,
        sqft: draft.mappedData.livingAreaSqFt || 0,
        listingDate: new Date().toISOString().split('T')[0],
        photos: draft.photos || [],
        description: draft.mappedData.publicRemarks || '',
        agentId: 'agent1', // Default agent
        leadCount: 0,
        viewCount: 0,
        favoriteCount: 0
      }
      addProperty(property)
    })
    
    setShowBulkUpload(false)
    
    // Show success message
    alert(`Successfully imported ${draftListings.length} properties!`)
  }

  const handlePreview = (property: MLSProperty) => {
    setPreviewProperty(property)
    setShowPropertyPreview(true)
  }

  const handleEdit = (property: MLSProperty) => {
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      deleteProperty(id)
    }
  }

  const getFullAddress = (property: MLSProperty) => {
    const parts = [
      property.streetNumber,
      property.streetName,
      property.streetSuffix
    ].filter(Boolean).join(' ')
    
    return `${parts}, ${property.city}, ${property.state} ${property.zipCode}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600">Manage your published property listings and track performance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Upload Properties</DialogTitle>
                  <DialogDescription>
                    Upload multiple property listings using CSV or Excel files
                  </DialogDescription>
                </DialogHeader>
                <BulkUpload 
                  onUploadComplete={handleBulkUploadComplete}
                  maxListings={100}
                />
              </DialogContent>
            </Dialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{filteredProperties.length} properties</span>
            <span>•</span>
            <span>{properties.filter(p => p.status === 'active').length} active</span>
            <span>•</span>
            <span>{properties.filter(p => p.status === 'pending').length} pending</span>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const propertyLeads = getPropertyLeads(property.id)
            
            return (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Property Image */}
                <div className="aspect-video bg-gray-200 relative">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[0]}
                      alt={`${property.streetNumber} ${property.streetName} ${property.streetSuffix}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Hidden fallback for broken images */}
                  <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={getStatusColor(property.status)}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-lg font-bold text-gray-900">
                      {formatPrice(property.listPrice)}
                    </div>
                  </div>

                  {/* Photo Count */}
                  {property.photos && property.photos.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/60 text-white px-2 py-1 rounded text-sm flex items-center">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {property.photos.length}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Property Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {property.streetNumber} {property.streetName} {property.streetSuffix}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">{getFullAddress(property)}</span>
                      </div>
                    </div>

                    {/* Property Features */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span>{property.bedrooms || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span>{property.bathrooms || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        <span>{property.livingAreaSqFt?.toLocaleString() || 0} sq ft</span>
                      </div>
                    </div>

                    {/* Additional Property Info */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>🏠 {property.propertyType}</span>
                        <span>🏗️ Built {property.yearBuilt}</span>
                      </div>
                      {property.garageSpaces && (
                        <div className="flex items-center">
                          <Car className="w-3 h-3 mr-1" />
                          <span>{property.garageSpaces} car garage</span>
                        </div>
                      )}
                      {property.lotSize && (
                        <div>📐 Lot: {property.lotSize.toLocaleString()} sq ft</div>
                      )}
                    </div>

                    {/* Agent Information */}
                    {property.listingAgentName && (
                      <div className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <User className="w-3 h-3 mr-1" />
                          <span className="font-medium">{property.listingAgentName}</span>
                        </div>
                        {property.brokerage && (
                          <div className="flex items-center text-gray-600 mt-1">
                            <Building className="w-3 h-3 mr-1" />
                            <span className="text-xs">{property.brokerage}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Performance Metrics */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{property.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{propertyLeads.length}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          <span>{property.favoriteCount || 0}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Listed {formatDate(property.listingDate)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEdit(property)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handlePreview(property)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>

                    {/* Delete Button */}
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Property
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No properties found' : 'No published properties yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'Publish draft listings or upload new properties to get started'
              }
            </p>
            {!searchTerm && (
              <div className="flex justify-center gap-3">
                <Button onClick={() => setShowBulkUpload(true)} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload Properties
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Property Preview Dialog */}
        <PropertyPreview
          property={previewProperty}
          isOpen={showPropertyPreview}
          onClose={() => {
            setShowPropertyPreview(false)
            setPreviewProperty(null)
          }}
        />
      </div>
    </div>
  )
}