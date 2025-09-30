// Enhanced MLS Property interface with comprehensive field support
export interface MLSProperty {
  // Core identification
  id: string
  mlsNumber?: string
  status: 'draft' | 'active' | 'pending' | 'sold' | 'expired'
  
  // Basic property information
  listPrice: number
  originalListPrice?: number
  propertyType: string
  propertySubType?: string
  architecturalStyle?: string
  yearBuilt: number
  livingAreaSqFt: number
  
  // Bedroom and bathroom details (enhanced)
  bedrooms: number
  bathrooms: number // Full bathrooms
  bathroomsHalf?: number // Half bathrooms
  bathroomsPartial?: number // Partial bathrooms
  bathroomsTotal?: number // Total bathrooms
  
  // Structure details
  stories?: number
  
  // Location information (all required for MLS compliance)
  streetNumber: string
  streetName: string
  streetSuffix: string
  city: string
  state: string
  zipCode: string
  county: string
  subdivision?: string
  parcelID?: string // Added Parcel ID
  
  // Lot and land
  lotSize: number
  lotSizeAcres?: number
  
  // Parking and garage
  garageSpaces?: number
  
  // Enhanced feature fields
  flooring?: string
  poolFeatures?: string
  fireplaceFeatures?: string
  kitchenFeatures?: string
  primarySuite?: string
  laundryFeatures?: string
  constructionMaterials?: string
  roofType?: string
  foundationDetails?: string
  exteriorFeatures?: string
  propertyView?: string
  waterSource?: string
  sewerSystem?: string
  heatingType?: string
  coolingType?: string
  
  // Legacy feature flags (for backward compatibility)
  pool?: boolean
  fireplace?: boolean
  
  // Financial information
  taxes?: number
  taxYear?: number
  hoaFee?: number
  buyerAgentCompensation?: number
  specialAssessments?: number
  
  // Agent and brokerage information
  listingAgentName: string
  listingAgentLicense: string
  listingAgentPhone: string
  listingAgentEmail?: string
  brokerage: string
  brokerageLicense?: string
  showingInstructions?: string
  
  // Media and marketing
  photos?: string[]
  publicRemarks?: string
  brokerRemarks?: string
  virtualTourUrl?: string
  videoUrl?: string
  
  // System fields
  createdAt: string
  lastModified: string
  completionPercentage: number
  validationErrors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

// Property search and filter interfaces
export interface PropertyFilters {
  priceMin?: number
  priceMax?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  city?: string
  state?: string
  zipCode?: string
  yearBuiltMin?: number
  yearBuiltMax?: number
  sqftMin?: number
  sqftMax?: number
  lotSizeMin?: number
  lotSizeMax?: number
  hasPool?: boolean
  hasFireplace?: boolean
  garageSpaces?: number
  architecturalStyle?: string
  flooring?: string
  heatingType?: string
  coolingType?: string
}

export interface PropertySearchResult {
  properties: MLSProperty[]
  totalCount: number
  filters: PropertyFilters
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Property status and workflow
export type PropertyStatus = 'draft' | 'active' | 'pending' | 'sold' | 'expired'

export interface PropertyStatusUpdate {
  propertyId: string
  newStatus: PropertyStatus
  updatedBy: string
  updatedAt: string
  notes?: string
}

// Enhanced property analytics
export interface PropertyAnalytics {
  propertyId: string
  views: number
  inquiries: number
  showings: number
  offers: number
  daysOnMarket: number
  priceHistory: PriceHistoryEntry[]
  marketComparables?: MLSProperty[]
}

export interface PriceHistoryEntry {
  price: number
  date: string
  type: 'initial' | 'reduction' | 'increase'
  notes?: string
}

// Property comparison interface
export interface PropertyComparison {
  properties: MLSProperty[]
  comparisonFields: (keyof MLSProperty)[]
  createdAt: string
  createdBy: string
}

// Export interfaces for bulk operations
export interface BulkPropertyOperation {
  operationType: 'update' | 'delete' | 'publish' | 'unpublish'
  propertyIds: string[]
  updates?: Partial<MLSProperty>
  performedBy: string
  performedAt: string
}

export interface BulkOperationResult {
  successful: string[]
  failed: Array<{
    propertyId: string
    error: string
  }>
  totalProcessed: number
}