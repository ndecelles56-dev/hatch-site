import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Eye,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  Camera,
  MapPin,
  DollarSign
} from 'lucide-react'
import { DraftListing, ValidationError } from './BulkListingUpload'
import { MIN_PROPERTY_PHOTOS } from '@/constants/photoRequirements'

interface DraftListingsManagerProps {
  draftListings: DraftListing[]
  onPublishListing: (draftId: string, recordIds: number[]) => void
  onDeleteDraft: (draftId: string) => void
  onReprocessDraft: (draftId: string) => void
}

export default function DraftListingsManager({ 
  draftListings, 
  onPublishListing, 
  onDeleteDraft, 
  onReprocessDraft 
}: DraftListingsManagerProps) {
  const [selectedDraft, setSelectedDraft] = useState<DraftListing | null>(null)
  const [selectedRecords, setSelectedRecords] = useState<number[]>([])

  const getStatusBadge = (status: DraftListing['status']) => {
    const variants = {
      processing: { variant: 'secondary' as const, icon: RefreshCw, text: 'Processing' },
      ready: { variant: 'default' as const, icon: CheckCircle, text: 'Ready' },
      error: { variant: 'destructive' as const, icon: AlertCircle, text: 'Error' },
      published: { variant: 'outline' as const, icon: Upload, text: 'Published' }
    }
    
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const getValidationIcon = (errors: ValidationError[], row: number, type: 'required' | 'optional' | 'photos') => {
    const rowErrors = errors.filter(e => e.row === row)
    const hasRequiredErrors = rowErrors.some(e => e.type === 'required')
    const hasOptionalErrors = rowErrors.some(e => e.type === 'optional')
    const hasPhotoErrors = rowErrors.some(e => e.type === 'photos')

    if (type === 'required' && hasRequiredErrors) {
      return <AlertCircle className="w-4 h-4 text-red-500" aria-label="Missing required fields" />
    }
    if (type === 'optional' && hasOptionalErrors) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" aria-label="Missing optional fields" />
    }
    if (type === 'photos' && hasPhotoErrors) {
      return <Camera className="w-4 h-4 text-red-500" aria-label={`Insufficient photos (minimum ${MIN_PROPERTY_PHOTOS})`} />
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const canPublishRecord = (errors: ValidationError[], row: number) => {
    const rowErrors = errors.filter(e => e.row === row)
    const hasRequiredErrors = rowErrors.some(e => e.type === 'required')
    const hasPhotoErrors = rowErrors.some(e => e.type === 'photos')
    return !hasRequiredErrors && !hasPhotoErrors
  }

  const handlePublishSelected = () => {
    if (selectedDraft && selectedRecords.length > 0) {
      onPublishListing(selectedDraft.id, selectedRecords)
      setSelectedRecords([])
    }
  }

  const toggleRecordSelection = (recordIndex: number) => {
    setSelectedRecords(prev => 
      prev.includes(recordIndex) 
        ? prev.filter(id => id !== recordIndex)
        : [...prev, recordIndex]
    )
  }

  const selectAllValidRecords = () => {
    if (!selectedDraft) return
    
    const validRecords = selectedDraft.data
      .map((_, index) => index)
      .filter(index => canPublishRecord(selectedDraft.validationErrors, index + 1))
    
    setSelectedRecords(validRecords)
  }

  if (draftListings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Draft Listings</h3>
          <p className="text-gray-500 text-center mb-4">
            Upload CSV or Excel files to create draft listings that can be reviewed before publishing.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Draft Listings</h2>
          <p className="text-gray-600">Review and manage uploaded listings before publishing</p>
        </div>
      </div>

      {/* Draft Listings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {draftListings.map((draft) => (
          <Card key={draft.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base truncate">{draft.fileName}</CardTitle>
                {getStatusBadge(draft.status)}
              </div>
              <CardDescription>
                Uploaded {new Date(draft.uploadDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                  <span>{draft.totalRecords} total</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{draft.validRecords} ready</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{draft.errorRecords} errors</span>
                </div>
                <div className="flex items-center gap-1">
                  <Camera className="w-4 h-4 text-blue-500" />
                  <span>{draft.photosCount} photos</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedDraft(draft)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Review Draft Listings - {draft.fileName}</DialogTitle>
                      <DialogDescription>
                        Review and select listings to publish. Red symbols indicate missing required fields, 
                        yellow symbols indicate missing optional fields.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="listings" className="w-full">
                      <TabsList>
                        <TabsTrigger value="listings">Listings ({draft.totalRecords})</TabsTrigger>
                        <TabsTrigger value="errors">Validation Issues ({draft.validationErrors.length})</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="listings" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={selectAllValidRecords}
                            >
                              Select All Valid
                            </Button>
                            <span className="text-sm text-gray-500">
                              {selectedRecords.length} selected
                            </span>
                          </div>
                          <Button 
                            onClick={handlePublishSelected}
                            disabled={selectedRecords.length === 0}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Publish Selected ({selectedRecords.length})
                          </Button>
                        </div>
                        
                        <ScrollArea className="h-96">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Select</TableHead>
                                <TableHead className="w-16">Status</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Bed/Bath</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Optional</TableHead>
                                <TableHead>Photos</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {draft.data.map((record, index) => {
                                const canPublish = canPublishRecord(draft.validationErrors, index + 1)
                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        checked={selectedRecords.includes(index)}
                                        onChange={() => toggleRecordSelection(index)}
                                        disabled={!canPublish}
                                        className="rounded"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {canPublish ? (
                                        <Badge variant="default" className="text-xs">Ready</Badge>
                                      ) : (
                                        <Badge variant="destructive" className="text-xs">Issues</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-gray-400" />
                                        <span className="text-sm">
                                          {record['Street Number']} {record['Street Name']}, {record['City']}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3 text-gray-400" />
                                        <span className="text-sm">
                                          {record['List Price'] ? `$${parseInt(record['List Price']).toLocaleString()}` : 'N/A'}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {record['Bedrooms']}/{record['Bathrooms']}
                                    </TableCell>
                                    <TableCell>
                                      {getValidationIcon(draft.validationErrors, index + 1, 'required')}
                                    </TableCell>
                                    <TableCell>
                                      {getValidationIcon(draft.validationErrors, index + 1, 'optional')}
                                    </TableCell>
                                    <TableCell>
                                      {getValidationIcon(draft.validationErrors, index + 1, 'photos')}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="errors" className="space-y-4">
                        <ScrollArea className="h-96">
                          <div className="space-y-2">
                            {draft.validationErrors.map((error, index) => (
                              <Alert key={index} variant={error.type === 'required' ? 'destructive' : 'default'}>
                                <div className="flex items-center gap-2">
                                  {error.type === 'required' && <AlertCircle className="h-4 w-4" />}
                                  {error.type === 'optional' && <AlertTriangle className="h-4 w-4" />}
                                  {error.type === 'photos' && <Camera className="h-4 w-4" />}
                                  <AlertDescription>
                                    <strong>Row {error.row}:</strong> {error.message}
                                  </AlertDescription>
                                </div>
                              </Alert>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDeleteDraft(draft.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
