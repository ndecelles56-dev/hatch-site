import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye,
  Download,
  FileText,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { 
  mapCSVHeaders, 
  validateMLSData, 
  MLS_FIELD_DEFINITIONS,
  type FieldMapping,
  type ValidationResult 
} from '@/utils/fuzzyFieldMatcher'

interface BulkListingUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (result: any) => void
}

interface ProcessedFile {
  fileName: string
  data: Record<string, any>[]
  fieldMapping: FieldMapping[]
  validationResult: ValidationResult
  uploadDate: string
  id: string
}

export default function BulkListingUpload({ isOpen, onClose, onUploadComplete }: BulkListingUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'complete'>('upload')
  const [error, setError] = useState<string | null>(null)
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    if (selectedFiles.length === 0) return

    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop()
      return ['csv', 'xlsx', 'xls'].includes(extension || '')
    })

    if (validFiles.length !== selectedFiles.length) {
      setError('Some files have unsupported formats. Only CSV and Excel files are allowed.')
      return
    }

    // Validate file sizes (10MB limit per file)
    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 10MB per file.`)
      return
    }

    if (validFiles.length > 10) {
      setError('Maximum 10 files allowed per upload.')
      return
    }

    setFiles(validFiles)
    setError(null)
  }

  const parseCSVData = (csvText: string): Record<string, any>[] => {
    // Check if it's vertical format (Field,Value)
    const lines = csvText.trim().split('\n')
    if (lines.length > 1) {
      const firstLine = lines[0].split(',')
      const secondLine = lines[1].split(',')
      
      // If first column looks like field names and second column has values
      if (firstLine.length === 2 && secondLine.length === 2 && 
          firstLine[0].toLowerCase().includes('field') || 
          firstLine[0].match(/^[A-Za-z]/)) {
        
        // Convert vertical format to horizontal
        const record: Record<string, any> = {}
        lines.forEach(line => {
          const [field, value] = line.split(',').map(s => s.trim().replace(/"/g, ''))
          if (field && field !== 'Field' && value !== undefined) {
            record[field] = value
          }
        })
        return [record]
      }
    }

    // Parse as regular horizontal CSV
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim()
    })

    if (result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors)
    }

    return result.data as Record<string, any>[]
  }

  const parseExcelData = (buffer: ArrayBuffer): Record<string, any>[] => {
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    return XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    }).slice(1).map((row: any[]) => {
      const record: Record<string, any> = {}
      const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[]
      
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          record[header.toString().trim()] = row[index]
        }
      })
      
      return record
    }).filter(record => Object.keys(record).length > 0)
  }

  const processFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setCurrentStep('preview')
    setError(null)

    const processed: ProcessedFile[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProcessingProgress((i / files.length) * 100)

        console.log(`📁 Processing file: ${file.name}`)

        let data: Record<string, any>[] = []

        if (file.name.toLowerCase().endsWith('.csv')) {
          const text = await file.text()
          data = parseCSVData(text)
        } else {
          const buffer = await file.arrayBuffer()
          data = parseExcelData(buffer)
        }

        if (data.length === 0) {
          throw new Error(`No data found in ${file.name}`)
        }

        if (data.length > 50) {
          data = data.slice(0, 50)
          console.warn(`File ${file.name} truncated to 50 records`)
        }

        // Get headers from the data
        const headers = Object.keys(data[0] || {})
        console.log(`📊 Headers found in ${file.name}:`, headers)

        // Map headers to MLS fields
        const mappingResult = mapCSVHeaders(headers, 0.7)
        console.log(`🔗 Field mapping for ${file.name}:`, mappingResult)

        // Validate the mapped data
        const validationResult = validateMLSData(data[0] || {}, mappingResult.mappings)
        console.log(`✅ Validation result for ${file.name}:`, validationResult)

        const processedFile: ProcessedFile = {
          fileName: file.name,
          data,
          fieldMapping: mappingResult.mappings,
          validationResult,
          uploadDate: new Date().toISOString(),
          id: `upload_${Date.now()}_${i}`
        }

        processed.push(processedFile)
      }

      setProcessedFiles(processed)
      setProcessingProgress(100)
      
      console.log('🎉 All files processed successfully:', processed)
      
    } catch (err) {
      console.error('❌ Error processing files:', err)
      setError(err instanceof Error ? err.message : 'Failed to process files')
      setCurrentStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUploadComplete = () => {
    if (processedFiles.length === 0) return

    // For multiple files, we'll process them one by one
    processedFiles.forEach((processedFile, index) => {
      setTimeout(() => {
        onUploadComplete(processedFile)
      }, index * 100) // Small delay between files
    })

    setCurrentStep('complete')
    
    // Reset after a delay
    setTimeout(() => {
      handleReset()
      onClose()
    }, 2000)
  }

  const handleReset = () => {
    setFiles([])
    setProcessedFiles([])
    setIsProcessing(false)
    setProcessingProgress(0)
    setCurrentStep('upload')
    setError(null)
    setSelectedFileIndex(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const selectedFile = processedFiles[selectedFileIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Enhanced MLS Bulk Upload
          </DialogTitle>
          <DialogDescription>
            Upload multiple MLS export files with intelligent field mapping and validation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Upload Files</span>
              </div>
              <div className={`flex items-center gap-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Preview & Validate</span>
              </div>
              <div className={`flex items-center gap-2 ${currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Step 1: File Upload */}
          {currentStep === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Choose MLS Export Files</span>
                  </Button>
                </Label>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: CSV, Excel (.xlsx, .xls) • Max size: 10MB per file • Max files: 10 • Max records: 50 per file
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files ({files.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFiles = files.filter((_, i) => i !== index)
                            setFiles(newFiles)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={processFiles} 
                  disabled={files.length === 0 || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Process Files ({files.length})
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Processing & Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Processing files with enhanced field mapping...</p>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Processing Results</h3>
                    <Badge variant="secondary">{processedFiles.length} files processed</Badge>
                  </div>

                  {processedFiles.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {processedFiles.map((file, index) => (
                        <Button
                          key={index}
                          variant={selectedFileIndex === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedFileIndex(index)}
                          className="whitespace-nowrap"
                        >
                          {file.fileName}
                        </Button>
                      ))}
                    </div>
                  )}

                  {selectedFile && (
                    <Tabs defaultValue="mapping" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
                        <TabsTrigger value="validation">Validation</TabsTrigger>
                        <TabsTrigger value="preview">Data Preview</TabsTrigger>
                      </TabsList>

                      <TabsContent value="mapping" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              Enhanced Field Mapping Results
                            </CardTitle>
                            <CardDescription>
                              Intelligent mapping of {selectedFile.fieldMapping.length} fields detected in {selectedFile.fileName}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-64">
                              <div className="space-y-2">
                                {selectedFile.fieldMapping.map((mapping, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{mapping.inputField}</div>
                                      <div className="text-xs text-gray-500">→ {mapping.mlsField.standardName}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={mapping.confidence === 1 ? "default" : "secondary"}>
                                        {Math.round(mapping.confidence * 100)}%
                                      </Badge>
                                      {mapping.isRequired && (
                                        <Badge variant="destructive" className="text-xs">Required</Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="validation" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              Validation Results
                            </CardTitle>
                            <CardDescription>
                              Data quality assessment for {selectedFile.fileName}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Completion Rate</span>
                              <Badge variant={selectedFile.validationResult.completionPercentage > 80 ? "default" : "secondary"}>
                                {selectedFile.validationResult.completionPercentage}%
                              </Badge>
                            </div>

                            {selectedFile.validationResult.errors.length > 0 && (
                              <div>
                                <h4 className="font-medium text-red-600 mb-2">Errors ({selectedFile.validationResult.errors.length})</h4>
                                <ScrollArea className="h-32">
                                  <div className="space-y-1">
                                    {selectedFile.validationResult.errors.map((error, index) => (
                                      <div key={index} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                                        <strong>{error.field}:</strong> {error.message}
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}

                            {selectedFile.validationResult.warnings.length > 0 && (
                              <div>
                                <h4 className="font-medium text-yellow-600 mb-2">Warnings ({selectedFile.validationResult.warnings.length})</h4>
                                <ScrollArea className="h-32">
                                  <div className="space-y-1">
                                    {selectedFile.validationResult.warnings.map((warning, index) => (
                                      <div key={index} className="text-sm text-yellow-600 p-2 bg-yellow-50 rounded">
                                        <strong>{warning.field}:</strong> {warning.message}
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}

                            {selectedFile.validationResult.errors.length === 0 && selectedFile.validationResult.warnings.length === 0 && (
                              <div className="text-center py-4">
                                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-green-600 font-medium">All validations passed!</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="preview" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Eye className="w-5 h-5" />
                              Data Preview
                            </CardTitle>
                            <CardDescription>
                              First few records from {selectedFile.fileName} ({selectedFile.data.length} total records)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-64">
                              <div className="space-y-4">
                                {selectedFile.data.slice(0, 3).map((record, index) => (
                                  <div key={index} className="border rounded p-3">
                                    <h5 className="font-medium mb-2">Record {index + 1}</h5>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      {Object.entries(record).slice(0, 6).map(([key, value]) => (
                                        <div key={key}>
                                          <span className="font-medium text-gray-600">{key}:</span>
                                          <span className="ml-2">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      Start Over
                    </Button>
                    <Button 
                      onClick={handleUploadComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Import All Files ({processedFiles.length})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-600 mb-2">Upload Complete!</h3>
              <p className="text-gray-600">
                Successfully imported {processedFiles.length} file(s) with enhanced field mapping.
              </p>
              <div className="mt-4 space-y-1">
                {processedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-gray-500">
                    ✓ {file.fileName} - {file.data.length} records
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}