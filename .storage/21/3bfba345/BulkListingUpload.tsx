import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  X,
  Download,
  Eye,
  Trash2
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { 
  MLS_FIELD_DEFINITIONS,
  mapCSVHeaders,
  validateMLSData,
  type FieldMapping,
  type ValidationResult
} from '@/utils/fuzzyFieldMatcher'

export interface DraftListing {
  id: string
  fileName: string
  uploadDate: string
  status: 'processing' | 'ready' | 'error' | 'published'
  totalRecords: number
  validRecords: number
  errorRecords: number
  requiredFieldsComplete: number
  optionalFieldsComplete: number
  photosCount: number
  data: any[]
  validationErrors: ValidationError[]
  fieldMapping: FieldMapping[]
  mlsCompliant?: boolean
  completionPercentage: number
}

export interface ValidationError {
  row: number
  field: string
  type: 'required' | 'optional' | 'format' | 'photos'
  message: string
}

// Get required and optional fields from the fuzzy field matcher
const getRequiredFields = () => MLS_FIELD_DEFINITIONS.filter(f => f.required).map(f => f.standardName)
const getOptionalFields = () => MLS_FIELD_DEFINITIONS.filter(f => !f.required).map(f => f.standardName)

interface BulkListingUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (draftListing: DraftListing) => void
}

export default function BulkListingUpload({ isOpen, onClose, onUploadComplete }: BulkListingUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setUploadError('Please select a valid CSV or Excel file (.csv, .xls, .xlsx)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setUploadError(null)
    previewFile(file)
  }, [])

  const previewFile = async (file: File) => {
    try {
      const data = await readFileData(file)
      if (data.length > 50) {
        setUploadError('Maximum 50 listings allowed per upload')
        return
      }
      setPreviewData(data.slice(0, 5)) // Show first 5 rows for preview
    } catch (error) {
      setUploadError('Error reading file. Please check the file format.')
    }
  }

  const readFileData = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          let jsonData: any[] = []

          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const text = data as string
            const lines = text.split('\n').filter(line => line.trim())
            
            // Check if this is a Field,Value format (like the real export)
            const firstLine = lines[0].toLowerCase()
            if (firstLine.includes('field') && firstLine.includes('value')) {
              // This is a Field,Value format - single listing
              const listing: Record<string, any> = {}
              
              for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',')
                if (parts.length >= 2) {
                  const field = parts[0].trim().replace(/"/g, '')
                  const value = parts.slice(1).join(',').trim().replace(/"/g, '')
                  if (field && value) {
                    listing[field] = value
                  }
                }
              }
              
              jsonData = [listing] // Return array with single listing
            } else {
              // Traditional CSV format with headers and multiple rows
              const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
              
              jsonData = lines.slice(1)
                .filter(line => line.trim())
                .map(line => {
                  const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
                  const obj: any = {}
                  headers.forEach((header, index) => {
                    obj[header] = values[index] || ''
                  })
                  return obj
                })
            }
          } else {
            // Parse Excel
            const workbook = XLSX.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            jsonData = XLSX.utils.sheet_to_json(worksheet)
          }

          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('File reading failed'))

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file)
      } else {
        reader.readAsBinaryString(file)
      }
    })
  }

  const validateListingData = (data: any[]): { validationErrors: ValidationError[], fieldMappings: FieldMapping[] } => {
    const validationErrors: ValidationError[] = []
    let fieldMappings: FieldMapping[] = []

    if (data.length === 0) return { validationErrors, fieldMappings }

    // Get headers from the first row
    const headers = Object.keys(data[0])
    
    // Use fuzzy field matching to map headers
    const mappingResult = mapCSVHeaders(headers, 0.7)
    fieldMappings = mappingResult.mappings

    console.log('🔍 Field Mapping Results:')
    console.log(`✅ Mapped: ${mappingResult.mappings.length} fields`)
    console.log(`❌ Unmapped: ${mappingResult.unmapped.length} fields`)
    console.log(`⚠️ Missing Required: ${mappingResult.missingRequired.length} fields`)

    mappingResult.mappings.forEach(mapping => {
      console.log(`  ${mapping.inputField} → ${mapping.mlsField.standardName} (${Math.round(mapping.confidence * 100)}% confidence)`)
    })

    if (mappingResult.unmapped.length > 0) {
      console.log('❌ Unmapped fields:', mappingResult.unmapped)
    }

    if (mappingResult.missingRequired.length > 0) {
      console.log('⚠️ Missing required fields:', mappingResult.missingRequired.map(f => f.standardName))
    }

    data.forEach((row, index) => {
      // Validate using the fuzzy field matcher
      const validation = validateMLSData(row, fieldMappings)
      
      // Convert validation results to our format
      validation.errors.forEach(error => {
        validationErrors.push({
          row: index + 1,
          field: error.field,
          type: 'required',
          message: error.message
        })
      })

      validation.warnings.forEach(warning => {
        validationErrors.push({
          row: index + 1,
          field: warning.field,
          type: 'optional',
          message: warning.message
        })
      })

      // Check photos requirement (minimum 4 photos)
      const photoMappings = fieldMappings.filter(m => m.mlsField.standardName === 'PhotoURLs')
      if (photoMappings.length > 0) {
        const photoField = photoMappings[0].inputField
        const photos = row[photoField]
        if (!photos || (photos && photos.split(',').length < 4)) {
          validationErrors.push({
            row: index + 1,
            field: 'PhotoURLs',
            type: 'photos',
            message: 'Minimum 4 photos required'
          })
        }
      }

      // Validate data formats
      const priceMappings = fieldMappings.filter(m => m.mlsField.standardName === 'ListPrice')
      if (priceMappings.length > 0) {
        const priceField = priceMappings[0].inputField
        if (row[priceField] && isNaN(parseFloat(row[priceField]))) {
          validationErrors.push({
            row: index + 1,
            field: 'ListPrice',
            type: 'format',
            message: 'Invalid price format'
          })
        }
      }

      // Validate MLS Number format
      const mlsMappings = fieldMappings.filter(m => m.mlsField.standardName === 'MLSNumber')
      if (mlsMappings.length > 0) {
        const mlsField = mlsMappings[0].inputField
        if (row[mlsField] && row[mlsField].toString().trim().length < 3) {
          validationErrors.push({
            row: index + 1,
            field: 'MLSNumber',
            type: 'format',
            message: 'MLS Number appears to be too short'
          })
        }
      }
    })

    return { validationErrors, fieldMappings }
  }

  const processUpload = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setUploadProgress(0)

    try {
      setUploadProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Read real file data (no fake generation)
      const data = await readFileData(selectedFile)
      setUploadProgress(40)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Validate real data using enhanced fuzzy field matching
      const { validationErrors, fieldMappings } = validateListingData(data)
      setUploadProgress(60)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Calculate real statistics
      const requiredErrors = validationErrors.filter(e => e.type === 'required')
      const optionalErrors = validationErrors.filter(e => e.type === 'optional')
      
      const validRecords = data.length - new Set(requiredErrors.map(e => e.row)).size
      const requiredFieldsComplete = data.length - new Set(requiredErrors.map(e => e.row)).size
      const optionalFieldsComplete = data.length - new Set(optionalErrors.map(e => e.row)).size

      setUploadProgress(80)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Create real draft listing from actual data
      const draftListing: DraftListing = {
        id: `draft_${Date.now()}`,
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        status: validRecords > 0 ? 'ready' : 'error',
        totalRecords: data.length,
        validRecords,
        errorRecords: data.length - validRecords,
        requiredFieldsComplete,
        optionalFieldsComplete,
        photosCount: data.reduce((sum, row) => {
          // Find photo field mappings
          const photoMappings = fieldMappings.filter(m => m.mlsField.standardName === 'PhotoURLs')
          if (photoMappings.length > 0) {
            const photoField = photoMappings[0].inputField
            return sum + (row[photoField] ? row[photoField].split(',').length : 0)
          }
          return sum
        }, 0),
        data, // Real data, not fake
        validationErrors,
        fieldMapping: fieldMappings, // Use the fuzzy field mappings
        mlsCompliant: requiredErrors.length === 0,
        completionPercentage: Math.round(
          (requiredFieldsComplete / data.length) * 100
        )
      }

      setUploadProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))

      onUploadComplete(draftListing)
      onClose()
      resetUpload()

    } catch (error) {
      setUploadError('Error processing file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewData([])
    setUploadProgress(0)
    setIsProcessing(false)
    setUploadError(null)
  }

  const downloadTemplate = () => {
    // Create a link to download the new Hatch MLS Template
    const link = document.createElement('a')
    link.href = '/templates/Hatch MLS Template.numbers'
    link.download = 'Hatch MLS Template.numbers'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const requiredFields = getRequiredFields()
  const optionalFields = getOptionalFields()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Enhanced MLS Data Upload
          </DialogTitle>
          <DialogDescription>
            Upload MLS export files with intelligent field mapping. System detects {MLS_FIELD_DEFINITIONS.length} field variations including all bathroom fields, property details, and features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium">Need a template?</h4>
              <p className="text-sm text-gray-600">Download our enhanced Hatch MLS template with all {MLS_FIELD_DEFINITIONS.length} supported fields</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="text-blue-600 border-blue-200">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Enhanced Field Mapping Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Enhanced Field Mapping:</strong> System now includes all bathroom fields (BathroomsFull, BathroomsHalf), 
              property details (PropertyType, PropertySubType, ArchitecturalStyle, YearBuilt, StoriesTotal), 
              address components (StreetNumber, StreetName, StreetSuffix), and comprehensive features 
              (Flooring, PoolFeatures, FireplaceFeatures, KitchenFeatures, PrimarySuite, LaundryFeatures, 
              ConstructionMaterials, Roof, FoundationDetails, ExteriorFeatures, View, WaterSource, Sewer). 
              Agent licensing fields are properly separated (ListingAgentLicense vs ListingOfficeLicense).
            </AlertDescription>
          </Alert>

          {/* Field Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Required Fields ({requiredFields.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                  {requiredFields.slice(0, 10).join(', ')}
                  {requiredFields.length > 10 && ` ... and ${requiredFields.length - 10} more`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Optional Fields ({optionalFields.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                  {optionalFields.slice(0, 10).join(', ')}
                  {optionalFields.length > 10 && ` ... and ${optionalFields.length - 10} more`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file-upload">Select MLS Export File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Choose Export File</span>
                </Button>
              </Label>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: CSV, Excel (.xlsx, .xls) • Max size: 10MB • Max records: 50
              </p>
            </div>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Selected File Info */}
          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Export File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetUpload}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Preview</CardTitle>
                <CardDescription>Preview of your MLS export data with field detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(previewData[0]).slice(0, 6).map(key => {
                          const isRequired = requiredFields.some(field => 
                            field.toLowerCase().includes(key.toLowerCase()) || 
                            key.toLowerCase().includes(field.toLowerCase())
                          )
                          return (
                            <th key={key} className="text-left p-2 font-medium">
                              {key}
                              {isRequired && (
                                <Badge variant="destructive" className="ml-1 text-xs">Required</Badge>
                              )}
                            </th>
                          )
                        })}
                        {Object.keys(previewData[0]).length > 6 && (
                          <th className="text-left p-2 font-medium">...</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).slice(0, 6).map((value: any, i) => (
                            <td key={i} className="p-2 truncate max-w-32">
                              {value?.toString() || ''}
                            </td>
                          ))}
                          {Object.values(row).length > 6 && (
                            <td className="p-2">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing with enhanced field mapping...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={processUpload} 
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? 'Processing with Smart Mapping...' : 'Process Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}