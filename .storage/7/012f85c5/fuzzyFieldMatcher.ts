// Fuzzy Field Matching System for MLS Data
// Handles variations in field names across different MLS systems

export interface MLSFieldDefinition {
  standardName: string
  aliases: string[]
  required: boolean
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array'
  category: 'identification' | 'location' | 'property' | 'financial' | 'agent' | 'media' | 'features'
}

// Comprehensive MLS field definitions based on the template
export const MLS_FIELD_DEFINITIONS: MLSFieldDefinition[] = [
  // Identification Fields
  {
    standardName: 'MLSNumber',
    aliases: ['mls_number', 'mlsnumber', 'mls_id', 'listing_id', 'listing_number', 'mls', 'mlsid'],
    required: true,
    dataType: 'string',
    category: 'identification'
  },
  {
    standardName: 'ListingExternalID',
    aliases: ['listing_external_id', 'external_id', 'external_listing_id', 'external_id_number'],
    required: false,
    dataType: 'string',
    category: 'identification'
  },
  {
    standardName: 'Status',
    aliases: ['listing_status', 'property_status', 'status', 'listing_state', 'state'],
    required: true,
    dataType: 'string',
    category: 'identification'
  },

  // Financial Fields
  {
    standardName: 'ListPrice',
    aliases: ['list_price', 'listing_price', 'price', 'asking_price', 'listprice', 'current_price', 'market_price'],
    required: true,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'OriginalListPrice',
    aliases: ['original_list_price', 'original_price', 'original_listing_price', 'initial_price', 'starting_price'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'TaxesAnnual',
    aliases: ['taxes_annual', 'annual_taxes', 'property_taxes', 'taxes', 'tax_amount', 'yearly_taxes'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'TaxYear',
    aliases: ['tax_year', 'tax_assessment_year', 'assessment_year', 'property_tax_year'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'AssociationFee',
    aliases: ['association_fee', 'hoa_fee', 'hoa', 'maintenance_fee', 'condo_fee', 'community_fee'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },

  // Location Fields
  {
    standardName: 'StreetNumber',
    aliases: ['street_number', 'house_number', 'address_number', 'property_number', 'number'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetName',
    aliases: ['street_name', 'street', 'road_name', 'street_address', 'road', 'avenue', 'boulevard'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetSuffix',
    aliases: ['street_suffix', 'street_type', 'suffix', 'street_designation', 'address_suffix', 'road_type'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'UnitNumber',
    aliases: ['unit_number', 'unit', 'apt', 'apartment', 'suite', 'apt_number', 'unit_num'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'City',
    aliases: ['city', 'municipality', 'town', 'cityname', 'city_name'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StateOrProvince',
    aliases: ['state_or_province', 'state', 'province', 'stateprovince', 'state_name', 'state_code'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'PostalCode',
    aliases: ['postal_code', 'zip_code', 'zip', 'zipcode', 'postcode', 'post_code'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'County',
    aliases: ['county', 'parish', 'district', 'county_name', 'county_or_parish'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'SubdivisionName',
    aliases: ['subdivision_name', 'subdivision', 'neighborhood', 'community', 'development', 'complex'],
    required: false,
    dataType: 'string',
    category: 'location'
  },

  // Property Details
  {
    standardName: 'PropertyCategory',
    aliases: ['property_category', 'property_class', 'category', 'type_category', 'listing_category'],
    required: true,
    dataType: 'string',
    category: 'property'
  },
  {
    standardName: 'PropertyType',
    aliases: ['property_type', 'type', 'dwelling_type', 'home_type', 'structure_type'],
    required: true,
    dataType: 'string',
    category: 'property'
  },
  {
    standardName: 'PropertySubType',
    aliases: ['property_sub_type', 'property_subtype', 'subtype', 'sub_type', 'property_style', 'style'],
    required: true,
    dataType: 'string',
    category: 'property'
  },
  {
    standardName: 'ArchitecturalStyle',
    aliases: ['architectural_style', 'architecture', 'home_style', 'building_style', 'design_style', 'style_type'],
    required: false,
    dataType: 'string',
    category: 'property'
  },
  {
    standardName: 'YearBuilt',
    aliases: ['year_built', 'built_year', 'construction_year', 'yearbuilt', 'year_constructed', 'built'],
    required: true,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'LivingArea',
    aliases: ['living_area', 'living_area_sqft', 'square_feet', 'sqft', 'living_space', 'floor_area', 'interior_sqft'],
    required: true,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'BedroomsTotal',
    aliases: ['bedrooms_total', 'bedrooms', 'beds', 'bedroom_count', 'total_bedrooms', 'br', 'bed_count'],
    required: true,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'BathroomsFull',
    aliases: ['bathrooms_full', 'full_baths', 'full_bathrooms', 'bathrooms', 'baths', 'bathroom_count', 'ba'],
    required: true,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'BathroomsHalf',
    aliases: ['bathrooms_half', 'half_baths', 'half_bathrooms', 'powder_rooms', 'half_bath'],
    required: true,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'GarageSpaces',
    aliases: ['garage_spaces', 'garage', 'parking_spaces', 'car_spaces', 'garage_size', 'parking'],
    required: false,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'LotSizeSqFt',
    aliases: ['lot_size_sqft', 'lot_size', 'land_size', 'lot_square_feet', 'lot_area', 'property_size'],
    required: false,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'StoriesTotal',
    aliases: ['stories_total', 'stories', 'floors', 'levels', 'number_of_stories', 'building_levels'],
    required: false,
    dataType: 'number',
    category: 'property'
  },

  // Features - All as string fields for detailed descriptions
  {
    standardName: 'Flooring',
    aliases: ['flooring', 'floor_type', 'flooring_type', 'floors', 'floor_covering', 'floor_material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PoolFeatures',
    aliases: ['pool_features', 'pool', 'swimming_pool', 'pool_type', 'pool_description', 'water_features'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FireplaceFeatures',
    aliases: ['fireplace_features', 'fireplace', 'fireplaces', 'fireplace_type', 'fireplace_description'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'KitchenFeatures',
    aliases: ['kitchen_features', 'kitchen', 'kitchen_appliances', 'kitchen_details', 'appliances_included'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PrimarySuite',
    aliases: ['primary_suite', 'master_suite', 'master_bedroom', 'primary_bedroom', 'master_bed'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'LaundryFeatures',
    aliases: ['laundry_features', 'laundry', 'laundry_room', 'washer_dryer', 'laundry_location'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ConstructionMaterials',
    aliases: ['construction_materials', 'construction', 'building_materials', 'exterior_construction', 'materials'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Roof',
    aliases: ['roof', 'roof_type', 'roofing', 'roof_material', 'roofing_material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FoundationDetails',
    aliases: ['foundation_details', 'foundation', 'foundation_type', 'basement', 'crawl_space'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ExteriorFeatures',
    aliases: ['exterior_features', 'exterior', 'outdoor_features', 'patio_and_porch_features', 'deck'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'View',
    aliases: ['view', 'property_view', 'scenic_view', 'views', 'view_description'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'HeatingType',
    aliases: ['heating_type', 'heating', 'heat_type', 'heating_system', 'heating_fuel'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'CoolingType',
    aliases: ['cooling_type', 'cooling', 'ac_type', 'air_conditioning', 'hvac', 'cooling_system'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'WaterSource',
    aliases: ['water_source', 'water', 'water_supply', 'water_system', 'well', 'city_water'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Sewer',
    aliases: ['sewer', 'sewer_system', 'septic', 'waste_water', 'sewage', 'septic_system'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Electric',
    aliases: ['electric', 'electrical', 'power', 'electricity', 'electrical_system'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'InternetService',
    aliases: ['internet_service', 'internet', 'broadband', 'cable', 'fiber', 'wifi'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'AssociationFeeFrequency',
    aliases: ['association_fee_frequency', 'hoa_frequency', 'fee_frequency', 'dues_frequency'],
    required: false,
    dataType: 'string',
    category: 'financial'
  },

  // Agent Information - Fixed structure
  {
    standardName: 'ListingAgentFullName',
    aliases: ['listing_agent_full_name', 'agent_name', 'listing_agent', 'agent_full_name', 'primary_agent'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentLicense',
    aliases: ['listing_agent_license', 'agent_license', 'license_number', 'agent_license_number'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentPhone',
    aliases: ['listing_agent_phone', 'agent_phone', 'phone', 'contact_phone', 'agent_phone_number'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentEmail',
    aliases: ['listing_agent_email', 'agent_email', 'email', 'contact_email', 'agent_email_address'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeName',
    aliases: ['listing_office_name', 'office_name', 'brokerage', 'company', 'firm', 'real_estate_office'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeLicense',
    aliases: ['listing_office_license', 'office_license', 'brokerage_license', 'company_license'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'OfficePhone',
    aliases: ['office_phone', 'brokerage_phone', 'company_phone', 'office_phone_number'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'OfficeEmail',
    aliases: ['office_email', 'brokerage_email', 'company_email', 'office_email_address'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },

  // Media
  {
    standardName: 'PhotoURLs',
    aliases: ['photo_urls', 'photos', 'images', 'photo_links', 'image_urls', 'property_photos'],
    required: true,
    dataType: 'array',
    category: 'media'
  },
  {
    standardName: 'VirtualTourURL',
    aliases: ['virtual_tour_url', 'virtual_tour', 'tour_url', '3d_tour', 'virtual_link'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'PublicRemarks',
    aliases: ['public_remarks', 'description', 'remarks', 'listing_description', 'property_description'],
    required: true,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'BrokerRemarks',
    aliases: ['broker_remarks', 'private_remarks', 'agent_remarks', 'internal_remarks'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'ShowingInstructions',
    aliases: ['showing_instructions', 'showing_remarks', 'access_instructions', 'showing_info'],
    required: false,
    dataType: 'string',
    category: 'media'
  },

  // Dates
  {
    standardName: 'ListDate',
    aliases: ['list_date', 'listing_date', 'date_listed', 'listed_date', 'on_market_date'],
    required: false,
    dataType: 'date',
    category: 'identification'
  },
  {
    standardName: 'ExpirationDate',
    aliases: ['expiration_date', 'expires', 'listing_expires', 'expiry_date', 'listing_expiration'],
    required: true,
    dataType: 'date',
    category: 'identification'
  },

  // Additional Financial Fields
  {
    standardName: 'BuyerAgentCommission',
    aliases: ['buyer_agent_commission', 'buyer_commission', 'coop_commission', 'buyer_agent_compensation'],
    required: false,
    dataType: 'string',
    category: 'financial'
  },
  {
    standardName: 'CapRate',
    aliases: ['cap_rate', 'capitalization_rate', 'cap_ratio'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'NOI',
    aliases: ['noi', 'net_operating_income', 'operating_income'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },

  // Additional Property Fields
  {
    standardName: 'LegalDescription',
    aliases: ['legal_description', 'legal_desc', 'legal', 'property_legal'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'ParcelNumber',
    aliases: ['parcel_number', 'parcel_id', 'tax_id', 'assessor_id', 'parcel'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'Latitude',
    aliases: ['latitude', 'lat', 'geo_lat'],
    required: false,
    dataType: 'number',
    category: 'location'
  },
  {
    standardName: 'Longitude',
    aliases: ['longitude', 'lng', 'long', 'geo_lng'],
    required: false,
    dataType: 'number',
    category: 'location'
  },
  {
    standardName: 'LotSizeAcres',
    aliases: ['lot_size_acres', 'acres', 'lot_acres', 'land_acres'],
    required: false,
    dataType: 'number',
    category: 'property'
  },
  {
    standardName: 'InteriorFeatures',
    aliases: ['interior_features', 'interior', 'inside_features', 'home_features'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PatioAndPorchFeatures',
    aliases: ['patio_and_porch_features', 'patio', 'porch', 'deck', 'outdoor_living'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Fence',
    aliases: ['fence', 'fencing', 'fence_type', 'fenced'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'LandUse',
    aliases: ['land_use', 'zoning', 'land_type', 'property_use'],
    required: false,
    dataType: 'string',
    category: 'property'
  },
  {
    standardName: 'RoadFrontageType',
    aliases: ['road_frontage_type', 'road_frontage', 'frontage', 'road_access'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'FloodZone',
    aliases: ['flood_zone', 'flood', 'fema_zone', 'flood_plain'],
    required: false,
    dataType: 'string',
    category: 'location'
  }
]

// Levenshtein distance algorithm for fuzzy matching
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

// Calculate similarity score (0-1, where 1 is perfect match)
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return (maxLength - distance) / maxLength
}

// Normalize field names for better matching
export function normalizeFieldName(fieldName: string): string {
  return fieldName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

// Find the best matching MLS field for a given input field
export function findBestFieldMatch(
  inputField: string, 
  threshold: number = 0.7
): { field: MLSFieldDefinition; confidence: number } | null {
  const normalizedInput = normalizeFieldName(inputField)
  let bestMatch: { field: MLSFieldDefinition; confidence: number } | null = null

  for (const fieldDef of MLS_FIELD_DEFINITIONS) {
    // Check exact match with standard name
    const normalizedStandard = normalizeFieldName(fieldDef.standardName)
    if (normalizedInput === normalizedStandard) {
      return { field: fieldDef, confidence: 1.0 }
    }

    // Check exact match with aliases
    for (const alias of fieldDef.aliases) {
      const normalizedAlias = normalizeFieldName(alias)
      if (normalizedInput === normalizedAlias) {
        return { field: fieldDef, confidence: 1.0 }
      }
    }

    // Calculate fuzzy similarity with standard name
    const standardSimilarity = calculateSimilarity(normalizedInput, normalizedStandard)
    if (standardSimilarity >= threshold && (!bestMatch || standardSimilarity > bestMatch.confidence)) {
      bestMatch = { field: fieldDef, confidence: standardSimilarity }
    }

    // Calculate fuzzy similarity with aliases
    for (const alias of fieldDef.aliases) {
      const normalizedAlias = normalizeFieldName(alias)
      const aliasSimilarity = calculateSimilarity(normalizedInput, normalizedAlias)
      if (aliasSimilarity >= threshold && (!bestMatch || aliasSimilarity > bestMatch.confidence)) {
        bestMatch = { field: fieldDef, confidence: aliasSimilarity }
      }
    }
  }

  return bestMatch
}

// Map CSV headers to MLS fields
export interface FieldMapping {
  inputField: string
  mlsField: MLSFieldDefinition
  confidence: number
  isRequired: boolean
}

export function mapCSVHeaders(csvHeaders: string[], threshold: number = 0.7): {
  mappings: FieldMapping[]
  unmapped: string[]
  missingRequired: MLSFieldDefinition[]
} {
  const mappings: FieldMapping[] = []
  const unmapped: string[] = []
  const mappedMLSFields = new Set<string>()

  // Map each CSV header to MLS field
  for (const header of csvHeaders) {
    const match = findBestFieldMatch(header, threshold)
    if (match) {
      mappings.push({
        inputField: header,
        mlsField: match.field,
        confidence: match.confidence,
        isRequired: match.field.required
      })
      mappedMLSFields.add(match.field.standardName)
    } else {
      unmapped.push(header)
    }
  }

  // Find missing required fields
  const missingRequired = MLS_FIELD_DEFINITIONS.filter(
    field => field.required && !mappedMLSFields.has(field.standardName)
  )

  return { mappings, unmapped, missingRequired }
}

// Get field suggestions for unmapped fields
export function getFieldSuggestions(
  unmappedField: string, 
  limit: number = 3
): Array<{ field: MLSFieldDefinition; confidence: number }> {
  const suggestions: Array<{ field: MLSFieldDefinition; confidence: number }> = []

  for (const fieldDef of MLS_FIELD_DEFINITIONS) {
    const standardSimilarity = calculateSimilarity(
      normalizeFieldName(unmappedField), 
      normalizeFieldName(fieldDef.standardName)
    )
    
    suggestions.push({ field: fieldDef, confidence: standardSimilarity })

    // Also check aliases
    for (const alias of fieldDef.aliases) {
      const aliasSimilarity = calculateSimilarity(
        normalizeFieldName(unmappedField), 
        normalizeFieldName(alias)
      )
      
      if (aliasSimilarity > standardSimilarity) {
        // Replace with better alias match
        const existingIndex = suggestions.findIndex(s => s.field.standardName === fieldDef.standardName)
        if (existingIndex >= 0) {
          suggestions[existingIndex].confidence = aliasSimilarity
        }
      }
    }
  }

  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit)
}

// Validate mapped data against MLS requirements
export interface ValidationResult {
  isValid: boolean
  errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }>
  warnings: Array<{ field: string; message: string; severity: 'error' | 'warning' }>
  completionPercentage: number
}

export function validateMLSData(
  data: Record<string, unknown>, 
  mappings: FieldMapping[]
): ValidationResult {
  const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = []
  const warnings: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = []
  
  let requiredFieldsCount = 0
  let completedRequiredFields = 0
  let totalFieldsCount = 0
  let completedTotalFields = 0

  for (const mapping of mappings) {
    const value = data[mapping.inputField]
    const isEmpty = value === null || value === undefined || value === ''

    totalFieldsCount++
    if (!isEmpty) completedTotalFields++

    if (mapping.isRequired) {
      requiredFieldsCount++
      if (!isEmpty) {
        completedRequiredFields++
      } else {
        errors.push({
          field: mapping.mlsField.standardName,
          message: `${mapping.mlsField.standardName} is required but missing`,
          severity: 'error'
        })
      }
    }

    // Type validation
    if (!isEmpty && value !== undefined) {
      switch (mapping.mlsField.dataType) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push({
              field: mapping.mlsField.standardName,
              message: `${mapping.mlsField.standardName} must be a number`,
              severity: 'error'
            })
          }
          break
        case 'date':
          if (isNaN(Date.parse(String(value)))) {
            warnings.push({
              field: mapping.mlsField.standardName,
              message: `${mapping.mlsField.standardName} has invalid date format`,
              severity: 'warning'
            })
          }
          break
      }
    }

    // Confidence warnings
    if (mapping.confidence < 0.9) {
      warnings.push({
        field: mapping.mlsField.standardName,
        message: `Field mapping confidence is ${Math.round(mapping.confidence * 100)}% for ${mapping.inputField} → ${mapping.mlsField.standardName}`,
        severity: 'warning'
      })
    }
  }

  const completionPercentage = totalFieldsCount > 0 
    ? Math.round((completedTotalFields / totalFieldsCount) * 100)
    : 0

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completionPercentage
  }
}