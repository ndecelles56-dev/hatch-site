// Enhanced MLS Field Mapping with Fuzzy Matching
// Supports 70+ field variations including bathroom fields, property details, and comprehensive features

// USPS Street Suffixes for address parsing
const STREET_SUFFIXES = [
  'ALLEY', 'ALY', 'AVENUE', 'AVE', 'BOULEVARD', 'BLVD', 'CIRCLE', 'CIR', 'COURT', 'CT', 'COVE', 'CV',
  'CREEK', 'CRK', 'DRIVE', 'DR', 'LANE', 'LN', 'PARKWAY', 'PKWY', 'PLACE', 'PL', 'PLAZA', 'PLZ',
  'ROAD', 'RD', 'SQUARE', 'SQ', 'STREET', 'ST', 'TERRACE', 'TER', 'TRAIL', 'TRL', 'WAY', 'WY',
  'BEND', 'BND', 'BRANCH', 'BR', 'BRIDGE', 'BRG', 'BROOK', 'BRK', 'BURG', 'BG', 'BYPASS', 'BYP',
  'CAMP', 'CP', 'CANYON', 'CYN', 'CAPE', 'CPE', 'CAUSEWAY', 'CSWY', 'CENTER', 'CTR', 'CENTERS', 'CTRS',
  'CLIFFS', 'CLFS', 'CLUB', 'CLB', 'COMMON', 'CMN', 'COMMONS', 'CMNS', 'CORNER', 'COR', 'CORNERS', 'CORS',
  'COURSE', 'CRSE', 'COURTS', 'CTS', 'COVES', 'CVS', 'CRESCENT', 'CRES', 'CROSSING', 'XING', 'CROSSROAD', 'XRD',
  'CURVE', 'CURV', 'DALE', 'DL', 'DAM', 'DM', 'DIVIDE', 'DV', 'ESTATE', 'EST', 'ESTATES', 'ESTS',
  'EXPRESSWAY', 'EXPY', 'EXTENSION', 'EXT', 'EXTENSIONS', 'EXTS', 'FALL', 'FALLS', 'FLS', 'FERRY', 'FRY',
  'FIELD', 'FLD', 'FIELDS', 'FLDS', 'FLAT', 'FLT', 'FLATS', 'FLTS', 'FORD', 'FRD', 'FORDS', 'FRDS',
  'FOREST', 'FRST', 'FORGE', 'FRG', 'FORGES', 'FRGS', 'FORK', 'FRK', 'FORKS', 'FRKS', 'FORT', 'FT',
  'FREEWAY', 'FWY', 'GARDEN', 'GDN', 'GARDENS', 'GDNS', 'GATEWAY', 'GTWY', 'GLEN', 'GLN', 'GLENS', 'GLNS',
  'GREEN', 'GRN', 'GREENS', 'GRNS', 'GROVE', 'GRV', 'GROVES', 'GRVS', 'HARBOR', 'HBR', 'HARBORS', 'HBRS',
  'HAVEN', 'HVN', 'HEIGHTS', 'HTS', 'HIGHWAY', 'HWY', 'HILL', 'HL', 'HILLS', 'HLS', 'HOLLOW', 'HOLW',
  'INLET', 'INLT', 'ISLAND', 'IS', 'ISLANDS', 'ISS', 'ISLE', 'JUNCTION', 'JCT', 'JUNCTIONS', 'JCTS',
  'KEY', 'KY', 'KEYS', 'KYS', 'KNOLL', 'KNL', 'KNOLLS', 'KNLS', 'LAKE', 'LK', 'LAKES', 'LKS',
  'LAND', 'LANDING', 'LNDG', 'LIGHT', 'LGT', 'LIGHTS', 'LGTS', 'LOAF', 'LF', 'LOCK', 'LCK',
  'LOCKS', 'LCKS', 'LODGE', 'LDG', 'LOOP', 'MANOR', 'MNR', 'MANORS', 'MNRS', 'MEADOW', 'MDW',
  'MEADOWS', 'MDWS', 'MEWS', 'MILL', 'ML', 'MILLS', 'MLS', 'MISSION', 'MSN', 'MOTORWAY', 'MTWY',
  'MOUNT', 'MT', 'MOUNTAIN', 'MTN', 'MOUNTAINS', 'MTNS', 'NECK', 'NCK', 'ORCHARD', 'ORCH', 'OVAL', 'OVL',
  'OVERPASS', 'OPAS', 'PARK', 'PARKS', 'PASS', 'PASSAGE', 'PSGE', 'PATH', 'PIKE', 'PINE', 'PNE',
  'PINES', 'PNES', 'PLAIN', 'PLN', 'PLAINS', 'PLNS', 'POINT', 'PT', 'POINTS', 'PTS', 'PORT', 'PRT',
  'PORTS', 'PRTS', 'PRAIRIE', 'PR', 'RADIAL', 'RADL', 'RAMP', 'RANCH', 'RNCH', 'RAPID', 'RPD',
  'RAPIDS', 'RPDS', 'REST', 'RST', 'RIDGE', 'RDG', 'RIDGES', 'RDGS', 'RIVER', 'RIV', 'ROADS', 'RDS',
  'ROUTE', 'RTE', 'ROW', 'RUE', 'RUN', 'SHOAL', 'SHL', 'SHOALS', 'SHLS', 'SHORE', 'SHR', 'SHORES', 'SHRS',
  'SKYWAY', 'SKWY', 'SPRING', 'SPG', 'SPRINGS', 'SPGS', 'SPUR', 'SPURS', 'STATION', 'STA', 'STRAVENUE', 'STRA',
  'STREAM', 'STRM', 'SUMMIT', 'SMT', 'THROUGHWAY', 'TRWY', 'TRACE', 'TRCE', 'TRACK', 'TRAK', 'TRAFFICWAY', 'TRFY',
  'TUNNEL', 'TUNL', 'TURNPIKE', 'TPKE', 'UNDERPASS', 'UPAS', 'UNION', 'UN', 'UNIONS', 'UNS', 'VALLEY', 'VLY',
  'VALLEYS', 'VLYS', 'VIADUCT', 'VIA', 'VIEW', 'VW', 'VIEWS', 'VWS', 'VILLAGE', 'VLG', 'VILLAGES', 'VLGS',
  'VILLE', 'VL', 'VISTA', 'VIS', 'WALK', 'WALKS', 'WALL', 'WELL', 'WL', 'WELLS', 'WLS'
]

// Enhanced MLS Field Definitions with comprehensive coverage
export interface MLSFieldDefinition {
  standardName: string
  variations: string[]
  required: boolean
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array'
  category: 'basic' | 'location' | 'features' | 'financial' | 'agent' | 'media'
}

export const MLS_FIELD_DEFINITIONS: MLSFieldDefinition[] = [
  // Basic Property Information
  {
    standardName: 'MLSNumber',
    variations: ['mls number', 'mls#', 'mls id', 'listing number', 'listing id', 'property id', 'id'],
    required: false,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ListPrice',
    variations: ['list price', 'listing price', 'price', 'asking price', 'current price', 'sale price'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'OriginalListPrice',
    variations: ['original list price', 'original price', 'initial price', 'starting price'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'PropertyType',
    variations: ['property type', 'type', 'property class', 'class', 'category'],
    required: true,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'PropertySubType',
    variations: ['property sub type', 'subtype', 'sub type', 'property subtype', 'dwelling type'],
    required: false,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ArchitecturalStyle',
    variations: ['architectural style', 'architecture', 'style', 'home style', 'house style', 'design style'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'YearBuilt',
    variations: ['year built', 'built year', 'construction year', 'year constructed', 'built'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'LivingArea',
    variations: ['living area', 'square feet', 'sq ft', 'sqft', 'total sq ft', 'finished sq ft', 'interior sq ft', 'heated sq ft'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },

  // Bedroom and Bathroom Information
  {
    standardName: 'BedroomsTotal',
    variations: ['bedrooms total', 'bedrooms', 'beds', 'bedroom count', 'total bedrooms', 'bed count'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsFull',
    variations: ['bathrooms full', 'full bathrooms', 'full baths', 'bathrooms', 'baths', 'bathroom count', 'total bathrooms'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsHalf',
    variations: ['bathrooms half', 'half bathrooms', 'half baths', 'powder rooms', 'guest baths'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'StoriesTotal',
    variations: ['stories total', 'stories', 'levels', 'floors', 'story count', 'floor count'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },

  // Location Information - ALL REQUIRED
  {
    standardName: 'StreetNumber',
    variations: ['street number', 'house number', 'address number', 'number'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetName',
    variations: ['street name', 'street', 'road name'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetSuffix',
    variations: ['street suffix', 'suffix', 'street type'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'City',
    variations: ['city', 'municipality', 'town'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StateOrProvince',
    variations: ['state', 'province', 'state or province'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'PostalCode',
    variations: ['postal code', 'zip code', 'zip', 'postal'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'County',
    variations: ['county', 'parish', 'borough'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'ParcelID',
    variations: ['parcel id', 'parcel number', 'parcel #', 'tax id', 'tax parcel', 'assessor parcel number', 'apn'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'SubdivisionName',
    variations: ['subdivision name', 'subdivision', 'development', 'community', 'neighborhood'],
    required: false,
    dataType: 'string',
    category: 'location'
  },

  // Property Details
  {
    standardName: 'LotSizeSqFt',
    variations: ['lot size sq ft', 'lot size', 'lot square feet', 'land size', 'property size', 'lot sqft'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'GarageSpaces',
    variations: ['garage spaces', 'garage', 'parking spaces', 'car spaces', 'garage count'],
    required: false,
    dataType: 'number',
    category: 'features'
  },

  // Enhanced Feature Fields
  {
    standardName: 'Flooring',
    variations: ['flooring', 'floor type', 'flooring type', 'floors', 'floor material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PoolFeatures',
    variations: ['pool features', 'pool', 'swimming pool', 'pool type', 'pool amenities'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FireplaceFeatures',
    variations: ['fireplace features', 'fireplace', 'fireplaces', 'fireplace type', 'heating features'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'KitchenFeatures',
    variations: ['kitchen features', 'kitchen', 'kitchen amenities', 'kitchen appliances', 'kitchen details'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PrimarySuite',
    variations: ['primary suite', 'master suite', 'master bedroom', 'primary bedroom', 'owner suite'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'LaundryFeatures',
    variations: ['laundry features', 'laundry', 'laundry room', 'washer dryer', 'utility room'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ConstructionMaterials',
    variations: ['construction materials', 'exterior materials', 'building materials', 'siding', 'exterior'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Roof',
    variations: ['roof', 'roof type', 'roofing', 'roof material', 'roofing material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FoundationDetails',
    variations: ['foundation details', 'foundation', 'foundation type', 'basement', 'crawl space'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ExteriorFeatures',
    variations: ['exterior features', 'outdoor features', 'yard features', 'landscaping', 'patio', 'deck'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'View',
    variations: ['view', 'property view', 'scenic view', 'views', 'outlook'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'WaterSource',
    variations: ['water source', 'water', 'water system', 'water supply', 'utilities water'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Sewer',
    variations: ['sewer', 'sewer system', 'septic', 'wastewater', 'utilities sewer'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'HeatingType',
    variations: ['heating type', 'heating', 'heat type', 'heating system', 'hvac heating'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'CoolingType',
    variations: ['cooling type', 'cooling', 'air conditioning', 'ac', 'hvac cooling', 'cooling system'],
    required: false,
    dataType: 'string',
    category: 'features'
  },

  // Financial Information
  {
    standardName: 'TaxesAnnual',
    variations: ['taxes annual', 'annual taxes', 'property taxes', 'taxes', 'tax amount'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'TaxYear',
    variations: ['tax year', 'tax assessment year', 'assessment year'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'AssociationFee',
    variations: ['association fee', 'hoa fee', 'hoa', 'monthly fee', 'maintenance fee', 'condo fee'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'BuyerAgentCompensation',
    variations: ['buyer agent compensation', 'buyer commission', 'co-op commission', 'buyer agent fee'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'SpecialAssessments',
    variations: ['special assessments', 'assessments', 'special fees', 'one time fees'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },

  // Agent Information
  {
    standardName: 'ListingAgentFullName',
    variations: ['listing agent full name', 'listing agent name', 'agent name', 'listing agent', 'realtor name'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentLicense',
    variations: ['listing agent license', 'agent license', 'license number', 'agent license number'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentPhone',
    variations: ['listing agent phone', 'agent phone', 'phone', 'contact phone', 'agent contact'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentEmail',
    variations: ['listing agent email', 'agent email', 'email', 'contact email'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeName',
    variations: ['listing office name', 'office name', 'brokerage', 'company', 'real estate office'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeLicense',
    variations: ['listing office license', 'office license', 'brokerage license', 'company license'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },

  // Media and Marketing
  {
    standardName: 'PhotoURLs',
    variations: ['photo urls', 'photos', 'images', 'pictures', 'photo links', 'image urls'],
    required: false,
    dataType: 'array',
    category: 'media'
  },
  {
    standardName: 'PublicRemarks',
    variations: ['public remarks', 'description', 'property description', 'marketing remarks', 'comments'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'BrokerRemarks',
    variations: ['broker remarks', 'private remarks', 'agent remarks', 'internal notes'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'ShowingInstructions',
    variations: ['showing instructions', 'showing notes', 'access instructions', 'viewing instructions'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'VirtualTourURL',
    variations: ['virtual tour url', 'virtual tour', 'tour link', '3d tour', 'online tour'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'VideoURL',
    variations: ['video url', 'video', 'property video', 'video link', 'video tour'],
    required: false,
    dataType: 'string',
    category: 'media'
  }
]

// Levenshtein distance function for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  const len1 = str1.length
  const len2 = str2.length

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[len2][len1]
}

// Calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const normalizedStr1 = str1.toLowerCase().trim()
  const normalizedStr2 = str2.toLowerCase().trim()
  
  // Exact match
  if (normalizedStr1 === normalizedStr2) return 1.0
  
  // Contains match
  if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1)) {
    return 0.9
  }
  
  // Levenshtein distance based similarity
  const maxLength = Math.max(normalizedStr1.length, normalizedStr2.length)
  const distance = levenshteinDistance(normalizedStr1, normalizedStr2)
  
  return Math.max(0, (maxLength - distance) / maxLength)
}

// Parse street address into components
export function parseStreetAddress(fullAddress: string): {
  streetNumber: string
  streetName: string
  streetSuffix: string
} {
  const address = fullAddress.trim()
  const parts = address.split(/\s+/)
  
  if (parts.length === 0) {
    return { streetNumber: '', streetName: '', streetSuffix: '' }
  }
  
  // Extract street number (first part if it's numeric)
  let streetNumber = ''
  let remainingParts = parts
  
  if (parts[0] && /^\d+/.test(parts[0])) {
    streetNumber = parts[0]
    remainingParts = parts.slice(1)
  }
  
  if (remainingParts.length === 0) {
    return { streetNumber, streetName: '', streetSuffix: '' }
  }
  
  // Find street suffix (check from the end)
  let streetSuffix = ''
  let streetNameParts = remainingParts
  
  for (let i = remainingParts.length - 1; i >= 0; i--) {
    const part = remainingParts[i].toUpperCase()
    if (STREET_SUFFIXES.includes(part)) {
      streetSuffix = remainingParts[i]
      streetNameParts = remainingParts.slice(0, i)
      break
    }
  }
  
  const streetName = streetNameParts.join(' ')
  
  return {
    streetNumber,
    streetName,
    streetSuffix
  }
}

// Enhanced field mapping interface
export interface FieldMapping {
  inputField: string
  mlsField: MLSFieldDefinition
  confidence: number
  isRequired: boolean
}

export interface MappingResult {
  mappings: FieldMapping[]
  unmapped: string[]
  missingRequired: MLSFieldDefinition[]
}

// Enhanced CSV header mapping with fuzzy matching
export function mapCSVHeaders(headers: string[], threshold: number = 0.7): MappingResult {
  const mappings: FieldMapping[] = []
  const unmapped: string[] = []
  const usedFields = new Set<string>()

  console.log('🔍 Enhanced Field Mapping Started')
  console.log(`📋 Input headers (${headers.length}):`, headers)

  for (const header of headers) {
    let bestMatch: { field: MLSFieldDefinition; confidence: number } | null = null

    // Try to find the best matching MLS field
    for (const mlsField of MLS_FIELD_DEFINITIONS) {
      if (usedFields.has(mlsField.standardName)) continue

      // Check against all variations of this MLS field
      for (const variation of mlsField.variations) {
        const confidence = calculateSimilarity(header, variation)
        
        if (confidence >= threshold && (!bestMatch || confidence > bestMatch.confidence)) {
          bestMatch = { field: mlsField, confidence }
        }
      }
    }

    if (bestMatch) {
      mappings.push({
        inputField: header,
        mlsField: bestMatch.field,
        confidence: bestMatch.confidence,
        isRequired: bestMatch.field.required
      })
      usedFields.add(bestMatch.field.standardName)
      
      console.log(`✅ Mapped: "${header}" → ${bestMatch.field.standardName} (${Math.round(bestMatch.confidence * 100)}% confidence)`)
    } else {
      unmapped.push(header)
      console.log(`❌ Unmapped: "${header}"`)
    }
  }

  // Find missing required fields
  const missingRequired = MLS_FIELD_DEFINITIONS.filter(field => 
    field.required && !usedFields.has(field.standardName)
  )

  console.log(`📊 Mapping Summary:`)
  console.log(`  ✅ Mapped: ${mappings.length} fields`)
  console.log(`  ❌ Unmapped: ${unmapped.length} fields`)
  console.log(`  ⚠️ Missing Required: ${missingRequired.length} fields`)

  if (missingRequired.length > 0) {
    console.log(`⚠️ Missing required fields:`, missingRequired.map(f => f.standardName))
  }

  return {
    mappings,
    unmapped,
    missingRequired
  }
}

// Validation interfaces
export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  completionPercentage: number
}

// Enhanced data validation
export function validateMLSData(record: Record<string, any>, fieldMappings: FieldMapping[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  
  let requiredFieldsPresent = 0
  let totalRequiredFields = 0
  
  // Check required fields
  for (const mapping of fieldMappings) {
    if (mapping.isRequired) {
      totalRequiredFields++
      const value = record[mapping.inputField]
      
      if (!value || value === '' || value === null || value === undefined) {
        errors.push({
          field: mapping.mlsField.standardName,
          message: `${mapping.mlsField.standardName} is required but missing`,
          severity: 'error'
        })
      } else {
        requiredFieldsPresent++
      }
    }
  }
  
  // Check data types and formats
  for (const mapping of fieldMappings) {
    const value = record[mapping.inputField]
    if (!value) continue
    
    switch (mapping.mlsField.dataType) {
      case 'number':
        if (isNaN(Number(value))) {
          warnings.push({
            field: mapping.mlsField.standardName,
            message: `${mapping.mlsField.standardName} should be a number`,
            severity: 'warning'
          })
        }
        break
      case 'date':
        if (isNaN(Date.parse(value))) {
          warnings.push({
            field: mapping.mlsField.standardName,
            message: `${mapping.mlsField.standardName} should be a valid date`,
            severity: 'warning'
          })
        }
        break
    }
  }
  
  const completionPercentage = totalRequiredFields > 0 
    ? Math.round((requiredFieldsPresent / totalRequiredFields) * 100)
    : 100
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completionPercentage
  }
}

// Enhanced data processing with address parsing and feature extraction
export function processMLSRecord(record: Record<string, any>, fieldMappings: FieldMapping[]): Record<string, any> {
  const processedRecord: Record<string, any> = {}
  
  // Apply field mappings
  for (const mapping of fieldMappings) {
    const value = record[mapping.inputField]
    if (value !== undefined && value !== null && value !== '') {
      processedRecord[mapping.mlsField.standardName] = value
    }
  }
  
  // Special processing for address fields
  const addressFields = ['address', 'street address', 'property address', 'full address']
  let fullAddress = ''
  
  // Find address field using fuzzy matching
  for (const [key, value] of Object.entries(record)) {
    for (const addressField of addressFields) {
      if (calculateSimilarity(key, addressField) > 0.7 && value) {
        fullAddress = String(value)
        break
      }
    }
    if (fullAddress) break
  }
  
  // Parse address if found
  if (fullAddress) {
    const addressComponents = parseStreetAddress(fullAddress)
    
    // Only set if not already mapped
    if (!processedRecord['StreetNumber'] && addressComponents.streetNumber) {
      processedRecord['StreetNumber'] = addressComponents.streetNumber
    }
    if (!processedRecord['StreetName'] && addressComponents.streetName) {
      processedRecord['StreetName'] = addressComponents.streetName
    }
    if (!processedRecord['StreetSuffix'] && addressComponents.streetSuffix) {
      processedRecord['StreetSuffix'] = addressComponents.streetSuffix
    }
    
    console.log(`🏠 Address parsed: "${fullAddress}" → Number: "${addressComponents.streetNumber}", Name: "${addressComponents.streetName}", Suffix: "${addressComponents.streetSuffix}"`)
  }
  
  return processedRecord
}