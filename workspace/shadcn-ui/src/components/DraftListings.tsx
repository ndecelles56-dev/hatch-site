import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Upload,
  FileSpreadsheet,
  Image,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  User,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react'
import { MIN_PROPERTY_PHOTOS, MAX_PROPERTY_PHOTOS } from '@/constants/photoRequirements'

export interface DraftListing {
  id: string
  status: 'draft' | 'processing' | 'ready' | 'published' | 'error'
  uploadDate: string
  originalData: Record<string, any>
  mappedData: Record<string, any>
  validationErrors: ValidationError[]
  validationWarnings: ValidationWarning[]
  photos: string[]
  completionPercentage: number
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  message: string
}

interface DraftListingsProps {
  draftListings: DraftListing[]
  onUpdateDraft: (id: string, data: Record<string, any>) => void
  onDeleteDraft: (id: string) => void
  onPublishDraft: (id: string) => void
  onPublishAll: () => void
}

const requiredFields = [
  'listPrice',
  'streetNumber',
  'streetName',
  'city',
  'state',
  'zipCode',
  'bedrooms',
  'bathrooms',
  'squareFeet',
  'propertyType',
  'listingAgentName',
  'listingAgentLicense'
]

const optionalFields = [
  'originalListPrice',
  'yearBuilt',
  'lotSize',
  'garage',
  'pool',
  'hoaFees',
  'taxes',
  'publicRemarks',
  'privateRemarks'
]

export default function DraftListings({
  draftListings,
  onUpdateDraft,
  onDeleteDraft,
  onPublishDraft,
  onPublishAll
}: DraftListingsProps) {
  const [selectedDraft, setSelectedDraft] = useState<DraftListing | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState<Record<string, any>>({})

  const getStatusColor = (status: DraftListing['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-purple-100 text-purple-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getValidationIcon = (field: string, draft: DraftListing) => {
    const hasError = draft.validationErrors.some(error => error.field === field)
    const hasWarning = draft.validationWarnings.some(warning => warning.field === field)
    const hasValue = draft.mappedData[field] && draft.mappedData[field] !== ''

    if (hasError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    if (hasWarning && !hasValue) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
    if (hasValue) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return null
  }

  const canPublish = (draft: DraftListing) => {
    const hasRequiredFields = requiredFields.every(field => 
      draft.mappedData[field] && draft.mappedData[field] !== ''
    )
    const hasMinimumPhotos = draft.photos.length >= MIN_PROPERTY_PHOTOS
    const hasNoErrors = draft.validationErrors.length === 0

    return hasRequiredFields && hasMinimumPhotos && hasNoErrors
  }

  const handleEditDraft = (draft: DraftListing) => {
    setSelectedDraft(draft)
    setEditFormData(draft.mappedData)
    setShowEditDialog(true)
  }

  const handleSaveEdit = () => {
    if (selectedDraft) {
      onUpdateDraft(selectedDraft.id, editFormData)
      setShowEditDialog(false)
      setSelectedDraft(null)
    }
  }

  const readyToPublishCount = draftListings.filter(canPublish).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Draft Listings</h2>
          <p className="text-gray-600">
            {draftListings.length} total drafts • {readyToPublishCount} ready to publish
          </p>
        </div>
        {readyToPublishCount > 0 && (
          <Button onClick={onPublishAll} className="bg-green-600 hover:bg-green-700">
            <Upload className="w-4 h-4 mr-2" />
            Publish All Ready ({readyToPublishCount})
          </Button>
        )}
      </div>

      {/* Draft Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {draftListings.map((draft) => (
          <Card key={draft.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {draft.mappedData.streetNumber} {draft.mappedData.streetName} {draft.mappedData.streetSuffix}
                  </CardTitle>
                  <CardDescription>
                    {draft.mappedData.city}, {draft.mappedData.state} {draft.mappedData.zipCode}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(draft.status)}>
                  {draft.status}
                </Badge>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span>{draft.completionPercentage}%</span>
                </div>
                <Progress value={draft.completionPercentage} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>${draft.mappedData.listPrice?.toLocaleString() || 'N/A'}</span>
                  {getValidationIcon('listPrice', draft)}
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span>{draft.mappedData.bedrooms || 0}bd/{draft.mappedData.bathrooms || 0}ba</span>
                  {getValidationIcon('bedrooms', draft)}
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{draft.mappedData.squareFeet?.toLocaleString() || 'N/A'} sq ft</span>
                  {getValidationIcon('squareFeet', draft)}
                </div>
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4 text-gray-400" />
                  <span>{draft.photos.length}/{MIN_PROPERTY_PHOTOS} photos</span>
                  {draft.photos.length >= MIN_PROPERTY_PHOTOS ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Validation Summary */}
              <div className="space-y-2">
                {draft.validationErrors.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{draft.validationErrors.length} required fields missing</span>
                  </div>
                )}
                {draft.validationWarnings.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{draft.validationWarnings.length} optional fields empty</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDraft(draft)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteDraft(draft.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onPublishDraft(draft.id)}
                  disabled={!canPublish(draft)}
                  className={canPublish(draft) ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Draft Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Draft Listing</DialogTitle>
            <DialogDescription>
              Update the listing information. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>

          {selectedDraft && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="listPrice">List Price *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="listPrice"
                        type="number"
                        value={editFormData.listPrice || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, listPrice: e.target.value })}
                        placeholder="450000"
                      />
                      {getValidationIcon('listPrice', selectedDraft)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={editFormData.propertyType || ''}
                        onValueChange={(value) => setEditFormData({ ...editFormData, propertyType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single Family">Single Family</SelectItem>
                          <SelectItem value="Condo">Condo</SelectItem>
                          <SelectItem value="Townhouse">Townhouse</SelectItem>
                          <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                        </SelectContent>
                      </Select>
                      {getValidationIcon('propertyType', selectedDraft)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">Street Number *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="streetNumber"
                        value={editFormData.streetNumber || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, streetNumber: e.target.value })}
                        placeholder="123"
                      />
                      {getValidationIcon('streetNumber', selectedDraft)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetName">Street Name *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="streetName"
                        value={editFormData.streetName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, streetName: e.target.value })}
                        placeholder="Main"
                      />
                      {getValidationIcon('streetName', selectedDraft)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetSuffix">Street Suffix</Label>
                    <Select
                      value={editFormData.streetSuffix || ''}
                      onValueChange={(value) => setEditFormData({ ...editFormData, streetSuffix: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select suffix" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="St">Street</SelectItem>
                        <SelectItem value="Ave">Avenue</SelectItem>
                        <SelectItem value="Blvd">Boulevard</SelectItem>
                        <SelectItem value="Dr">Drive</SelectItem>
                        <SelectItem value="Ln">Lane</SelectItem>
                        <SelectItem value="Rd">Road</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="city"
                        value={editFormData.city || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        placeholder="Miami"
                      />
                      {getValidationIcon('city', selectedDraft)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={editFormData.state || 'FL'}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      placeholder="FL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="zipCode"
                        value={editFormData.zipCode || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, zipCode: e.target.value })}
                        placeholder="33101"
                      />
                      {getValidationIcon('zipCode', selectedDraft)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="bedrooms"
                        type="number"
                        value={editFormData.bedrooms || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, bedrooms: e.target.value })}
                        placeholder="3"
                      />
                      {getValidationIcon('bedrooms', selectedDraft)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="bathrooms"
                        type="number"
                        step="0.5"
                        value={editFormData.bathrooms || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, bathrooms: e.target.value })}
                        placeholder="2.5"
                      />
                      {getValidationIcon('bathrooms', selectedDraft)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="squareFeet">Square Feet *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="squareFeet"
                        type="number"
                        value={editFormData.squareFeet || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, squareFeet: e.target.value })}
                        placeholder="2000"
                      />
                      {getValidationIcon('squareFeet', selectedDraft)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicRemarks">Public Remarks</Label>
                  <div className="flex items-start space-x-2">
                    <Textarea
                      id="publicRemarks"
                      value={editFormData.publicRemarks || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, publicRemarks: e.target.value })}
                      placeholder="Beautiful property with stunning views..."
                      rows={4}
                      className="flex-1"
                    />
                    {getValidationIcon('publicRemarks', selectedDraft)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxes">Annual Taxes</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="taxes"
                        type="number"
                        value={editFormData.taxes || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, taxes: e.target.value })}
                        placeholder="5000"
                      />
                      {getValidationIcon('taxes', selectedDraft)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoaFees">HOA Fees</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="hoaFees"
                        type="number"
                        value={editFormData.hoaFees || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, hoaFees: e.target.value })}
                        placeholder="150"
                      />
                      {getValidationIcon('hoaFees', selectedDraft)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    {selectedDraft.photos.length}/{MAX_PROPERTY_PHOTOS} photos uploaded
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Minimum {MIN_PROPERTY_PHOTOS} photos required to publish listing
                  </p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {draftListings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Draft Listings</h3>
            <p className="text-gray-600 mb-4">
              Upload a CSV or Excel file to create draft listings that you can review and publish.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
