export interface MLSProperty {
  // Basic identifiers
  id: string
  mlsNumber?: string
  status: 'draft' | 'active' | 'pending' | 'sold' | 'expired' | 'withdrawn'
  
  // Pricing
  listPrice: number
  originalListPrice?: number
  
  // Property basics
  propertyType: string
  propertySubType?: string
  architecturalStyle?: string
  yearBuilt: number
  livingAreaSqFt: number
  
  // Bedrooms and Bathrooms (Enhanced)
  bedrooms: number
  bathrooms: number
  bathroomsHalf?: number
  bathroomsThreeQuarter?: number
  stories?: number
  
  // Location (ALL REQUIRED for MLS compliance)
  streetNumber: string
  streetName: string
  streetSuffix: string
  city: string
  state: string
  zipCode: string
  county: string
  subdivision?: string
  parcelID?: string
  
  // Property details
  lotSize: number
  garageSpaces?: number
  
  // Enhanced Feature Fields
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
  
  // Financial
  taxes?: number
  taxYear?: number
  hoaFee?: number
  buyerAgentCompensation?: number
  specialAssessments?: number
  
  // Agent information (ALL REQUIRED)
  listingAgentName: string
  listingAgentLicense: string
  listingAgentPhone: string
  listingAgentEmail?: string
  brokerage: string
  brokerageLicense?: string
  
  // Media and marketing
  photos?: string[]
  publicRemarks?: string
  brokerRemarks?: string
  showingInstructions?: string
  virtualTourUrl?: string
  videoUrl?: string
  
  // System fields
  createdAt: string
  lastModified: string
  completionPercentage: number
  validationErrors?: ValidationError[]
  
  // Legacy boolean fields (for backward compatibility)
  pool?: boolean
  fireplace?: boolean
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}