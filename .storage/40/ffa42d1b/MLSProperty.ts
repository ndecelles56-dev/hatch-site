// MLS Property Interface - Complete field set based on MLS requirements
export interface MLSProperty {
  // Core Identification
  id: string
  mlsNumber?: string
  status: 'active' | 'pending' | 'sold' | 'draft'
  
  // Pricing Information
  listPrice: number
  originalListPrice?: number
  soldPrice?: number
  pricePerSqFt?: number
  
  // Property Location (ALL REQUIRED)
  streetNumber: string
  streetName: string
  streetSuffix: string
  unitNumber?: string
  city: string
  state: string
  zipCode: string
  county: string
  subdivision?: string
  neighborhood?: string
  
  // Property Details
  propertyType: string
  propertySubType?: string
  yearBuilt: number // NOW REQUIRED
  totalSqFt?: number
  livingAreaSqFt?: number
  lotSize: number // NOW REQUIRED (in square feet)
  lotSizeAcres?: number
  
  // Room Information
  bedrooms: number
  bathrooms: number
  fullBathrooms?: number
  halfBathrooms?: number
  totalBathrooms?: number
  totalRooms?: number
  
  // Building Features
  stories?: number
  garageSpaces?: number
  parkingSpaces?: number
  pool?: boolean
  poolPrivate?: boolean
  spa?: boolean
  fireplace?: boolean
  fireplaceCount?: number
  waterfront?: boolean
  waterView?: boolean
  
  // Systems & Utilities
  heatingType?: string
  coolingType?: string
  electricalSystem?: string
  plumbingSystem?: string
  roofType?: string
  foundationType?: string
  exteriorFeatures?: string[]
  interiorFeatures?: string[]
  appliances?: string[]
  
  // Financial Information
  taxes?: number
  taxYear?: number
  hoaFee?: number
  hoaFrequency?: string
  specialAssessments?: number
  buyerAgentCompensation?: number
  
  // Listing Information
  listDate?: string
  daysOnMarket?: number
  showingInstructions?: string
  lockboxLocation?: string
  keypadCode?: string
  
  // Agent Information
  listingAgentName?: string
  listingAgentLicense?: string
  listingAgentPhone: string // NOW REQUIRED
  listingAgentEmail?: string
  coListingAgentName?: string
  coListingAgentLicense?: string
  coListingAgentPhone?: string
  coListingAgentEmail?: string
  
  // Brokerage Information
  brokerage: string // NOW REQUIRED
  brokerageLicense?: string
  brokeragePhone?: string
  brokerageEmail?: string
  coBrokerage?: string
  coBrokerageLicense?: string
  
  // Marketing & Media
  publicRemarks?: string
  brokerRemarks?: string
  virtualTourUrl?: string
  videoUrl?: string
  photos: string[] // Photo URLs/paths - REQUIRED (minimum 4)
  
  // Legal & Disclosure
  disclosures?: string[]
  restrictions?: string
  easements?: string
  zoning?: string
  landUse?: string
  
  // Showing & Access
  showingContactName?: string
  showingContactPhone?: string
  showingContactEmail?: string
  occupancy?: string
  possessionDate?: string
  
  // School Information
  elementarySchool?: string
  middleSchool?: string
  highSchool?: string
  schoolDistrict?: string
  
  // Utilities & Services
  sewer?: string
  water?: string
  electric?: string
  gas?: string
  internet?: string
  cable?: string
  
  // Construction & Materials
  constructionMaterials?: string[]
  roofMaterial?: string
  flooringTypes?: string[]
  windowTypes?: string[]
  
  // Energy & Environmental
  energyEfficiencyRating?: string
  solarPanels?: boolean
  greenFeatures?: string[]
  
  // Accessibility
  accessibilityFeatures?: string[]
  
  // HOA & Community
  hoaName?: string
  hoaContact?: string
  hoaAmenities?: string[]
  communityFeatures?: string[]
  
  // Investment Properties
  rentAmount?: number
  rentFrequency?: string
  leaseExpiration?: string
  tenantOccupied?: boolean
  
  // Commercial Properties
  buildingSize?: number
  officeSpaces?: number
  warehouseSpace?: number
  retailSpace?: number
  parkingRatio?: number
  
  // Land Properties
  landType?: string
  developmentRights?: string
  mineralRights?: string
  waterRights?: string
  
  // Draft-specific fields
  completionPercentage?: number
  validationErrors?: Array<{
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
  lastModified?: string
  
  // Timestamps
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

// Export for use in other components
export type PropertyStatus = MLSProperty['status']
export type PropertyType = MLSProperty['propertyType']
export type ValidationError = NonNullable<MLSProperty['validationErrors']>[0]