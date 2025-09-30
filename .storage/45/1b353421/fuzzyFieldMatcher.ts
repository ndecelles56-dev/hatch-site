// Enhanced MLS Field Mapping with Fuzzy Matching
// Supports 70+ field variations including bathroom fields, property details, and features

// Levenshtein distance for fuzzy string matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
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
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  return 1 - (levenshteinDistance(str1.toLowerCase(), str2.toLowerCase()) / maxLength)
}

// USPS Street Suffixes for address parsing
const STREET_SUFFIXES = [
  'ALLEY', 'ALY', 'ANEX', 'ANX', 'ARCADE', 'ARC', 'AVENUE', 'AVE', 'BAYOU', 'BYU',
  'BEACH', 'BCH', 'BEND', 'BND', 'BLUFF', 'BLF', 'BLUFFS', 'BLFS', 'BOTTOM', 'BTM',
  'BOULEVARD', 'BLVD', 'BRANCH', 'BR', 'BRIDGE', 'BRG', 'BROOK', 'BRK', 'BROOKS', 'BRKS',
  'BURG', 'BG', 'BURGS', 'BGS', 'BYPASS', 'BYP', 'CAMP', 'CP', 'CANYON', 'CYN',
  'CAPE', 'CPE', 'CAUSEWAY', 'CSWY', 'CENTER', 'CTR', 'CENTERS', 'CTRS', 'CIRCLE', 'CIR',
  'CIRCLES', 'CIRS', 'CLIFF', 'CLF', 'CLIFFS', 'CLFS', 'CLUB', 'CLB', 'COMMON', 'CMN',
  'COMMONS', 'CMNS', 'CORNER', 'COR', 'CORNERS', 'CORS', 'COURSE', 'CRSE', 'COURT', 'CT',
  'COURTS', 'CTS', 'COVE', 'CV', 'COVES', 'CVS', 'CREEK', 'CRK', 'CRESCENT', 'CRES',
  'CREST', 'CRST', 'CROSSING', 'XING', 'CROSSROAD', 'XRD', 'CROSSROADS', 'XRDS',
  'CURVE', 'CURV', 'DALE', 'DL', 'DAM', 'DM', 'DIVIDE', 'DV', 'DRIVE', 'DR',
  'DRIVES', 'DRS', 'ESTATE', 'EST', 'ESTATES', 'ESTS', 'EXPRESSWAY', 'EXPY',
  'EXTENSION', 'EXT', 'EXTENSIONS', 'EXTS', 'FALL', 'FALL', 'FALLS', 'FLS',
  'FERRY', 'FRY', 'FIELD', 'FLD', 'FIELDS', 'FLDS', 'FLAT', 'FLT', 'FLATS', 'FLTS',
  'FORD', 'FRD', 'FORDS', 'FRDS', 'FOREST', 'FRST', 'FORGE', 'FRG', 'FORGES', 'FRGS',
  'FORK', 'FRK', 'FORKS', 'FRKS', 'FORT', 'FT', 'FREEWAY', 'FWY', 'GARDEN', 'GDN',
  'GARDENS', 'GDNS', 'GATEWAY', 'GTWY', 'GLEN', 'GLN', 'GLENS', 'GLNS', 'GREEN', 'GRN',
  'GREENS', 'GRNS', 'GROVE', 'GRV', 'GROVES', 'GRVS', 'HARBOR', 'HBR', 'HARBORS', 'HBRS',
  'HAVEN', 'HVN', 'HEIGHTS', 'HTS', 'HIGHWAY', 'HWY', 'HILL', 'HL', 'HILLS', 'HLS',
  'HOLLOW', 'HOLW', 'INLET', 'INLT', 'ISLAND', 'IS', 'ISLANDS', 'ISS', 'ISLE', 'ISLE',
  'JUNCTION', 'JCT', 'JUNCTIONS', 'JCTS', 'KEY', 'KY', 'KEYS', 'KYS', 'KNOLL', 'KNL',
  'KNOLLS', 'KNLS', 'LAKE', 'LK', 'LAKES', 'LKS', 'LAND', 'LAND', 'LANDING', 'LNDG',
  'LANE', 'LN', 'LIGHT', 'LGT', 'LIGHTS', 'LGTS', 'LOAF', 'LF', 'LOCK', 'LCK',
  'LOCKS', 'LCKS', 'LODGE', 'LDG', 'LOOP', 'LOOP', 'MALL', 'MALL', 'MANOR', 'MNR',
  'MANORS', 'MNRS', 'MEADOW', 'MDW', 'MEADOWS', 'MDWS', 'MEWS', 'MEWS', 'MILL', 'ML',
  'MILLS', 'MLS', 'MISSION', 'MSN', 'MOTORWAY', 'MTWY', 'MOUNT', 'MT', 'MOUNTAIN', 'MTN',
  'MOUNTAINS', 'MTNS', 'NECK', 'NCK', 'ORCHARD', 'ORCH', 'OVAL', 'OVAL', 'OVERPASS', 'OPAS',
  'PARK', 'PARK', 'PARKS', 'PARK', 'PARKWAY', 'PKWY', 'PARKWAYS', 'PKWY', 'PASS', 'PASS',
  'PASSAGE', 'PSGE', 'PATH', 'PATH', 'PIKE', 'PIKE', 'PINE', 'PNE', 'PINES', 'PNES',
  'PLACE', 'PL', 'PLAIN', 'PLN', 'PLAINS', 'PLNS', 'PLAZA', 'PLZ', 'POINT', 'PT',
  'POINTS', 'PTS', 'PORT', 'PRT', 'PORTS', 'PRTS', 'PRAIRIE', 'PR', 'RADIAL', 'RADL',
  'RAMP', 'RAMP', 'RANCH', 'RNCH', 'RAPID', 'RPD', 'RAPIDS', 'RPDS', 'REST', 'RST',
  'RIDGE', 'RDG', 'RIDGES', 'RDGS', 'RIVER', 'RIV', 'ROAD', 'RD', 'ROADS', 'RDS',
  'ROUTE', 'RTE', 'ROW', 'ROW', 'RUE', 'RUE', 'RUN', 'RUN', 'SHOAL', 'SHL',
  'SHOALS', 'SHLS', 'SHORE', 'SHR', 'SHORES', 'SHRS', 'SKYWAY', 'SKWY', 'SPRING', 'SPG',
  'SPRINGS', 'SPGS', 'SPUR', 'SPUR', 'SPURS', 'SPUR', 'SQUARE', 'SQ', 'SQUARES', 'SQS',
  'STATION', 'STA', 'STRAVENUE', 'STRA', 'STREAM', 'STRM', 'STREET', 'ST', 'STREETS', 'STS',
  'SUMMIT', 'SMT', 'TERRACE', 'TER', 'THROUGHWAY', 'TRWY', 'TRACE', 'TRCE', 'TRACK', 'TRAK',
  'TRAFFICWAY', 'TRFY', 'TRAIL', 'TRL', 'TRAILER', 'TRLR', 'TUNNEL', 'TUNL', 'TURNPIKE', 'TPKE',
  'UNDERPASS', 'UPAS', 'UNION', 'UN', 'UNIONS', 'UNS', 'VALLEY', 'VLY', 'VALLEYS', 'VLYS',
  'VIADUCT', 'VIA', 'VIEW', 'VW', 'VIEWS', 'VWS', 'VILLAGE', 'VLG', 'VILLAGES', 'VLGS',
  'VILLE', 'VL', 'VISTA', 'VIS', 'WALK', 'WALK', 'WALKS', 'WALK', 'WALL', 'WALL',
  'WAY', 'WAY', 'WAYS', 'WAYS', 'WELL', 'WL', 'WELLS', 'WLS'
]

// Parse street address into components
export function parseStreetAddress(fullAddress: string): {
  streetNumber: string
  streetName: string
  streetSuffix: string
} {
  if (!fullAddress) {
    return { streetNumber: '', streetName: '', streetSuffix: '' }
  }

  const address = fullAddress.trim()
  const parts = address.split(/\s+/)
  
  if (parts.length === 0) {
    return { streetNumber: '', streetName: '', streetSuffix: '' }
  }

  // Extract street number (first part if it's numeric)
  let streetNumber = ''
  let remainingParts = parts
  
  if (parts[0] && /^\d+[A-Za-z]?$/.test(parts[0])) {
    streetNumber = parts[0]
    remainingParts = parts.slice(1)
  }

  if (remainingParts.length === 0) {
    return { streetNumber, streetName: '', streetSuffix: '' }
  }

  // Check if last part is a street suffix
  let streetSuffix = ''
  let streetNameParts = remainingParts
  
  const lastPart = remainingParts[remainingParts.length - 1].toUpperCase()
  if (STREET_SUFFIXES.includes(lastPart)) {
    streetSuffix = lastPart
    streetNameParts = remainingParts.slice(0, -1)
  }

  // Join remaining parts as street name
  const streetName = streetNameParts.join(' ')

  return {
    streetNumber,
    streetName,
    streetSuffix
  }
}

// Enhanced MLS Field Definitions with 70+ field variations
export interface MLSFieldDefinition {
  standardName: string
  variations: string[]
  required: boolean
  dataType: 'string' | 'number' | 'boolean' | 'date'
  category: 'basic' | 'location' | 'features' | 'financial' | 'agent' | 'media'
}

export const MLS_FIELD_DEFINITIONS: MLSFieldDefinition[] = [
  // Basic Property Information
  {
    standardName: 'MLSNumber',
    variations: ['mls number', 'mls#', 'mls id', 'listing number', 'listing id', 'property id', 'mls_number', 'mlsnum'],
    required: false,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ListPrice',
    variations: ['list price', 'asking price', 'price', 'listing price', 'current price', 'listprice', 'list_price'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'OriginalListPrice',
    variations: ['original list price', 'original price', 'starting price', 'initial price', 'orig price', 'original_list_price'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'PropertyType',
    variations: ['property type', 'type', 'property_type', 'prop type', 'listing type'],
    required: true,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'PropertySubType',
    variations: ['property sub type', 'subtype', 'property subtype', 'sub type', 'property_sub_type', 'prop subtype'],
    required: false,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ArchitecturalStyle',
    variations: ['architectural style', 'architecture', 'style', 'architectural_style', 'arch style', 'building style'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'YearBuilt',
    variations: ['year built', 'built year', 'construction year', 'year_built', 'built', 'year constructed'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'LivingArea',
    variations: ['living area', 'square feet', 'sq ft', 'sqft', 'living_area', 'interior sqft', 'finished sqft', 'heated sqft'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },

  // Bedroom and Bathroom Information
  {
    standardName: 'BedroomsTotal',
    variations: ['bedrooms total', 'bedrooms', 'beds', 'bedroom count', 'bedrooms_total', 'total bedrooms', 'bed'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsFull',
    variations: ['bathrooms full', 'full bathrooms', 'full baths', 'bathrooms', 'baths', 'bathrooms_full', 'full_baths'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsHalf',
    variations: ['bathrooms half', 'half bathrooms', 'half baths', 'powder rooms', 'bathrooms_half', 'half_baths'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsPartial',
    variations: ['bathrooms partial', 'partial bathrooms', 'partial baths', 'bathrooms_partial', 'partial_baths'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsTotal',
    variations: ['bathrooms total', 'total bathrooms', 'total baths', 'bathrooms_total', 'bath total'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },

  // Stories and Structure
  {
    standardName: 'StoriesTotal',
    variations: ['stories total', 'stories', 'levels', 'floors', 'stories_total', 'total stories', 'number of stories'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },

  // Location Information - ALL REQUIRED
  {
    standardName: 'StreetNumber',
    variations: ['street number', 'house number', 'address number', 'street_number', 'street num', 'number'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetName',
    variations: ['street name', 'street', 'street_name', 'road name', 'street address'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetSuffix',
    variations: ['street suffix', 'street type', 'street_suffix', 'suffix', 'street designation'],
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
    variations: ['state', 'province', 'state or province', 'state_province', 'st'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'PostalCode',
    variations: ['postal code', 'zip code', 'zip', 'postal_code', 'zipcode'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'County',
    variations: ['county', 'county name', 'parish'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'SubdivisionName',
    variations: ['subdivision', 'subdivision name', 'neighborhood', 'development', 'subdivision_name', 'community'],
    required: false,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'ParcelID',
    variations: ['parcel id', 'parcel number', 'parcel_id', 'tax id', 'assessor parcel number', 'apn', 'parcel #'],
    required: false,
    dataType: 'string',
    category: 'location'
  },

  // Lot and Land Information
  {
    standardName: 'LotSizeSqFt',
    variations: ['lot size', 'lot sqft', 'lot square feet', 'lot_size', 'land size', 'lot area'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'LotSizeAcres',
    variations: ['lot acres', 'lot size acres', 'acres', 'lot_acres', 'land acres'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },

  // Garage and Parking
  {
    standardName: 'GarageSpaces',
    variations: ['garage spaces', 'garage', 'parking spaces', 'garage_spaces', 'car spaces', 'garage stalls'],
    required: false,
    dataType: 'number',
    category: 'features'
  },

  // Enhanced Feature Fields
  {
    standardName: 'Flooring',
    variations: ['flooring', 'floor type', 'floors', 'flooring type', 'floor material', 'floor covering'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PoolFeatures',
    variations: ['pool features', 'pool', 'swimming pool', 'pool type', 'pool_features', 'spa'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FireplaceFeatures',
    variations: ['fireplace features', 'fireplace', 'fireplaces', 'fireplace type', 'fireplace_features'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'KitchenFeatures',
    variations: ['kitchen features', 'kitchen', 'kitchen amenities', 'kitchen_features', 'kitchen appliances'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PrimarySuite',
    variations: ['primary suite', 'master suite', 'master bedroom', 'primary_suite', 'master bed', 'owner suite'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'LaundryFeatures',
    variations: ['laundry features', 'laundry', 'laundry room', 'laundry_features', 'washer dryer'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ConstructionMaterials',
    variations: ['construction materials', 'exterior materials', 'building materials', 'construction_materials', 'siding'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Roof',
    variations: ['roof', 'roof type', 'roofing', 'roof material', 'roof_type'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FoundationDetails',
    variations: ['foundation', 'foundation details', 'foundation type', 'foundation_details', 'basement'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ExteriorFeatures',
    variations: ['exterior features', 'exterior', 'outdoor features', 'exterior_features', 'yard features'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'View',
    variations: ['view', 'property view', 'views', 'scenic view', 'vista'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'WaterSource',
    variations: ['water source', 'water', 'water system', 'water_source', 'water supply'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Sewer',
    variations: ['sewer', 'sewer system', 'septic', 'waste system', 'sewage'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'HeatingType',
    variations: ['heating', 'heating type', 'heat', 'heating system', 'heating_type', 'hvac'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'CoolingType',
    variations: ['cooling', 'cooling type', 'air conditioning', 'ac', 'cooling_type', 'cooling system'],
    required: false,
    dataType: 'string',
    category: 'features'
  },

  // Financial Information
  {
    standardName: 'TaxesAnnual',
    variations: ['taxes', 'annual taxes', 'property taxes', 'tax amount', 'taxes_annual', 'yearly taxes'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'TaxYear',
    variations: ['tax year', 'tax_year', 'assessment year'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'AssociationFee',
    variations: ['hoa fee', 'association fee', 'hoa', 'homeowners association', 'association_fee', 'monthly fee'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'BuyerAgentCompensation',
    variations: ['buyer agent compensation', 'buyer commission', 'buyer_agent_compensation', 'commission'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'SpecialAssessments',
    variations: ['special assessments', 'assessments', 'special_assessments', 'special fees'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },

  // Agent and Brokerage Information
  {
    standardName: 'ListingAgentFullName',
    variations: ['listing agent', 'agent name', 'listing_agent', 'agent', 'listing agent name'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentLicense',
    variations: ['listing agent license', 'agent license', 'license number', 'listing_agent_license', 'agent license number'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentPhone',
    variations: ['listing agent phone', 'agent phone', 'phone', 'listing_agent_phone', 'agent number'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentEmail',
    variations: ['listing agent email', 'agent email', 'email', 'listing_agent_email'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeName',
    variations: ['listing office', 'brokerage', 'office name', 'listing_office', 'broker', 'company'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeLicense',
    variations: ['listing office license', 'brokerage license', 'office license', 'listing_office_license', 'broker license'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },

  // Media and Marketing
  {
    standardName: 'PhotoURLs',
    variations: ['photos', 'images', 'photo urls', 'pictures', 'photo_urls', 'listing photos'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'PublicRemarks',
    variations: ['public remarks', 'description', 'listing description', 'public_remarks', 'remarks', 'details'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'BrokerRemarks',
    variations: ['broker remarks', 'private remarks', 'broker_remarks', 'agent remarks', 'internal notes'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'ShowingInstructions',
    variations: ['showing instructions', 'showing', 'showing_instructions', 'appointment instructions'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'VirtualTourURL',
    variations: ['virtual tour', 'tour url', 'virtual_tour', 'online tour', 'virtual tour url'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'VideoURL',
    variations: ['video', 'video url', 'video_url', 'property video', 'listing video'],
    required: false,
    dataType: 'string',
    category: 'media'
  }
]

// Field mapping interface
export interface FieldMapping {
  inputField: string
  mlsField: MLSFieldDefinition
  confidence: number
  isRequired: boolean
}

// Validation result interface
export interface ValidationResult {
  errors: Array<{ field: string; message: string; severity: 'error' }>
  warnings: Array<{ field: string; message: string; severity: 'warning' }>
  completionPercentage: number
}

// Enhanced field mapping with fuzzy matching
export function mapCSVHeaders(headers: string[], threshold: number = 0.7): {
  mappings: FieldMapping[]
  unmapped: string[]
  missingRequired: MLSFieldDefinition[]
} {
  const mappings: FieldMapping[] = []
  const unmapped: string[] = []
  const usedFields = new Set<string>()

  console.log('🔍 Starting enhanced field mapping with', headers.length, 'headers')

  // First pass: exact matches and high-confidence fuzzy matches
  for (const header of headers) {
    let bestMatch: { field: MLSFieldDefinition; confidence: number } | null = null
    
    for (const fieldDef of MLS_FIELD_DEFINITIONS) {
      if (usedFields.has(fieldDef.standardName)) continue
      
      // Check for exact matches first
      for (const variation of fieldDef.variations) {
        if (header.toLowerCase() === variation.toLowerCase()) {
          bestMatch = { field: fieldDef, confidence: 1.0 }
          break
        }
      }
      
      // If no exact match, try fuzzy matching
      if (!bestMatch) {
        for (const variation of fieldDef.variations) {
          const similarity = calculateSimilarity(header, variation)
          if (similarity >= threshold && (!bestMatch || similarity > bestMatch.confidence)) {
            bestMatch = { field: fieldDef, confidence: similarity }
          }
        }
      }
    }

    if (bestMatch && bestMatch.confidence >= threshold) {
      mappings.push({
        inputField: header,
        mlsField: bestMatch.field,
        confidence: bestMatch.confidence,
        isRequired: bestMatch.field.required
      })
      usedFields.add(bestMatch.field.standardName)
      console.log(`✅ Mapped: ${header} → ${bestMatch.field.standardName} (${Math.round(bestMatch.confidence * 100)}%)`)
    } else {
      unmapped.push(header)
      console.log(`❌ Unmapped: ${header}`)
    }
  }

  // Find missing required fields
  const mappedStandardNames = new Set(mappings.map(m => m.mlsField.standardName))
  const missingRequired = MLS_FIELD_DEFINITIONS.filter(
    field => field.required && !mappedStandardNames.has(field.standardName)
  )

  console.log(`📊 Mapping Results: ${mappings.length} mapped, ${unmapped.length} unmapped, ${missingRequired.length} missing required`)

  return { mappings, unmapped, missingRequired }
}

// Enhanced data validation
export function validateMLSData(record: Record<string, any>, fieldMappings: FieldMapping[]): ValidationResult {
  const errors: Array<{ field: string; message: string; severity: 'error' }> = []
  const warnings: Array<{ field: string; message: string; severity: 'warning' }> = []

  // Check required fields
  const requiredMappings = fieldMappings.filter(m => m.isRequired)
  for (const mapping of requiredMappings) {
    const value = record[mapping.inputField]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push({
        field: mapping.mlsField.standardName,
        message: `Required field '${mapping.mlsField.standardName}' is missing or empty`,
        severity: 'error'
      })
    }
  }

  // Data type validation
  for (const mapping of fieldMappings) {
    const value = record[mapping.inputField]
    if (value && value !== '') {
      switch (mapping.mlsField.dataType) {
        case 'number':
          if (isNaN(parseFloat(value))) {
            errors.push({
              field: mapping.mlsField.standardName,
              message: `Field '${mapping.mlsField.standardName}' should be a number`,
              severity: 'error'
            })
          }
          break
        case 'date':
          if (isNaN(Date.parse(value))) {
            warnings.push({
              field: mapping.mlsField.standardName,
              message: `Field '${mapping.mlsField.standardName}' should be a valid date`,
              severity: 'warning'
            })
          }
          break
      }
    }
  }

  // Calculate completion percentage
  const totalFields = MLS_FIELD_DEFINITIONS.length
  const completedFields = fieldMappings.filter(m => {
    const value = record[m.inputField]
    return value && value !== ''
  }).length
  
  const completionPercentage = Math.round((completedFields / totalFields) * 100)

  return { errors, warnings, completionPercentage }
}

// Enhanced data processing for Field,Value CSV format
export function processFieldValueCSV(data: Record<string, any>[]): Record<string, any>[] {
  if (data.length === 0) return data

  const processedData = data.map(record => {
    const processed = { ...record }

    // Handle street address parsing
    const addressFields = ['address', 'street address', 'property address', 'full address']
    for (const field of addressFields) {
      if (processed[field]) {
        const addressComponents = parseStreetAddress(processed[field])
        processed['Street Number'] = addressComponents.streetNumber
        processed['Street Name'] = addressComponents.streetName
        processed['Street Suffix'] = addressComponents.streetSuffix
        break
      }
    }

    return processed
  })

  return processedData
}