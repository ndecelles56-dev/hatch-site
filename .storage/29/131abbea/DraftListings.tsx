import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useBroker } from '@/contexts/BrokerContext'
import { MLSProperty } from '@/types/MLSProperty'
import BulkListingUpload from '@/components/upload/BulkListingUpload'
import PhotoUpload from '@/components/PhotoUpload'
import PropertyPreview from '@/components/PropertyPreview'
import {
  FileText,
  Edit,
  Trash2,
  Eye,
  Upload,
  Plus,
  Filter,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  MapPin,
  Home,
  DollarSign,
  User,
  FileImage,
  Settings,
  Check
} from 'lucide-react'

export default function DraftListings() {
  const { getDraftProperties, updateProperty, deleteProperty, publishDraftProperty, addDraftProperties } = useBroker()
  const [editingProperty, setEditingProperty] = useState<MLSProperty | null>(null)
  const [previewProperty, setPreviewProperty] = useState<MLSProperty | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [selectedListings, setSelectedListings] = useState<string[]>([])
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const draftListings = getDraftProperties()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'review': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
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

  const validateProperty = (property: MLSProperty) => {
    const errors: string[] = []
    
    // Required fields validation
    const requiredFields = [
      { field: 'listPrice', name: 'List Price', value: property.listPrice },
      { field: 'yearBuilt', name: 'Year Built', value: property.yearBuilt },
      { field: 'lotSize', name: 'Lot Size', value: property.lotSize },
      // Location fields (ALL REQUIRED)
      { field: 'streetNumber', name: 'Street Number', value: property.streetNumber },
      { field: 'streetName', name: 'Street Name', value: property.streetName },
      { field: 'streetSuffix', name: 'Street Suffix', value: property.streetSuffix },
      { field: 'city', name: 'City', value: property.city },
      { field: 'state', name: 'State', value: property.state },
      { field: 'zipCode', name: 'ZIP Code', value: property.zipCode },
      { field: 'county', name: 'County', value: property.county },
      // Property details
      { field: 'bedrooms', name: 'Bedrooms', value: property.bedrooms },
      { field: 'bathrooms', name: 'Bathrooms', value: property.bathrooms },
      { field: 'livingAreaSqFt', name: 'Living Area', value: property.livingAreaSqFt },
      { field: 'propertyType', name: 'Property Type', value: property.propertyType },
      // Agent info
      { field: 'listingAgentName', name: 'Listing Agent Name', value: property.listingAgentName },
      { field: 'listingAgentLicense', name: 'Agent License', value: property.listingAgentLicense },
      { field: 'listingAgentPhone', name: 'Agent Phone', value: property.listingAgentPhone },
      { field: 'brokerage', name: 'Brokerage', value: property.brokerage }
    ]

    requiredFields.forEach(({ field, name, value }) => {
      if (!value || value === '' || value === 0) {
        errors.push(`${name} is required`)
      }
    })

    // Photo validation - minimum 4 photos required
    if (!property.photos || property.photos.length < 4) {
      errors.push(`Minimum 4 photos required (currently have ${property.photos?.length || 0})`)
    }

    return errors
  }

  const calculateCompletionPercentage = (property: MLSProperty) => {
    const errors = validateProperty(property)
    const totalRequiredFields = 18 + 1 // 18 required fields + photo requirement
    const completedFields = totalRequiredFields - errors.length
    return Math.round((completedFields / totalRequiredFields) * 100)
  }

  const handleEdit = (property: MLSProperty) => {
    setEditingProperty({ ...property })
    setShowEditDialog(true)
  }

  const handlePreview = (property: MLSProperty) => {
    setPreviewProperty(property)
    setShowPreviewDialog(true)
  }

  const handleSaveEdit = () => {
    if (editingProperty) {
      const errors = validateProperty(editingProperty)
      const completionPercentage = calculateCompletionPercentage(editingProperty)
      
      const updatedProperty = {
        ...editingProperty,
        completionPercentage,
        validationErrors: errors.map(error => ({
          field: error.split(' is ')[0].toLowerCase().replace(/\s+/g, ''),
          message: error,
          severity: 'error' as const
        })),
        lastModified: new Date().toISOString()
      }
      
      updateProperty(editingProperty.id, updatedProperty)
      setShowEditDialog(false)
      setEditingProperty(null)
    }
  }

  const handlePublish = async (id: string) => {
    const property = draftListings.find(p => p.id === id)
    if (!property) return

    const errors = validateProperty(property)
    if (errors.length > 0) {
      alert(`Cannot publish listing. Please fix the following issues:\n\n${errors.join('\n')}`)
      return
    }

    if (confirm('Are you sure you want to publish this listing? It will become active and visible to customers.')) {
      setPublishingId(id)
      
      try {
        publishDraftProperty(id)
        
        // Show success message
        setTimeout(() => {
          alert('Property published successfully! You can now view it in the Properties section.')
          setPublishingId(null)
        }, 500)
      } catch (error) {
        console.error('Error publishing property:', error)
        alert('Error publishing property. Please try again.')
        setPublishingId(null)
      }
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this draft listing? This action cannot be undone.')) {
      deleteProperty(id)
    }
  }

  const handleBulkUploadComplete = (draftListing: any) => {
    console.log('📥 Received draft listing from enhanced upload:', draftListing)
    
    // Convert the enhanced draft listing format to our MLSProperty format
    const convertedProperties = draftListing.data.map((record: any, index: number) => {
      // Map the enhanced field mappings to our property structure
      const mappedProperty: Partial<MLSProperty> = {
        id: `${draftListing.id}_${index}`,
        status: 'draft',
        createdAt: draftListing.uploadDate,
        lastModified: draftListing.uploadDate,
        completionPercentage: draftListing.completionPercentage || 0,
        validationErrors: draftListing.validationErrors || []
      }

      // Apply field mappings from the enhanced system
      draftListing.fieldMapping.forEach((mapping: any) => {
        const value = record[mapping.inputField]
        if (value !== undefined && value !== null && value !== '') {
          // Map to our property structure based on MLS standard names
          switch (mapping.mlsField.standardName) {
            case 'MLSNumber':
              mappedProperty.mlsNumber = String(value)
              break
            case 'ListPrice':
              mappedProperty.listPrice = Number(value) || 0
              break
            case 'OriginalListPrice':
              mappedProperty.originalListPrice = Number(value)
              break
            case 'PropertyType':
              mappedProperty.propertyType = String(value)
              break
            case 'PropertySubType':
              mappedProperty.propertySubType = String(value)
              break
            case 'ArchitecturalStyle':
              mappedProperty.architecturalStyle = String(value)
              break
            case 'YearBuilt':
              mappedProperty.yearBuilt = Number(value) || 0
              break
            case 'LivingArea':
              mappedProperty.livingAreaSqFt = Number(value) || 0
              break
            case 'BedroomsTotal':
              mappedProperty.bedrooms = Number(value) || 0
              break
            case 'BathroomsFull':
              mappedProperty.bathrooms = Number(value) || 0
              break
            case 'BathroomsHalf':
              mappedProperty.bathroomsHalf = Number(value) || 0
              break
            case 'StoriesTotal':
              mappedProperty.stories = Number(value)
              break
            case 'StreetNumber':
              mappedProperty.streetNumber = String(value)
              break
            case 'StreetName':
              mappedProperty.streetName = String(value)
              break
            case 'StreetSuffix':
              mappedProperty.streetSuffix = String(value)
              break
            case 'City':
              mappedProperty.city = String(value)
              break
            case 'StateOrProvince':
              mappedProperty.state = String(value)
              break
            case 'PostalCode':
              mappedProperty.zipCode = String(value)
              break
            case 'County':
              mappedProperty.county = String(value)
              break
            case 'SubdivisionName':
              mappedProperty.subdivision = String(value)
              break
            case 'LotSizeSqFt':
              mappedProperty.lotSize = Number(value) || 0
              break
            case 'GarageSpaces':
              mappedProperty.garageSpaces = Number(value)
              break
            case 'TaxesAnnual':
              mappedProperty.taxes = Number(value)
              break
            case 'TaxYear':
              mappedProperty.taxYear = Number(value)
              break
            case 'AssociationFee':
              mappedProperty.hoaFee = Number(value)
              break
            case 'ListingAgentFullName':
              mappedProperty.listingAgentName = String(value)
              break
            case 'ListingAgentLicense':
              mappedProperty.listingAgentLicense = String(value)
              break
            case 'ListingAgentPhone':
              mappedProperty.listingAgentPhone = String(value)
              break
            case 'ListingAgentEmail':
              mappedProperty.listingAgentEmail = String(value)
              break
            case 'ListingOfficeName':
              mappedProperty.brokerage = String(value)
              break
            case 'ListingOfficeLicense':
              mappedProperty.brokerageLicense = String(value)
              break
            case 'PhotoURLs':
              if (typeof value === 'string') {
                mappedProperty.photos = value.split(',').map(url => url.trim()).filter(url => url)
              }
              break
            case 'PublicRemarks':
              mappedProperty.publicRemarks = String(value)
              break
            case 'BrokerRemarks':
              mappedProperty.brokerRemarks = String(value)
              break
            case 'ShowingInstructions':
              mappedProperty.showingInstructions = String(value)
              break
            // Enhanced feature fields
            case 'Flooring':
              mappedProperty.flooring = String(value)
              break
            case 'PoolFeatures':
              mappedProperty.poolFeatures = String(value)
              break
            case 'FireplaceFeatures':
              mappedProperty.fireplaceFeatures = String(value)
              break
            case 'KitchenFeatures':
              mappedProperty.kitchenFeatures = String(value)
              break
            case 'PrimarySuite':
              mappedProperty.primarySuite = String(value)
              break
            case 'LaundryFeatures':
              mappedProperty.laundryFeatures = String(value)
              break
            case 'ConstructionMaterials':
              mappedProperty.constructionMaterials = String(value)
              break
            case 'Roof':
              mappedProperty.roofType = String(value)
              break
            case 'FoundationDetails':
              mappedProperty.foundationDetails = String(value)
              break
            case 'ExteriorFeatures':
              mappedProperty.exteriorFeatures = String(value)
              break
            case 'View':
              mappedProperty.propertyView = String(value)
              break
            case 'WaterSource':
              mappedProperty.waterSource = String(value)
              break
            case 'Sewer':
              mappedProperty.sewerSystem = String(value)
              break
            case 'HeatingType':
              mappedProperty.heatingType = String(value)
              break
            case 'CoolingType':
              mappedProperty.coolingType = String(value)
              break
          }
        }
      })

      // Ensure required fields have defaults
      return {
        id: mappedProperty.id || `draft_${Date.now()}_${index}`,
        mlsNumber: mappedProperty.mlsNumber || '',
        status: 'draft',
        listPrice: mappedProperty.listPrice || 0,
        originalListPrice: mappedProperty.originalListPrice,
        propertyType: mappedProperty.propertyType || '',
        propertySubType: mappedProperty.propertySubType,
        architecturalStyle: mappedProperty.architecturalStyle,
        yearBuilt: mappedProperty.yearBuilt || 0,
        livingAreaSqFt: mappedProperty.livingAreaSqFt || 0,
        bedrooms: mappedProperty.bedrooms || 0,
        bathrooms: mappedProperty.bathrooms || 0,
        bathroomsHalf: mappedProperty.bathroomsHalf,
        stories: mappedProperty.stories,
        streetNumber: mappedProperty.streetNumber || '',
        streetName: mappedProperty.streetName || '',
        streetSuffix: mappedProperty.streetSuffix || '',
        city: mappedProperty.city || '',
        state: mappedProperty.state || '',
        zipCode: mappedProperty.zipCode || '',
        county: mappedProperty.county || '',
        subdivision: mappedProperty.subdivision,
        lotSize: mappedProperty.lotSize || 0,
        garageSpaces: mappedProperty.garageSpaces,
        taxes: mappedProperty.taxes,
        taxYear: mappedProperty.taxYear,
        hoaFee: mappedProperty.hoaFee,
        listingAgentName: mappedProperty.listingAgentName || '',
        listingAgentLicense: mappedProperty.listingAgentLicense || '',
        listingAgentPhone: mappedProperty.listingAgentPhone || '',
        listingAgentEmail: mappedProperty.listingAgentEmail,
        brokerage: mappedProperty.brokerage || '',
        brokerageLicense: mappedProperty.brokerageLicense,
        photos: mappedProperty.photos || [],
        publicRemarks: mappedProperty.publicRemarks,
        brokerRemarks: mappedProperty.brokerRemarks,
        showingInstructions: mappedProperty.showingInstructions,
        // Enhanced feature fields
        flooring: mappedProperty.flooring,
        poolFeatures: mappedProperty.poolFeatures,
        fireplaceFeatures: mappedProperty.fireplaceFeatures,
        kitchenFeatures: mappedProperty.kitchenFeatures,
        primarySuite: mappedProperty.primarySuite,
        laundryFeatures: mappedProperty.laundryFeatures,
        constructionMaterials: mappedProperty.constructionMaterials,
        roofType: mappedProperty.roofType,
        foundationDetails: mappedProperty.foundationDetails,
        exteriorFeatures: mappedProperty.exteriorFeatures,
        propertyView: mappedProperty.propertyView,
        waterSource: mappedProperty.waterSource,
        sewerSystem: mappedProperty.sewerSystem,
        heatingType: mappedProperty.heatingType,
        coolingType: mappedProperty.coolingType,
        createdAt: mappedProperty.createdAt || new Date().toISOString(),
        lastModified: mappedProperty.lastModified || new Date().toISOString(),
        completionPercentage: mappedProperty.completionPercentage || 0,
        validationErrors: mappedProperty.validationErrors || []
      } as MLSProperty
    })

    console.log('🔄 Converted properties with enhanced fields:', convertedProperties)
    
    const newProperties = addDraftProperties(convertedProperties)
    setShowBulkUpload(false)
    alert(`Successfully imported ${newProperties.length} properties with enhanced field mapping!\n\nDetected fields: ${draftListing.fieldMapping.map((m: any) => m.mlsField.standardName).join(', ')}`)
  }

  const updateEditingProperty = (field: keyof MLSProperty, value: any) => {
    if (editingProperty) {
      setEditingProperty({
        ...editingProperty,
        [field]: value
      })
    }
  }

  const handlePhotosChange = (photos: string[]) => {
    if (editingProperty) {
      setEditingProperty({
        ...editingProperty,
        photos
      })
    }
  }

  // Bulk selection functions
  const handleSelectListing = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedListings([...selectedListings, id])
    } else {
      setSelectedListings(selectedListings.filter(listingId => listingId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(draftListings.map(listing => listing.id))
    } else {
      setSelectedListings([])
    }
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = () => {
    selectedListings.forEach(id => {
      deleteProperty(id)
    })
    setSelectedListings([])
    setShowBulkDeleteConfirm(false)
  }

  const isAllSelected = selectedListings.length === draftListings.length && draftListings.length > 0
  const isIndeterminate = selectedListings.length > 0 && selectedListings.length < draftListings.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Draft Listings</h1>
          <p className="text-gray-600">Manage your property listings in progress ({draftListings.length} drafts)</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setShowBulkUpload(true)} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Enhanced Upload
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Draft
          </Button>
        </div>
      </div>

      {/* Enhanced Upload Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Field Mapping Active:</strong> Upload system now detects 70+ MLS field variations including 
          BathroomsFull (required), BathroomsHalf (optional), PropertyType, PropertySubType, ArchitecturalStyle, 
          and all feature fields. Check console for detailed mapping results.
        </AlertDescription>
      </Alert>

      {/* Bulk Actions Bar */}
      {draftListings.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate
              }}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              {selectedListings.length === 0 
                ? 'Select listings for bulk actions'
                : `${selectedListings.length} selected`
              }
            </span>
          </div>
          
          {selectedListings.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedListings.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Draft listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {draftListings.map((draft) => {
          const errors = validateProperty(draft)
          const canPublish = errors.length === 0
          const isPublishing = publishingId === draft.id
          
          return (
            <Card key={draft.id} className={`hover:shadow-lg transition-shadow ${selectedListings.includes(draft.id) ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedListings.includes(draft.id)}
                      onCheckedChange={(checked) => handleSelectListing(draft.id, checked as boolean)}
                    />
                    <Badge className={getStatusColor(draft.status)}>
                      {draft.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {calculateCompletionPercentage(draft)}% complete
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {draft.streetNumber} {draft.streetName} {draft.streetSuffix}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {draft.city}, {draft.state} {draft.zipCode}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(draft.listPrice)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Modified {formatDate(draft.lastModified)}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>🛏️ {draft.bedrooms} beds • 🚿 {draft.bathrooms} baths</div>
                    {draft.bathroomsHalf && <div>🚽 {draft.bathroomsHalf} half baths</div>}
                    <div>📐 {draft.livingAreaSqFt?.toLocaleString()} sq ft</div>
                    <div>🏠 {draft.propertyType} {draft.propertySubType && `• ${draft.propertySubType}`}</div>
                    {draft.architecturalStyle && <div>🏛️ {draft.architecturalStyle}</div>}
                    {draft.stories && <div>🏢 {draft.stories} stories</div>}
                    <div>📸 {draft.photos?.length || 0}/4 photos</div>
                    {errors.length > 0 && (
                      <div className="flex items-center text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.length} validation error(s)
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateCompletionPercentage(draft)}%` }}
                    ></div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEdit(draft)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handlePreview(draft)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePublish(draft.id)}
                      disabled={!canPublish || isPublishing}
                    >
                      {isPublishing ? (
                        <>
                          <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(draft.id)}
                      disabled={isPublishing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {draftListings.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No draft listings</h3>
          <p className="text-gray-600 mb-6">
            Upload property listings using the enhanced bulk upload feature or create individual drafts
          </p>
          <Button onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Listings
          </Button>
        </div>
      )}

      {/* Property Preview Dialog */}
      <PropertyPreview
        property={previewProperty}
        isOpen={showPreviewDialog}
        onClose={() => {
          setShowPreviewDialog(false)
          setPreviewProperty(null)
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedListings.length} selected draft listing(s)? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedListings.length} Listings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Bulk Upload Dialog */}
      <BulkListingUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUploadComplete={handleBulkUploadComplete}
      />

      {/* Enhanced Edit Property Dialog with MLS Fields */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit MLS Property Listing</DialogTitle>
            <DialogDescription>
              Update all property details using enhanced MLS-compliant fields including bathroom details, property features, and more
            </DialogDescription>
          </DialogHeader>
          
          {editingProperty && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="location" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Financial
                </TabsTrigger>
                <TabsTrigger value="agent" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Agent Info
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-1">
                  <FileImage className="w-3 h-3" />
                  Media
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listPrice">List Price *</Label>
                    <Input
                      id="listPrice"
                      type="number"
                      value={editingProperty.listPrice}
                      onChange={(e) => updateEditingProperty('listPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select 
                      value={editingProperty.propertyType} 
                      onValueChange={(value) => updateEditingProperty('propertyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="rental">Rental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertySubType">Property Sub Type</Label>
                    <Input
                      id="propertySubType"
                      value={editingProperty.propertySubType || ''}
                      onChange={(e) => updateEditingProperty('propertySubType', e.target.value)}
                      placeholder="e.g., Single Family, Condo, Townhouse"
                    />
                  </div>
                  <div>
                    <Label htmlFor="architecturalStyle">Architectural Style</Label>
                    <Input
                      id="architecturalStyle"
                      value={editingProperty.architecturalStyle || ''}
                      onChange={(e) => updateEditingProperty('architecturalStyle', e.target.value)}
                      placeholder="e.g., Colonial, Modern, Ranch"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={editingProperty.bedrooms || ''}
                      onChange={(e) => updateEditingProperty('bedrooms', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Full Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      step="0.5"
                      value={editingProperty.bathrooms || ''}
                      onChange={(e) => updateEditingProperty('bathrooms', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathroomsHalf">Half Bathrooms</Label>
                    <Input
                      id="bathroomsHalf"
                      type="number"
                      value={editingProperty.bathroomsHalf || ''}
                      onChange={(e) => updateEditingProperty('bathroomsHalf', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stories">Stories</Label>
                    <Input
                      id="stories"
                      type="number"
                      value={editingProperty.stories || ''}
                      onChange={(e) => updateEditingProperty('stories', parseInt(e.target.value) || 0)}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="livingAreaSqFt">Living Area (sq ft) *</Label>
                    <Input
                      id="livingAreaSqFt"
                      type="number"
                      value={editingProperty.livingAreaSqFt || ''}
                      onChange={(e) => updateEditingProperty('livingAreaSqFt', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearBuilt">Year Built *</Label>
                    <Input
                      id="yearBuilt"
                      type="number"
                      value={editingProperty.yearBuilt || ''}
                      onChange={(e) => updateEditingProperty('yearBuilt', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lotSize">Lot Size (sq ft) *</Label>
                  <Input
                    id="lotSize"
                    type="number"
                    value={editingProperty.lotSize || ''}
                    onChange={(e) => updateEditingProperty('lotSize', parseInt(e.target.value) || 0)}
                  />
                </div>
              </TabsContent>

              {/* Location Tab - ALL REQUIRED */}
              <TabsContent value="location" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="streetNumber">Street Number *</Label>
                    <Input
                      id="streetNumber"
                      value={editingProperty.streetNumber || ''}
                      onChange={(e) => updateEditingProperty('streetNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="streetName">Street Name *</Label>
                    <Input
                      id="streetName"
                      value={editingProperty.streetName || ''}
                      onChange={(e) => updateEditingProperty('streetName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="streetSuffix">Street Suffix *</Label>
                    <Input
                      id="streetSuffix"
                      value={editingProperty.streetSuffix || ''}
                      onChange={(e) => updateEditingProperty('streetSuffix', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={editingProperty.city}
                      onChange={(e) => updateEditingProperty('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={editingProperty.state}
                      onChange={(e) => updateEditingProperty('state', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={editingProperty.zipCode}
                      onChange={(e) => updateEditingProperty('zipCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      value={editingProperty.county || ''}
                      onChange={(e) => updateEditingProperty('county', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subdivision">Subdivision</Label>
                    <Input
                      id="subdivision"
                      value={editingProperty.subdivision || ''}
                      onChange={(e) => updateEditingProperty('subdivision', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Enhanced Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="garageSpaces">Garage Spaces</Label>
                    <Input
                      id="garageSpaces"
                      type="number"
                      value={editingProperty.garageSpaces || ''}
                      onChange={(e) => updateEditingProperty('garageSpaces', parseInt(e.target.value) || undefined)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flooring">Flooring</Label>
                    <Input
                      id="flooring"
                      value={editingProperty.flooring || ''}
                      onChange={(e) => updateEditingProperty('flooring', e.target.value)}
                      placeholder="e.g., Hardwood, Carpet, Tile"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="poolFeatures">Pool Features</Label>
                    <Input
                      id="poolFeatures"
                      value={editingProperty.poolFeatures || ''}
                      onChange={(e) => updateEditingProperty('poolFeatures', e.target.value)}
                      placeholder="e.g., In-ground, Heated, Salt Water"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fireplaceFeatures">Fireplace Features</Label>
                    <Input
                      id="fireplaceFeatures"
                      value={editingProperty.fireplaceFeatures || ''}
                      onChange={(e) => updateEditingProperty('fireplaceFeatures', e.target.value)}
                      placeholder="e.g., Gas, Wood Burning, Electric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kitchenFeatures">Kitchen Features</Label>
                    <Input
                      id="kitchenFeatures"
                      value={editingProperty.kitchenFeatures || ''}
                      onChange={(e) => updateEditingProperty('kitchenFeatures', e.target.value)}
                      placeholder="e.g., Granite Counters, Stainless Appliances"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primarySuite">Primary Suite</Label>
                    <Input
                      id="primarySuite"
                      value={editingProperty.primarySuite || ''}
                      onChange={(e) => updateEditingProperty('primarySuite', e.target.value)}
                      placeholder="e.g., Walk-in Closet, En-suite Bath"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laundryFeatures">Laundry Features</Label>
                    <Input
                      id="laundryFeatures"
                      value={editingProperty.laundryFeatures || ''}
                      onChange={(e) => updateEditingProperty('laundryFeatures', e.target.value)}
                      placeholder="e.g., Laundry Room, Washer/Dryer Included"
                    />
                  </div>
                  <div>
                    <Label htmlFor="constructionMaterials">Construction Materials</Label>
                    <Input
                      id="constructionMaterials"
                      value={editingProperty.constructionMaterials || ''}
                      onChange={(e) => updateEditingProperty('constructionMaterials', e.target.value)}
                      placeholder="e.g., Brick, Vinyl Siding, Stone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roofType">Roof Type</Label>
                    <Input
                      id="roofType"
                      value={editingProperty.roofType || ''}
                      onChange={(e) => updateEditingProperty('roofType', e.target.value)}
                      placeholder="e.g., Asphalt Shingle, Metal, Tile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="foundationDetails">Foundation Details</Label>
                    <Input
                      id="foundationDetails"
                      value={editingProperty.foundationDetails || ''}
                      onChange={(e) => updateEditingProperty('foundationDetails', e.target.value)}
                      placeholder="e.g., Concrete Slab, Basement, Crawl Space"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exteriorFeatures">Exterior Features</Label>
                    <Input
                      id="exteriorFeatures"
                      value={editingProperty.exteriorFeatures || ''}
                      onChange={(e) => updateEditingProperty('exteriorFeatures', e.target.value)}
                      placeholder="e.g., Deck, Patio, Landscaping"
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyView">View</Label>
                    <Input
                      id="propertyView"
                      value={editingProperty.propertyView || ''}
                      onChange={(e) => updateEditingProperty('propertyView', e.target.value)}
                      placeholder="e.g., Mountain, Water, City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waterSource">Water Source</Label>
                    <Input
                      id="waterSource"
                      value={editingProperty.waterSource || ''}
                      onChange={(e) => updateEditingProperty('waterSource', e.target.value)}
                      placeholder="e.g., City Water, Well, Spring"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sewerSystem">Sewer System</Label>
                    <Input
                      id="sewerSystem"
                      value={editingProperty.sewerSystem || ''}
                      onChange={(e) => updateEditingProperty('sewerSystem', e.target.value)}
                      placeholder="e.g., City Sewer, Septic, Lagoon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heatingType">Heating Type</Label>
                    <Input
                      id="heatingType"
                      value={editingProperty.heatingType || ''}
                      onChange={(e) => updateEditingProperty('heatingType', e.target.value)}
                      placeholder="e.g., Forced Air, Radiant, Heat Pump"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coolingType">Cooling Type</Label>
                    <Input
                      id="coolingType"
                      value={editingProperty.coolingType || ''}
                      onChange={(e) => updateEditingProperty('coolingType', e.target.value)}
                      placeholder="e.g., Central Air, Window Units, None"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxes">Annual Taxes</Label>
                    <Input
                      id="taxes"
                      type="number"
                      value={editingProperty.taxes || ''}
                      onChange={(e) => updateEditingProperty('taxes', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxYear">Tax Year</Label>
                    <Input
                      id="taxYear"
                      type="number"
                      value={editingProperty.taxYear || ''}
                      onChange={(e) => updateEditingProperty('taxYear', parseInt(e.target.value) || undefined)}
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hoaFee">HOA Fee</Label>
                    <Input
                      id="hoaFee"
                      type="number"
                      value={editingProperty.hoaFee || ''}
                      onChange={(e) => updateEditingProperty('hoaFee', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyerAgentCompensation">Buyer Agent Compensation (%)</Label>
                    <Input
                      id="buyerAgentCompensation"
                      type="number"
                      step="0.1"
                      value={editingProperty.buyerAgentCompensation || ''}
                      onChange={(e) => updateEditingProperty('buyerAgentCompensation', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialAssessments">Special Assessments</Label>
                  <Input
                    id="specialAssessments"
                    type="number"
                    value={editingProperty.specialAssessments || ''}
                    onChange={(e) => updateEditingProperty('specialAssessments', parseFloat(e.target.value) || undefined)}
                  />
                </div>
              </TabsContent>

              {/* Agent Info Tab */}
              <TabsContent value="agent" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listingAgentName">Listing Agent Name *</Label>
                    <Input
                      id="listingAgentName"
                      value={editingProperty.listingAgentName || ''}
                      onChange={(e) => updateEditingProperty('listingAgentName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="listingAgentLicense">Agent License # *</Label>
                    <Input
                      id="listingAgentLicense"
                      value={editingProperty.listingAgentLicense || ''}
                      onChange={(e) => updateEditingProperty('listingAgentLicense', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="listingAgentPhone">Agent Phone *</Label>
                    <Input
                      id="listingAgentPhone"
                      value={editingProperty.listingAgentPhone || ''}
                      onChange={(e) => updateEditingProperty('listingAgentPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="listingAgentEmail">Agent Email</Label>
                    <Input
                      id="listingAgentEmail"
                      type="email"
                      value={editingProperty.listingAgentEmail || ''}
                      onChange={(e) => updateEditingProperty('listingAgentEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brokerage">Brokerage *</Label>
                    <Input
                      id="brokerage"
                      value={editingProperty.brokerage || ''}
                      onChange={(e) => updateEditingProperty('brokerage', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brokerageLicense">Brokerage License</Label>
                    <Input
                      id="brokerageLicense"
                      value={editingProperty.brokerageLicense || ''}
                      onChange={(e) => updateEditingProperty('brokerageLicense', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="showingInstructions">Showing Instructions</Label>
                  <Textarea
                    id="showingInstructions"
                    value={editingProperty.showingInstructions || ''}
                    onChange={(e) => updateEditingProperty('showingInstructions', e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Media Tab with Photo Upload */}
              <TabsContent value="media" className="space-y-4">
                <div>
                  <Label>Property Photos * (Minimum 4 required)</Label>
                  <PhotoUpload
                    photos={editingProperty.photos || []}
                    onPhotosChange={handlePhotosChange}
                    minPhotos={4}
                    maxPhotos={20}
                  />
                </div>

                <div>
                  <Label htmlFor="publicRemarks">Public Description</Label>
                  <Textarea
                    id="publicRemarks"
                    value={editingProperty.publicRemarks || ''}
                    onChange={(e) => updateEditingProperty('publicRemarks', e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="brokerRemarks">Broker Remarks (Private)</Label>
                  <Textarea
                    id="brokerRemarks"
                    value={editingProperty.brokerRemarks || ''}
                    onChange={(e) => updateEditingProperty('brokerRemarks', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
                    <Input
                      id="virtualTourUrl"
                      type="url"
                      value={editingProperty.virtualTourUrl || ''}
                      onChange={(e) => updateEditingProperty('virtualTourUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={editingProperty.videoUrl || ''}
                      onChange={(e) => updateEditingProperty('videoUrl', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}