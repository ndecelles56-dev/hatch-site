import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Target,
  Loader2
} from 'lucide-react'
import { mapCSVHeaders, validateMLSData } from '@/utils/fuzzyFieldMatcher'

// Local structural types to avoid relying on module type exports
export type FieldMapping = {
  input: string
  output: string
  confidence: number
  isRequired?: boolean
}

type ValidationIssue = { message: string }
export type ValidationResult = {
  isValid: boolean
  completionPercentage: number
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

interface FuzzyFieldMapperProps {
  csvHeaders: string[]
  sampleData: Record<string, unknown>[]
  onMappingComplete: (mappings: FieldMapping[], validationResult: ValidationResult) => void
  onCancel: () => void
}

export default function FuzzyFieldMapper({
  csvHeaders,
  sampleData,
  onMappingComplete,
  onCancel
}: FuzzyFieldMapperProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)

  // Auto-process mapping on component mount
  useEffect(() => {
    const processMapping = async () => {
      setIsProcessing(true)
      setProgress(20)
      
      // Simulate processing steps for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress(40)
      
      // Perform actual mapping
      const result = mapCSVHeaders(csvHeaders) as any
      const mapped = Array.isArray(result?.mappings)
        ? (result.mappings as FieldMapping[])
        : (Array.isArray(result) ? (result as FieldMapping[]) : [])

      console.debug('[FuzzyFieldMapper] csvHeaders =', csvHeaders)
      console.debug('[FuzzyFieldMapper] mapping result =', result)
      setMappings(mapped)
      setProgress(70)
      
      // Validate sample data if available
      if (sampleData.length > 0) {
        const raw = validateMLSData(sampleData[0]) as { valid: boolean; missing: string[] }

        // Derive a completion percentage using required fields if available, otherwise fall back to missing vs total mapped
        const requiredCount = mapped.filter(m => m.isRequired).length
        const denom = Math.max(requiredCount || mapped.length || 1, raw.missing.length || 0)
        const completion = Math.max(0, Math.min(100, Math.round(100 - (raw.missing.length / denom) * 100)))

        const normalized: ValidationResult = {
          isValid: raw.valid,
          completionPercentage: completion,
          errors: (raw.missing || []).map((f) => ({ message: `Missing required field: ${f}` })),
          warnings: []
        }
        setValidationResult(normalized)
      }
      
      setProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))
      setIsProcessing(false)
    }

    processMapping()
  }, [csvHeaders, sampleData])

  const handleContinue = () => {
    if (validationResult && mappings.length > 0) {
      onMappingComplete(mappings, validationResult)
    }
  }

  const getMappingStats = () => {
    const requiredMapped = mappings.filter(m => m.isRequired).length
    const totalMapped = mappings.length
    const highConfidence = mappings.filter(m => m.confidence >= 0.9).length
    
    return { requiredMapped, totalMapped, highConfidence }
  }

  const stats = getMappingStats()
  const canProceed = validationResult && validationResult.errors.length === 0

  if (isProcessing) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Smart Field Mapping in Progress</h3>
              <p className="text-gray-600 mb-4">
                Analyzing {csvHeaders.length} fields and applying intelligent mapping...
              </p>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Field Mapping Complete</h2>
        <p className="text-gray-600">
          Successfully analyzed and mapped your MLS fields
        </p>
      </div>

      {/* Mapping Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Mapping Results
          </CardTitle>
          <CardDescription>
            Automatic field mapping has been applied to your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalMapped}</div>
              <div className="text-sm text-gray-600">Fields Mapped</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.highConfidence}</div>
              <div className="text-sm text-gray-600">High Confidence</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.requiredMapped}</div>
              <div className="text-sm text-gray-600">Required Fields</div>
            </div>
          </div>

          {validationResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium">
                    {validationResult.isValid ? 'Validation Passed' : 'Minor Issues Detected'}
                  </span>
                </div>
                <Badge variant={validationResult.isValid ? 'default' : 'secondary'}>
                  {validationResult.completionPercentage}% Complete
                </Badge>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Issues to resolve:</p>
                  <div className="space-y-1">
                    {validationResult.errors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-xs text-red-600 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {error.message}
                      </div>
                    ))}
                    {validationResult.errors.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{validationResult.errors.length - 3} more issues
                      </div>
                    )}
                  </div>
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Warnings:</p>
                  <div className="space-y-1">
                    {validationResult.warnings.slice(0, 2).map((warning, index) => (
                      <div key={index} className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {warning.message}
                      </div>
                    ))}
                    {validationResult.warnings.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{validationResult.warnings.length - 2} more warnings
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Alert */}
      {canProceed ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ready to proceed!</strong> Field mapping completed successfully. 
            Your data is ready for processing with {stats.totalMapped} mapped fields.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Proceeding with warnings.</strong> Some fields may need attention, 
            but processing can continue. Issues can be resolved in the draft listings later.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue Processing
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}