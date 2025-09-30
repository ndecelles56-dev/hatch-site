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
  parseStreetAddress,
  processFieldValueCSV,
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

// Enhanced CSV parser with Field,Value format support
const parseCSV = (csvText: string): Record<string, any>[] => {
  const lines = csvText.trim().split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  // Check if this is a Field,Value format (vertical format)
  const firstLine = lines[0].toLowerCase()
  if (firstLine.includes('field') && firstLine.includes('value')) {
    console.log('📝 Detected Field,Value CSV format')
    
    // This is a Field,Value format - single listing
    const listing: Record<string, any> = {}
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const commaIndex = line.indexOf(',')
      if (commaIndex > 0) {
        const field = line.substring(0, commaIndex).trim().replace(/"/g, '')
        const value = line.substring(commaIndex + 1).trim().replace(/"/g, '')
        if (field && value) {
          listing[field] = value
          
          // Enhanced field processing for specific features
          if (field.toLowerCase().includes('address') && !field.toLowerCase().includes('email')) {
            console.log(`🏠 Processing address field: ${field} = ${value}`)
            const addressComponents = parseStreetAddress(value)
            listing['Street Number'] = addressComponents.streetNumber
            listing['Street Name'] = addressComponents.streetName  
            listing['Street Suffix'] = addressComponents.streetSuffix
            console.log(`📍 Parsed address: ${addressComponents.streetNumber} ${addressComponents.streetName} ${addressComponents.streetSuffix}`)
          }
        }
      }
    }
    
    console.log('✅ Parsed Field,Value CSV with', Object.keys(listing).length, 'fields')
    return [listing] // Return array with single listing
  } else {
    console.log('📊 Detected traditional CSV format')
    
    // Traditional CSV format with headers and multiple rows
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    const records = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        return obj
      })
    
    // Process each record for address parsing
    return records.map(record => {
      const processed = { ...record }
      
      // Look for address fields and parse them
      const addressFields = Object.keys(record).filter(key => 
        key.toLowerCase().includes('address') && !key.toLowerCase().includes('email')
      )
      
      for (const field of addressFields) {
        if (record[field]) {
          console.log(`🏠 Processing address field: ${field} = ${record[field]}`)
          const addressComponents = parseStreetAddress(record[field])
          processed['Street Number'] = addressComponents.streetNumber
          processed['Street Name'] = addressComponents.streetName
          processed['Street Suffix'] = addressComponents.streetSuffix
          console.log(`📍 Parsed address: ${addressComponents.streetNumber} ${addressComponents.streetName} ${addressComponents.streetSuffix}`)
          break
        }
      }
      
      return processed
    })
  }
}

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
            // Parse CSV using our enhanced parser
            const text = data as string
            jsonData = parseCSV(text)
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
    
    console.log('🔍 Available headers for mapping:', headers)
    
    // Use enhanced fuzzy field matching to map headers
    const mappingResult = mapCSVHeaders(headers, 0.7)
    fieldMappings = mappingResult.mappings

    console.log('🎯 Enhanced Field Mapping Results:')
    console.log(`✅ Mapped: ${mappingResult.mappings.length} fields`)
    console.log(`❌ Unmapped: ${mappingResult.unmapped.length} fields`)
    console.log(`⚠️ Missing Required: ${mappingResult.missingRequired.length} fields`)

    // Log detailed mapping results
    mappingResult.mappings.forEach(mapping => {
      console.log(`  📋 ${mapping.inputField} → ${mapping.mlsField.standardName} (${Math.round(mapping.confidence * 100)}% confidence)`)
    })

    if (mappingResult.unmapped.length > 0) {
      console.log('❌ Unmapped fields:', mappingResult.unmapped)
    }

    if (mappingResult.missingRequired.length > 0) {
      console.log('⚠️ Missing required fields:', mappingResult.missingRequired.map(f => f.standardName))
    }

    // Enhanced validation for each record
    data.forEach((row, index) => {
      // Validate using the enhanced fuzzy field matcher
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

      // Enhanced photo validation
      const photoMappings = fieldMappings.filter(m => m.mlsField.standardName === 'PhotoURLs')
      if (photoMappings.length > 0) {
        const photoField = photoMappings[0].inputField
        const photos = row[photoField]
        if (!photos || (photos && photos.split(',').length < 4)) {
          validationErrors.push({
            row: index + 1,
            field: 'PhotoURLs',
            type: 'photos',
            message: 'Minimum 4 photos required for MLS compliance'
          })
        }
      }

      // Enhanced price validation
      const priceMappings = fieldMappings.filter(m => m.mlsField.standardName === 'ListPrice')
      if (priceMappings.length > 0) {
        const priceField = priceMappings[0].inputField
        const price = row[priceField]
        if (price && isNaN(parseFloat(price))) {
          validationErrors.push({
            row: index + 1,
            field: 'ListPrice',
            type: 'format',
            message: 'Invalid price format - must be a number'
          })
        } else if (price && parseFloat(price) <= 0) {
          validationErrors.push({
            row: index + 1,
            field: 'ListPrice',
            type: 'format',
            message: 'List price must be greater than zero'
          })
        }
      }

      // Enhanced MLS Number validation
      const mlsMappings = fieldMappings.filter(m => m.mlsField.standardName === 'MLSNumber')
      if (mlsMappings.length > 0) {
        const mlsField = mlsMappings[0].inputField
        const mlsNumber = row[mlsField]
        if (mlsNumber && mlsNumber.toString().trim().length < 3) {
          validationErrors.push({
            row: index + 1,
            field: 'MLSNumber',
            type: 'format',
            message: 'MLS Number appears to be too short (minimum 3 characters)'
          })
        }
      }

      // Validate address components if parsed
      if (row['Street Number'] && row['Street Name']) {
        console.log(`✅ Address components validated for row ${index + 1}`)
      }
    })

    return { validationErrors, fieldMappings }
  }

  const processUpload = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setUploadProgress(0)

    try {
      console.log('🚀 Starting enhanced MLS file processing...')
      setUploadProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Read and process file data with enhanced parsing
      const data = await readFileData(selectedFile)
      console.log('📊 Processed', data.length, 'records from', selectedFile.name)
      setUploadProgress(40)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Enhanced validation with fuzzy field matching
      const { validationErrors, fieldMappings } = validateListingData(data)
      console.log('🔍 Validation complete:', validationErrors.length, 'issues found')
      setUploadProgress(60)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Calculate enhanced statistics
      const requiredErrors = validationErrors.filter(e => e.type === 'required')
      const optionalErrors = validationErrors.filter(e => e.type === 'optional')
      
      const validRecords = data.length - new Set(requiredErrors.map(e => e.row)).size
      const requiredFieldsComplete = data.length - new Set(requiredErrors.map(e => e.row)).size
      const optionalFieldsComplete = data.length - new Set(optionalErrors.map(e => e.row)).size

      setUploadProgress(80)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Create enhanced draft listing with all new features
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
        data, // Enhanced processed data with address parsing
        validationErrors,
        fieldMapping: fieldMappings, // Enhanced fuzzy field mappings
        mlsCompliant: requiredErrors.length === 0,
        completionPercentage: Math.round(
          (requiredFieldsComplete / data.length) * 100
        )
      }

      console.log('✅ Enhanced draft listing created:', draftListing.id)
      console.log('📋 Field mappings:', fieldMappings.map(m => `${m.inputField} → ${m.mlsField.standardName}`))

      setUploadProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))

      onUploadComplete(draftListing)
      onClose()
      resetUpload()

    } catch (error) {
      console.error('❌ Enhanced processing error:', error)
      setUploadError('Error processing file with enhanced features. Please try again.')
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
    // Create a link to download the enhanced Hatch MLS Template
    const link = document.createElement('a')
    link.href = '/templates/Enhanced_Hatch_MLS_Template.csv'
    link.download = 'Enhanced_Hatch_MLS_Template.csv'
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
            Enhanced MLS Data Upload with Smart Field Mapping
          </DialogTitle>
          <DialogDescription>
            Upload MLS export files with intelligent field mapping. System detects {MLS_FIELD_DEFINITIONS.length} field variations including address parsing, bathroom fields, property features, and more.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Template Download */}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium">Need a template?</h4>
              <p className="text-sm text-gray-600">Download our enhanced Hatch MLS template with all {MLS_FIELD_DEFINITIONS.length} supported fields including new feature categories</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="text-blue-600 border-blue-200">
              <Download className="w-4 h-4 mr-2" />
              Download Enhanced Template
            </Button>
          </div>

          {/* Enhanced Field Mapping Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>🎯 Enhanced Smart Mapping:</strong> System now includes automatic address parsing (Street Number, Street Name, Street Suffix), 
              all bathroom fields (BathroomsFull, BathroomsHalf), enhanced property features (ArchitecturalStyle, Flooring, PoolFeatures, 
              FireplaceFeatures, KitchenFeatures, PrimarySuite, LaundryFeatures, ConstructionMaterials, Roof, FoundationDetails, 
              ExteriorFeatures, View, WaterSource, Sewer, HeatingType, CoolingType), and Parcel ID detection. 
              Field,Value CSV format fully supported with fuzzy matching.
            </AlertDescription>
          </Alert>

          {/* Enhanced Field Summary */}
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
                <CardTitle className="text-sm">Enhanced Optional Fields ({optionalFields.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                  ArchitecturalStyle, Flooring, PoolFeatures, FireplaceFeatures, KitchenFeatures, PrimarySuite, LaundryFeatures, 
                  ConstructionMaterials, Roof, FoundationDetails, ExteriorFeatures, View, WaterSource, Sewer, HeatingType, CoolingType, ParcelID
                  {optionalFields.length > 17 && ` ... and ${optionalFields.length - 17} more`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file-upload">Select Enhanced MLS Export File</Label>
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
                  <span>Choose Enhanced Export File</span>
                </Button>
              </Label>
              <p className="text-sm text-gray-500 mt-2">
                Supports Field,Value CSV format • Enhanced address parsing • Smart feature detection • Max size: 10MB • Max records: 50
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
                <CardTitle className="text-lg">Selected Enhanced Export File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Enhanced processing enabled
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetUpload}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Preview Data */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enhanced Data Preview</CardTitle>
                <CardDescription>Preview of your MLS export data with smart field detection and address parsing</CardDescription>
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
                          const isEnhanced = ['Street Number', 'Street Name', 'Street Suffix', 'Architectural Style', 'Flooring', 'Pool Features'].includes(key)
                          return (
                            <th key={key} className="text-left p-2 font-medium">
                              {key}
                              {isRequired && (
                                <Badge variant="destructive" className="ml-1 text-xs">Required</Badge>
                              )}
                              {isEnhanced && (
                                <Badge variant="secondary" className="ml-1 text-xs">Enhanced</Badge>
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

          {/* Enhanced Processing Progress */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing with enhanced smart mapping and address parsing...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <div className="text-xs text-gray-500">
                    Detecting field variations • Parsing addresses • Validating features • Mapping {MLS_FIELD_DEFINITIONS.length} field types
                  </div>
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
            {isProcessing ? 'Processing with Enhanced Smart Mapping...' : 'Process Enhanced Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}