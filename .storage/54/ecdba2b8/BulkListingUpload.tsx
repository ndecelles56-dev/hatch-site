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
  processMLSRecord,
  parseStreetAddress,
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
    // This is a Field,Value format - single listing
    const listing: Record<string, any> = {}
    
    console.log('📋 Detected Field,Value format CSV')
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const commaIndex = line.indexOf(',')
      if (commaIndex > 0) {
        const field = line.substring(0, commaIndex).trim().replace(/"/g, '')
        const value = line.substring(commaIndex + 1).trim().replace(/"/g, '')
        if (field && value && value !== '') {
          listing[field] = value
          console.log(`  📝 Field: "${field}" = "${value}"`)
        }
      }
    }
    
    console.log(`✅ Parsed ${Object.keys(listing).length} fields from Field,Value format`)
    return [listing] // Return array with single listing
  } else {
    // Traditional CSV format with headers and multiple rows
    console.log('📋 Detected traditional CSV format')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    return lines.slice(1)
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
    
    console.log('🔍 Starting Enhanced Field Mapping')
    console.log(`📋 Headers found: ${headers.length}`)
    headers.forEach(header => console.log(`  - "${header}"`))
    
    // Use enhanced fuzzy field matching to map headers
    const mappingResult = mapCSVHeaders(headers, 0.6) // Lower threshold for better matching
    fieldMappings = mappingResult.mappings

    console.log('🎯 Enhanced Field Mapping Results:')
    console.log(`✅ Successfully mapped: ${mappingResult.mappings.length} fields`)
    console.log(`❌ Unmapped fields: ${mappingResult.unmapped.length}`)
    console.log(`⚠️ Missing required fields: ${mappingResult.missingRequired.length}`)

    // Log detailed mapping results
    mappingResult.mappings.forEach(mapping => {
      console.log(`  ✅ "${mapping.inputField}" → ${mapping.mlsField.standardName} (${Math.round(mapping.confidence * 100)}% confidence, ${mapping.isRequired ? 'Required' : 'Optional'})`)
    })

    if (mappingResult.unmapped.length > 0) {
      console.log('❌ Unmapped fields:')
      mappingResult.unmapped.forEach(field => console.log(`  - "${field}"`))
    }

    if (mappingResult.missingRequired.length > 0) {
      console.log('⚠️ Missing required fields:')
      mappingResult.missingRequired.forEach(field => console.log(`  - ${field.standardName}`))
    }

    // Process each record with enhanced processing
    data.forEach((row, index) => {
      console.log(`🔄 Processing record ${index + 1}`)
      
      // Apply enhanced processing including address parsing
      const processedRecord = processMLSRecord(row, fieldMappings)
      
      // Update the original record with processed data
      Object.assign(row, processedRecord)
      
      // Validate using the enhanced field matcher
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

      // Don't add fake photos - only process if photos are actually present
      const photoMappings = fieldMappings.filter(m => m.mlsField.standardName === 'PhotoURLs')
      if (photoMappings.length > 0) {
        const photoField = photoMappings[0].inputField
        const photos = row[photoField]
        if (photos && photos.trim() !== '') {
          const photoCount = photos.split(',').filter((url: string) => url.trim() !== '').length
          if (photoCount < 4) {
            validationErrors.push({
              row: index + 1,
              field: 'PhotoURLs',
              type: 'photos',
              message: `Only ${photoCount} photos provided, minimum 4 required`
            })
          }
        } else {
          validationErrors.push({
            row: index + 1,
            field: 'PhotoURLs',
            type: 'photos',
            message: 'No photos provided, minimum 4 required'
          })
        }
      } else {
        validationErrors.push({
          row: index + 1,
          field: 'PhotoURLs',
          type: 'photos',
          message: 'No photo field found, minimum 4 photos required'
        })
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

    console.log(`📊 Validation Summary:`)
    console.log(`  ✅ Total validation errors: ${validationErrors.length}`)
    console.log(`  📋 Field mappings created: ${fieldMappings.length}`)

    return { validationErrors, fieldMappings }
  }

  const processUpload = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setUploadProgress(0)

    try {
      console.log(`🚀 Starting enhanced upload process for: ${selectedFile.name}`)
      
      setUploadProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Read real file data (no fake generation)
      const data = await readFileData(selectedFile)
      console.log(`📄 File data loaded: ${data.length} records`)
      
      setUploadProgress(40)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Validate real data using enhanced fuzzy field matching
      const { validationErrors, fieldMappings } = validateListingData(data)
      console.log(`🔍 Validation completed: ${validationErrors.length} errors found`)
      
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

      // Calculate actual photo count (don't add fake photos)
      const actualPhotosCount = data.reduce((sum, row) => {
        const photoMappings = fieldMappings.filter(m => m.mlsField.standardName === 'PhotoURLs')
        if (photoMappings.length > 0) {
          const photoField = photoMappings[0].inputField
          const photos = row[photoField]
          if (photos && photos.trim() !== '') {
            return sum + photos.split(',').filter((url: string) => url.trim() !== '').length
          }
        }
        return sum
      }, 0)

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
        photosCount: actualPhotosCount, // Use actual photo count
        data, // Real processed data
        validationErrors,
        fieldMapping: fieldMappings, // Use the enhanced fuzzy field mappings
        mlsCompliant: requiredErrors.length === 0,
        completionPercentage: Math.round(
          (requiredFieldsComplete / data.length) * 100
        )
      }

      console.log(`✅ Draft listing created:`)
      console.log(`  📊 Total records: ${draftListing.totalRecords}`)
      console.log(`  ✅ Valid records: ${draftListing.validRecords}`)
      console.log(`  ❌ Error records: ${draftListing.errorRecords}`)
      console.log(`  📸 Actual photos: ${draftListing.photosCount}`)
      console.log(`  📋 Field mappings: ${draftListing.fieldMapping.length}`)
      console.log(`  📈 Completion: ${draftListing.completionPercentage}%`)

      setUploadProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))

      onUploadComplete(draftListing)
      onClose()
      resetUpload()

    } catch (error) {
      console.error('❌ Upload processing error:', error)
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
            Upload MLS export files with intelligent field mapping and address parsing. System detects {MLS_FIELD_DEFINITIONS.length} field variations including all bathroom fields, property details, and comprehensive features.
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
              <strong>Enhanced Features:</strong> 
              • Intelligent address parsing (splits "4528 Blue Heron Way" into number, name, suffix)
              • Field,Value CSV format support (vertical format)
              • Fuzzy field matching for all bathroom fields, property details, and features
              • Parcel ID detection and mapping
              • No fake photo generation - only processes actual photo data
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
                <CardDescription>Preview of your MLS export data with enhanced field detection</CardDescription>
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
                    <span className="text-sm font-medium">Processing with enhanced field mapping and address parsing...</span>
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
            {isProcessing ? 'Processing with Enhanced Mapping...' : 'Process Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}