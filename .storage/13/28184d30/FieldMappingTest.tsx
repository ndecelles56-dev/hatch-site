import React from 'react'
import FieldMappingDebug from '@/components/FieldMappingDebug'

export default function FieldMappingTest() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Field Mapping Test</h1>
          <p className="text-gray-600 mt-2">
            Test and verify the enhanced fuzzy field mapping system for MLS data processing.
          </p>
        </div>
        
        <FieldMappingDebug />
      </div>
    </div>
  )
}