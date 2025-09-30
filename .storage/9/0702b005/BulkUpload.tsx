import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Eye,
  Loader2,
  Settings,
  Target
} from 'lucide-react'
import * as XLSX from 'xlsx'
import FuzzyFieldMapper from '@/components/upload/FuzzyFieldMapper'
import { 
  mapCSVHeaders, 
  validateMLSData, 
  MLS_FIELD_DEFINITIONS,
  type FieldMapping, 
  type ValidationResult 
} from '@/utils/fuzzyFieldMatcher'

interface DraftListing {
  id: string
  status: string
  createdAt: string
  fileName: string
  recordIndex?: number
  fileIndex?: number
  originalData: Record<string, unknown>
  mappedData: Record<string, unknown>
  fieldMatches: Record<string, string>
  validationErrors: Array<{ field: string; message: string; severity: 'error' | 'warning' }>
  validationWarnings: Array<{ field: string; message: string; severity: 'error' | 'warning' }>
  completionPercentage: number
  mlsCompliant: boolean
}

interface BulkUploadProps {
  onUploadComplete: (draftListings: DraftListing[]) => void
  maxFiles?: number
  maxListings?: number
}

interface ProcessingStatus {
  total: number
  processed: number
  successful: number
  failed: number
  errors: string[]
}

interface ParsedFile {
  fileName: string
  headers: string[]
  data: Record<string, unknown>[]
  sampleData: Record<string, unknown>
}

export default function BulkUpload({ 
  onUploadComplete, 
  maxFiles = 100, 
  maxListings = 100 
}: BulkUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([])
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [draftListings, setDraftListings] = useState<DraftListing[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  })
  const [currentStep, setCurrentStep] = useState<'upload' | 'parse' | 'mapping' | 'processing' | 'complete'>('upload')
  const [needsAdvancedMapping, setNeedsAdvancedMapping] = useState(false)

  // Parse uploaded files to extract headers and sample data
  const parseUploadedFiles = async (files: File[]): Promise<ParsedFile[]> => {
    const parsed: ParsedFile[] = []
    
    for (const file of files) {
      try {
        let headers: string[] = []
        let data: Record<string, unknown>[] = []
        
        if (file.name.endsWith('.csv')) {
          const text = await file.text()
          const lines = text.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            throw new Error(`${file.name}: CSV file must contain at least a header row and one data row`)
          }

          const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          
          // Check if this is Field-Value format
          if (csvHeaders.length === 2 && csvHeaders[0].toLowerCase() === 'field' && csvHeaders[1].toLowerCase() === 'value') {
            // Field-Value format - convert to standard format
            const propertyData: Record<string, unknown> = {}
            const extractedHeaders: string[] = []
            
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim()
              const commaIndex = line.indexOf(',')
              
              if (commaIndex > 0) {
                const field = line.substring(0, commaIndex).trim().replace(/^"|"$/g, '')
                const value = line.substring(commaIndex + 1).trim().replace(/^"|"$/g, '')
                
                if (field && value) {
                  propertyData[field] = value
                  extractedHeaders.push(field)
                }
              }
            }
            
            headers = extractedHeaders
            data = [propertyData]
          } else {
            // Traditional CSV format
            headers = csvHeaders
            
            // Parse all data rows
            for (let i = 1; i < Math.min(lines.length, maxListings + 1); i++) {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
              const rowData: Record<string, unknown> = {}
              
              headers.forEach((header, index) => {
                rowData[header] = values[index] || ''
              })
              
              data.push(rowData)
            }
          }
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const buffer = await file.arrayBuffer()
          const workbook = XLSX.read(buffer, { type: 'buffer' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
          
          if (sheetData.length < 2) {
            throw new Error(`${file.name}: Excel file must contain at least a header row and one data row`)
          }
          
          headers = sheetData[0] as string[]
          
          // Parse data rows (limit to maxListings)
          for (let i = 1; i < Math.min(sheetData.length, maxListings + 1); i++) {
            const values = sheetData[i] as unknown[]
            const rowData: Record<string, unknown> = {}
            
            headers.forEach((header, index) => {
              rowData[header] = values[index] || ''
            })
            
            data.push(rowData)
          }
        } else {
          throw new Error(`${file.name}: Unsupported file format`)
        }
        
        parsed.push({
          fileName: file.name,
          headers,
          data,
          sampleData: data[0] || {}
        })
        
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error)
        throw error
      }
    }
    
    return parsed
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log(`📁 ${acceptedFiles.length} files uploaded`)
    
    if (acceptedFiles.length === 0) return
    
    if (acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. Only the first ${maxFiles} files will be processed.`)
      setUploadedFiles(acceptedFiles.slice(0, maxFiles))
    } else {
      setUploadedFiles(acceptedFiles)
    }
    
    setCurrentStep('parse')
  }, [maxFiles])

  // Parse files and extract headers
  const handleParseFiles = async () => {
    try {
      setIsProcessing(true)
      
      console.log('🔍 Enhanced Field Mapping System Status:')
      console.log(`📊 Total MLS Field Definitions: ${MLS_FIELD_DEFINITIONS.length}`)
      console.log('📋 Available Fields:', MLS_FIELD_DEFINITIONS.map(f => f.standardName))
      console.log('🎯 Required Fields:', MLS_FIELD_DEFINITIONS.filter(f => f.required).map(f => f.standardName))
      
      const parsed = await parseUploadedFiles(uploadedFiles)
      setParsedFiles(parsed)
      
      // Combine all unique headers from all files for mapping
      const allHeaders = new Set<string>()
      parsed.forEach(file => {
        console.log(`📄 File: ${file.fileName} - Headers:`, file.headers)
        file.headers.forEach(header => allHeaders.add(header))
      })
      
      // Auto-map fields using the enhanced fuzzy system
      const combinedHeaders = Array.from(allHeaders)
      console.log('🔄 Processing headers for mapping:', combinedHeaders)
      
      const mappingResult = mapCSVHeaders(combinedHeaders, 0.7)
      
      console.log('🎯 Mapping Results:')
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
      
      // Check if we need advanced mapping (missing required fields or low confidence)
      const needsManualReview = mappingResult.missingRequired.length > 0 || 
                               mappingResult.mappings.some(m => m.confidence < 0.8)
      
      console.log(`🤔 Needs manual review: ${needsManualReview}`)
      
      if (needsManualReview) {
        setNeedsAdvancedMapping(true)
        setCurrentStep('mapping')
      } else {
        // Auto-proceed with good mappings
        setFieldMappings(mappingResult.mappings)
        setCurrentStep('processing')
        processWithMappings(mappingResult.mappings)
      }
      
    } catch (error) {
      console.error('Error parsing files:', error)
      alert(`Error parsing files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle mapping completion from the advanced mapper
  const handleMappingComplete = (mappings: FieldMapping[], validation: ValidationResult) => {
    console.log('✅ Advanced mapping completed:', mappings.length, 'mappings')
    setFieldMappings(mappings)
    setValidationResult(validation)
    setCurrentStep('processing')
    processWithMappings(mappings)
  }

  // Process files with field mappings
  const processWithMappings = async (mappings: FieldMapping[]) => {
    setIsProcessing(true)
    
    console.log('🚀 Processing with mappings:', mappings.length)
    
    const processedListings: DraftListing[] = []
    const errors: string[] = []
    let totalRecords = 0
    
    // Count total records
    parsedFiles.forEach(file => {
      totalRecords += file.data.length
    })
    
    setProcessingStatus({
      total: totalRecords,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    })

    let processedCount = 0

    // Process each file
    for (const file of parsedFiles) {
      console.log(`📋 Processing file: ${file.fileName} with ${file.data.length} records`)
      
      // Process each record in the file
      for (let i = 0; i < file.data.length; i++) {
        const record = file.data[i]
        
        try {
          // Apply field mappings
          const mappedData: Record<string, unknown> = {}
          const fieldMatches: Record<string, string> = {}
          
          // Map fields according to the field mappings
          mappings.forEach(mapping => {
            if (record[mapping.inputField] !== undefined) {
              mappedData[mapping.mlsField.standardName] = record[mapping.inputField]
              fieldMatches[mapping.mlsField.standardName] = mapping.inputField
            }
          })
          
          // Keep unmapped fields as-is
          Object.keys(record).forEach(key => {
            const isMapped = mappings.some(m => m.inputField === key)
            if (!isMapped) {
              mappedData[key] = record[key]
            }
          })
          
          // Validate the mapped data
          const validation = validateMLSData(record, mappings)
          
          // Create draft listing
          const draftListing: DraftListing = {
            id: `draft_${Date.now()}_${processedCount}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'draft',
            createdAt: new Date().toISOString(),
            fileName: file.fileName,
            recordIndex: i + 1,
            originalData: record,
            mappedData: mappedData,
            fieldMatches: fieldMatches,
            validationErrors: validation.errors,
            validationWarnings: validation.warnings,
            completionPercentage: validation.completionPercentage,
            mlsCompliant: validation.isValid
          }
          
          processedListings.push(draftListing)
          
          setProcessingStatus(prev => ({
            ...prev,
            processed: processedCount + 1,
            successful: prev.successful + 1
          }))
          
        } catch (error) {
          const errorMsg = `File "${file.fileName}" record ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          
          setProcessingStatus(prev => ({
            ...prev,
            processed: processedCount + 1,
            failed: prev.failed + 1,
            errors: [...prev.errors, errorMsg]
          }))
        }
        
        processedCount++
        
        // Small delay to show progress
        if (processedCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    }
    
    console.log(`🎯 Processing complete: ${processedListings.length} successful, ${errors.length} failed`)
    console.log('📊 Sample mapped data:', processedListings[0]?.mappedData)
    console.log('🔗 Field matches:', processedListings[0]?.fieldMatches)
    
    setDraftListings(processedListings)
    setIsProcessing(false)
    setCurrentStep('complete')
  }

  const handleComplete = () => {
    console.log(`📤 Sending ${draftListings.length} draft listings to parent component`)
    onUploadComplete(draftListings)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true,
    disabled: currentStep !== 'upload'
  })

  const resetUpload = () => {
    setUploadedFiles([])
    setParsedFiles([])
    setFieldMappings([])
    setValidationResult(null)
    setDraftListings([])
    setIsProcessing(false)
    setProcessingStatus({ total: 0, processed: 0, successful: 0, failed: 0, errors: [] })
    setCurrentStep('upload')
    setNeedsAdvancedMapping(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Field Mapping Active:</strong> System loaded with {MLS_FIELD_DEFINITIONS.length} MLS field definitions including all bathroom fields, property details, and features. Check browser console for detailed mapping logs.
        </AlertDescription>
      </Alert>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-6 overflow-x-auto">
        {[
          { key: 'upload', label: 'Upload', icon: Upload },
          { key: 'parse', label: 'Parse', icon: FileText },
          { key: 'mapping', label: 'Smart Mapping', icon: Target },
          { key: 'processing', label: 'Processing', icon: Loader2 },
          { key: 'complete', label: 'Complete', icon: CheckCircle }
        ].map(({ key, label, icon: Icon }, index) => (
          <div key={key} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep === key 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : index < ['upload', 'parse', 'mapping', 'processing', 'complete'].indexOf(currentStep)
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-gray-300 text-gray-400'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`ml-2 text-sm whitespace-nowrap ${
              currentStep === key ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {label}
            </span>
            {index < 4 && <div className="w-8 h-px bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>

      <Tabs value={currentStep} className="w-full">
        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload MLS Data Files
                </h3>
                <p className="text-gray-600 mb-4">
                  {isDragActive 
                    ? 'Drop your files here...' 
                    : 'Drag and drop CSV or Excel files here, or click to browse'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Enhanced with AI-powered field mapping • Up to {maxFiles} files • Up to {maxListings} listings per file
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Smart Field Mapping:</strong> Our AI system automatically detects and maps field variations across different MLS formats, ensuring accurate data import regardless of naming conventions.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Parse Tab */}
        <TabsContent value="parse" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Parse Files</h3>
                  <p className="text-sm text-gray-600">
                    Analyzing {uploadedFiles.length} files for field structure
                  </p>
                </div>
                <Button variant="outline" onClick={resetUpload}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <h4 className="font-medium mb-2">Selected Files:</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={resetUpload}>
                      Select Different Files
                    </Button>
                    <Button 
                      onClick={handleParseFiles} 
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          Parse & Map Fields
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Mapping Tab - Only shows when needed */}
        <TabsContent value="mapping" className="space-y-4">
          {needsAdvancedMapping && parsedFiles.length > 0 && (
            <FuzzyFieldMapper
              csvHeaders={Array.from(new Set(parsedFiles.flatMap(f => f.headers)))}
              sampleData={parsedFiles.map(f => f.sampleData)}
              onMappingComplete={handleMappingComplete}
              onCancel={resetUpload}
            />
          )}
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                <h3 className="text-lg font-semibold">Processing with Smart Field Mapping</h3>
                <p className="text-gray-600">
                  Processing record {processingStatus.processed} of {processingStatus.total}
                </p>
                
                <Progress 
                  value={(processingStatus.processed / processingStatus.total) * 100} 
                  className="w-full max-w-md mx-auto"
                />
                
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="text-green-600">
                    ✅ Successful: {processingStatus.successful}
                  </div>
                  <div className="text-red-600">
                    ❌ Failed: {processingStatus.failed}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complete Tab */}
        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-green-900">Smart Processing Complete!</h3>
                
                <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Records:</span>
                      <span className="font-medium">{processingStatus.total}</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span>Successfully Processed:</span>
                      <span className="font-medium">{processingStatus.successful}</span>
                    </div>
                    <div className="flex justify-between text-blue-700">
                      <span>Field Mappings Applied:</span>
                      <span className="font-medium">{fieldMappings.length}</span>
                    </div>
                    {processingStatus.failed > 0 && (
                      <div className="flex justify-between text-red-700">
                        <span>Failed:</span>
                        <span className="font-medium">{processingStatus.failed}</span>
                      </div>
                    )}
                  </div>
                </div>

                {processingStatus.errors.length > 0 && (
                  <Alert className="max-w-md mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <details>
                        <summary className="cursor-pointer font-medium">
                          {processingStatus.failed} records failed to process
                        </summary>
                        <div className="mt-2 space-y-1 text-xs">
                          {processingStatus.errors.map((error, index) => (
                            <div key={index} className="text-red-600">{error}</div>
                          ))}
                        </div>
                      </details>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center space-x-3">
                  <Button variant="outline" onClick={resetUpload}>
                    Upload More Files
                  </Button>
                  <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                    Create {draftListings.length} Draft Listings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}