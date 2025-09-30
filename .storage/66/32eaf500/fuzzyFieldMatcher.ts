// Enhanced MLS Field Mapping with Fuzzy Matching
// Supports 70+ field variations including bathroom fields, property details, and features

// USPS Street Suffixes for address parsing (comprehensive list)
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

// Calculate similarity score between two strings with improved logic
function calculateSimilarity(str1: string, str2: string): number {
  const normalizedStr1 = str1.toLowerCase().trim()
  const normalizedStr2 = str2.toLowerCase().trim()
  
  // Exact match (highest priority)
  if (normalizedStr1 === normalizedStr2) return 1.0
  
  // Contains match (very high priority for Field,Value format)
  if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1)) {
    return 0.98
  }
  
  // Remove spaces and check again (for compound fields)
  const noSpaces1 = normalizedStr1.replace(/\s+/g, '')
  const noSpaces2 = normalizedStr2.replace(/\s+/g, '')
  if (noSpaces1 === noSpaces2) return 0.95
  
  // Levenshtein distance based similarity
  const maxLength = Math.max(normalizedStr1.length, normalizedStr2.length)
  const distance = levenshteinDistance(normalizedStr1, normalizedStr2)
  
  return Math.max(0, (maxLength - distance) / maxLength)
}

// Parse street address into components with improved logic
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
  
  // Extract street number (first part if it starts with digits)
  let streetNumber = ''
  let remainingParts = parts
  
  if (parts[0] && /^\d+/.test(parts[0])) {
    streetNumber = parts[0]
    remainingParts = parts.slice(1)
  }
  
  if (remainingParts.length === 0) {
    return { streetNumber, streetName: '', streetSuffix: '' }
  }
  
  // Find street suffix (check from the end, case insensitive)
  let streetSuffix = ''
  let streetNameParts = remainingParts
  
  // Check last part for suffix
  const lastPart = remainingParts[remainingParts.length - 1].toUpperCase()
  if (STREET_SUFFIXES.includes(lastPart)) {
    streetSuffix = lastPart
    streetNameParts = remainingParts.slice(0, -1)
  }
  
  const streetName = streetNameParts.join(' ')
  
  console.log(`🏠 Address parsing: "${fullAddress}" → Number: "${streetNumber}", Name: "${streetName}", Suffix: "${streetSuffix}"`)
  
  return {
    streetNumber,
    streetName,
    streetSuffix
  }
}

// Enhanced MLS Field Definitions with EXACT FIELD NAMES from CSV
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
    variations: ['mlsnumber', 'mls number', 'mls#', 'mls id', 'listing number', 'listing id', 'property id', 'id'],
    required: false,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ListPrice',
    variations: ['listprice', 'list price', 'listing price', 'price', 'asking price', 'current price', 'sale price'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'OriginalListPrice',
    variations: ['originallistprice', 'original list price', 'original price', 'initial price', 'starting price'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'PropertyType',
    variations: ['propertytype', 'property type', 'type', 'property class', 'class', 'category', 'prop type'],
    required: true,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'PropertySubType',
    variations: ['propertysubtype', 'property sub type', 'subtype', 'sub type', 'property subtype', 'dwelling type'],
    required: false,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ArchitecturalStyle',
    variations: ['architecturalstyle', 'architectural style', 'architecture', 'style', 'home style', 'house style', 'design style', 'arch style'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'YearBuilt',
    variations: ['yearbuilt', 'year built', 'built year', 'construction year', 'year constructed', 'built'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'LivingArea',
    variations: ['livingarea', 'living area', 'square feet', 'sq ft', 'sqft', 'total sq ft', 'finished sq ft', 'interior sq ft', 'heated sq ft'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },

  // Bedroom and Bathroom Information
  {
    standardName: 'BedroomsTotal',
    variations: ['bedroomstotal', 'bedrooms total', 'bedrooms', 'beds', 'bedroom count', 'total bedrooms', 'bed count'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsFull',
    variations: ['bathroomsfull', 'bathrooms full', 'full bathrooms', 'full baths', 'bathrooms', 'baths', 'bathroom count', 'total bathrooms'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsHalf',
    variations: ['bathroomshalf', 'bathrooms half', 'half bathrooms', 'half baths', 'powder rooms', 'guest baths'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'StoriesTotal',
    variations: ['storiestotal', 'stories total', 'stories', 'levels', 'floors', 'story count', 'floor count'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },

  // Location Information
  {
    standardName: 'StreetNumber',
    variations: ['streetnumber', 'street number', 'house number', 'address number', 'number'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetName',
    variations: ['streetname', 'street name', 'street', 'road name'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetSuffix',
    variations: ['streetsuffix', 'street suffix', 'suffix', 'street type'],
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
    variations: ['state', 'stateorprovince', 'province', 'state or province', 'st'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'PostalCode',
    variations: ['postalcode', 'postal code', 'zip code', 'zip', 'postal', 'zipcode'],
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
    variations: ['parcelid', 'parcel id', 'parcel number', 'parcel #', 'tax id', 'tax parcel', 'assessor parcel number', 'apn', 'parcel'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'SubdivisionName',
    variations: ['subdivision', 'subdivisionname', 'subdivision name', 'development', 'community', 'neighborhood'],
    required: false,
    dataType: 'string',
    category: 'location'
  },

  // Property Details
  {
    standardName: 'LotSizeSqFt',
    variations: ['lotsizesqft', 'lot size sq ft', 'lot size', 'lot square feet', 'land size', 'property size', 'lot sqft'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'LotSizeAcres',
    variations: ['lotsizeacres', 'lot size acres', 'lot acres', 'acres', 'land acres'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'GarageSpaces',
    variations: ['garagespaces', 'garage spaces', 'garage', 'parking spaces', 'car spaces', 'garage count'],
    required: false,
    dataType: 'number',
    category: 'features'
  },

  // Enhanced Feature Fields with EXACT MATCHES
  {
    standardName: 'Flooring',
    variations: ['flooring', 'floor type', 'flooring type', 'floors', 'floor material', 'floor covering', 'flooring material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PoolFeatures',
    variations: ['poolfeatures', 'pool features', 'pool', 'swimming pool', 'pool type', 'pool amenities', 'spa', 'hot tub'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FireplaceFeatures',
    variations: ['fireplacefeatures', 'fireplace features', 'fireplace', 'fireplaces', 'fireplace type', 'heating features'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'KitchenFeatures',
    variations: ['kitchenfeatures', 'kitchen features', 'kitchen', 'kitchen amenities', 'kitchen appliances', 'kitchen details'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PrimarySuite',
    variations: ['primarysuite', 'primary suite', 'master suite', 'master bedroom', 'primary bedroom', 'owner suite', 'mastersuite'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'LaundryFeatures',
    variations: ['laundryfeatures', 'laundry features', 'laundry', 'laundry room', 'washer dryer', 'utility room'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ConstructionMaterials',
    variations: ['constructionmaterials', 'construction materials', 'exterior materials', 'building materials', 'siding', 'exterior'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Roof',
    variations: ['roof', 'rooftype', 'roof type', 'roofing', 'roof material', 'roofing material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FoundationDetails',
    variations: ['foundationdetails', 'foundation details', 'foundation', 'foundation type', 'basement', 'crawl space'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ExteriorFeatures',
    variations: ['exteriorfeatures', 'exterior features', 'outdoor features', 'yard features', 'landscaping', 'patio', 'deck'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'View',
    variations: ['view', 'property view', 'scenic view', 'views', 'outlook', 'vista'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'WaterSource',
    variations: ['watersource', 'water source', 'water', 'water system', 'water supply', 'utilities water'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Sewer',
    variations: ['sewer', 'sewer system', 'septic', 'wastewater', 'utilities sewer', 'sewage', 'waste'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'HeatingType',
    variations: ['heatingtype', 'heating type', 'heating', 'heat type', 'heating system', 'hvac heating', 'heat'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'CoolingType',
    variations: ['coolingtype', 'cooling type', 'cooling', 'air conditioning', 'ac', 'hvac cooling', 'cooling system'],
    required: false,
    dataType: 'string',
    category: 'features'
  },

  // Financial Information
  {
    standardName: 'TaxesAnnual',
    variations: ['taxesannual', 'taxes annual', 'annual taxes', 'property taxes', 'taxes', 'tax amount'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'TaxYear',
    variations: ['taxyear', 'tax year', 'tax assessment year', 'assessment year'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'AssociationFee',
    variations: ['associationfee', 'association fee', 'hoa fee', 'hoa', 'monthly fee', 'maintenance fee', 'condo fee'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },

  // Agent Information - FIXED FIELD MAPPINGS
  {
    standardName: 'ListingAgentFullName',
    variations: ['listingagent', 'listing agent', 'listingagentfullname', 'listing agent full name', 'listing agent name', 'agent name', 'agent', 'realtor name'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentLicense',
    variations: ['listingagentlicense', 'listing agent license', 'agent license', 'license number', 'agent license number'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentPhone',
    variations: ['listingagentphone', 'listing agent phone', 'agent phone', 'phone', 'contact phone', 'agent contact'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentEmail',
    variations: ['listingagentemail', 'listing agent email', 'agent email', 'email', 'contact email'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeName',
    variations: ['listingoffice', 'listing office', 'listingofficename', 'listing office name', 'office name', 'brokerage', 'company', 'real estate office'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeLicense',
    variations: ['listingofficelicense', 'listing office license', 'office license', 'brokerage license', 'company license'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },

  // Media and Marketing
  {
    standardName: 'PhotoURLs',
    variations: ['photourls', 'photo urls', 'photos', 'images', 'pictures', 'photo links', 'image urls'],
    required: false,
    dataType: 'array',
    category: 'media'
  },
  {
    standardName: 'PublicRemarks',
    variations: ['publicremarks', 'public remarks', 'description', 'property description', 'marketing remarks', 'comments'],
    required: false,
    dataType: 'string',
    category: 'media'
  }
]

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

// Enhanced CSV header mapping with EXACT MATCH PRIORITY
export function mapCSVHeaders(headers: string[], threshold: number = 0.6): MappingResult {
  const mappings: FieldMapping[] = []
  const unmapped: string[] = []
  const usedFields = new Set<string>()

  console.log('🔍 Enhanced Field Mapping Started with EXACT MATCH PRIORITY')
  console.log(`📋 Input headers (${headers.length}):`, headers)

  for (const header of headers) {
    let bestMatch: { field: MLSFieldDefinition; confidence: number } | null = null

    console.log(`🔍 Processing header: "${header}"`)

    // Try to find the best matching MLS field with EXACT MATCH PRIORITY
    for (const mlsField of MLS_FIELD_DEFINITIONS) {
      if (usedFields.has(mlsField.standardName)) continue

      // Check against all variations of this MLS field
      for (const variation of mlsField.variations) {
        const confidence = calculateSimilarity(header, variation)
        
        // Log all potential matches for debugging
        if (confidence > 0.5) {
          console.log(`    🎯 "${header}" vs "${variation}" → ${Math.round(confidence * 100)}% confidence`)
        }
        
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
      
      console.log(`✅ MAPPED: "${header}" → ${bestMatch.field.standardName} (${Math.round(bestMatch.confidence * 100)}% confidence)`)
    } else {
      unmapped.push(header)
      console.log(`❌ UNMAPPED: "${header}" - no match above ${Math.round(threshold * 100)}% threshold`)
    }
  }

  // Find missing required fields
  const missingRequired = MLS_FIELD_DEFINITIONS.filter(field => 
    field.required && !usedFields.has(field.standardName)
  )

  console.log(`📊 FINAL Mapping Summary:`)
  console.log(`  ✅ Mapped: ${mappings.length} fields`)
  console.log(`  ❌ Unmapped: ${unmapped.length} fields`)
  console.log(`  ⚠️ Missing Required: ${missingRequired.length} fields`)

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
  
  console.log('🔄 Processing MLS record with enhanced logic')
  console.log('📋 Original record:', record)
  
  // Apply field mappings FIRST
  for (const mapping of fieldMappings) {
    const value = record[mapping.inputField]
    if (value !== undefined && value !== null && value !== '') {
      processedRecord[mapping.mlsField.standardName] = value
      console.log(`  📝 Mapped: "${mapping.inputField}" → ${mapping.mlsField.standardName} = "${value}"`)
    }
  }
  
  // Special processing for address fields - IMPROVED LOGIC
  const addressFields = ['address', 'street address', 'property address', 'full address', 'street', 'location']
  let fullAddress = ''
  
  // Find address field using fuzzy matching
  for (const [key, value] of Object.entries(record)) {
    for (const addressField of addressFields) {
      if (calculateSimilarity(key, addressField) > 0.7 && value) {
        fullAddress = String(value)
        console.log(`🏠 Found address field: "${key}" = "${fullAddress}"`)
        break
      }
    }
    if (fullAddress) break
  }
  
  // Parse address if found and not already mapped
  if (fullAddress) {
    const addressComponents = parseStreetAddress(fullAddress)
    
    // Only set if not already mapped from direct field matching
    if (!processedRecord['StreetNumber'] && addressComponents.streetNumber) {
      processedRecord['StreetNumber'] = addressComponents.streetNumber
      console.log(`  🏠 Extracted StreetNumber: "${addressComponents.streetNumber}"`)
    }
    if (!processedRecord['StreetName'] && addressComponents.streetName) {
      processedRecord['StreetName'] = addressComponents.streetName
      console.log(`  🏠 Extracted StreetName: "${addressComponents.streetName}"`)
    }
    if (!processedRecord['StreetSuffix'] && addressComponents.streetSuffix) {
      processedRecord['StreetSuffix'] = addressComponents.streetSuffix
      console.log(`  🏠 Extracted StreetSuffix: "${addressComponents.streetSuffix}"`)
    }
  }
  
  console.log('✅ Final processed record:', processedRecord)
  return processedRecord
}