// Enhanced MLS Field Definitions with 70+ field variations
export interface MLSFieldDefinition {
  standardName: string
  variations: string[]
  required: boolean
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array'
  category: 'basic' | 'location' | 'features' | 'financial' | 'agent' | 'media'
}

// USPS Street Suffixes for address parsing
export const STREET_SUFFIXES = [
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

export const MLS_FIELD_DEFINITIONS: MLSFieldDefinition[] = [
  // Basic Property Information (Required)
  {
    standardName: 'MLSNumber',
    variations: ['mls number', 'mls#', 'mls id', 'listing id', 'listing number', 'property id', 'mls_number', 'mlsid'],
    required: true,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ListPrice',
    variations: ['list price', 'price', 'listing price', 'asking price', 'current price', 'list_price', 'listprice'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'OriginalListPrice',
    variations: ['original list price', 'original price', 'initial price', 'starting price', 'orig price', 'original_list_price'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'PropertyType',
    variations: ['property type', 'type', 'property_type', 'prop type', 'listing type', 'home type'],
    required: true,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'PropertySubType',
    variations: ['property sub type', 'sub type', 'property_sub_type', 'subtype', 'property subtype', 'dwelling type'],
    required: false,
    dataType: 'string',
    category: 'basic'
  },
  {
    standardName: 'ArchitecturalStyle',
    variations: ['architectural style', 'architecture', 'style', 'home style', 'building style', 'architectural_style', 'arch style'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'YearBuilt',
    variations: ['year built', 'built year', 'construction year', 'year_built', 'yearbuilt', 'built'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'LivingArea',
    variations: ['living area', 'square feet', 'sq ft', 'sqft', 'living_area', 'total sq ft', 'floor area', 'interior sq ft', 'heated sq ft'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },

  // Bedroom and Bathroom Information (Enhanced)
  {
    standardName: 'BedroomsTotal',
    variations: ['bedrooms total', 'bedrooms', 'beds', 'bedroom count', 'total bedrooms', 'bedrooms_total', 'bed count', 'br'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsFull',
    variations: ['bathrooms full', 'full baths', 'full bathrooms', 'bathrooms_full', 'full bath count', 'bathrooms', 'baths', 'ba'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsHalf',
    variations: ['bathrooms half', 'half baths', 'half bathrooms', 'bathrooms_half', 'powder rooms', 'half bath count', '1/2 baths'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'BathroomsThreeQuarter',
    variations: ['bathrooms three quarter', '3/4 baths', 'three quarter baths', 'bathrooms_three_quarter', '3/4 bathrooms'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'StoriesTotal',
    variations: ['stories total', 'stories', 'levels', 'floors', 'stories_total', 'number of stories', 'story count'],
    required: false,
    dataType: 'number',
    category: 'basic'
  },

  // Enhanced Location Fields (ALL REQUIRED)
  {
    standardName: 'StreetNumber',
    variations: ['street number', 'house number', 'address number', 'street_number', 'number', 'street no'],
    required: true,
    dataType: 'string',
    category: 'location'
  },
  {
    standardName: 'StreetName',
    variations: ['street name', 'street', 'street_name', 'road name', 'street title'],
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
    standardName: 'FullStreetAddress',
    variations: ['full street address', 'street address', 'address', 'property address', 'full_street_address', 'street_address'],
    required: false,
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
    variations: ['state', 'province', 'state_province', 'state or province', 'st'],
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
    variations: ['parcel id', 'parcel number', 'tax id', 'assessor parcel number', 'apn', 'parcel_id', 'tax parcel id', 'parcel #'],
    required: false,
    dataType: 'string',
    category: 'location'
  },

  // Property Details
  {
    standardName: 'LotSizeSqFt',
    variations: ['lot size', 'lot sq ft', 'lot_size', 'land size', 'lot area', 'lot square feet', 'lot size sq ft'],
    required: true,
    dataType: 'number',
    category: 'basic'
  },
  {
    standardName: 'GarageSpaces',
    variations: ['garage spaces', 'garage', 'garage_spaces', 'parking spaces', 'car spaces', 'garage count'],
    required: false,
    dataType: 'number',
    category: 'features'
  },

  // Enhanced Feature Fields
  {
    standardName: 'Flooring',
    variations: ['flooring', 'floor type', 'flooring type', 'floors', 'floor material', 'flooring material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PoolFeatures',
    variations: ['pool features', 'pool', 'swimming pool', 'pool type', 'pool_features', 'pool amenities'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FireplaceFeatures',
    variations: ['fireplace features', 'fireplace', 'fireplaces', 'fireplace type', 'fireplace_features', 'fireplace amenities'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'KitchenFeatures',
    variations: ['kitchen features', 'kitchen', 'kitchen amenities', 'kitchen_features', 'kitchen appliances', 'kitchen details'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'PrimarySuite',
    variations: ['primary suite', 'master suite', 'primary bedroom', 'master bedroom', 'primary_suite', 'main bedroom'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'LaundryFeatures',
    variations: ['laundry features', 'laundry', 'laundry room', 'laundry_features', 'washer dryer', 'laundry amenities'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ConstructionMaterials',
    variations: ['construction materials', 'building materials', 'exterior materials', 'construction_materials', 'materials', 'siding'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Roof',
    variations: ['roof', 'roof type', 'roofing', 'roof material', 'roof_type', 'roofing material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'FoundationDetails',
    variations: ['foundation details', 'foundation', 'foundation type', 'foundation_details', 'basement', 'foundation material'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'ExteriorFeatures',
    variations: ['exterior features', 'exterior', 'outdoor features', 'exterior_features', 'exterior amenities', 'yard features'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'View',
    variations: ['view', 'property view', 'views', 'scenic view', 'view type', 'vista'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'WaterSource',
    variations: ['water source', 'water', 'water system', 'water_source', 'water supply', 'water type'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'Sewer',
    variations: ['sewer', 'sewer system', 'septic', 'sewage', 'waste system', 'sewer type'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'HeatingType',
    variations: ['heating', 'heating type', 'heat', 'heating system', 'heating_type', 'hvac heating'],
    required: false,
    dataType: 'string',
    category: 'features'
  },
  {
    standardName: 'CoolingType',
    variations: ['cooling', 'cooling type', 'air conditioning', 'ac', 'cooling system', 'cooling_type', 'hvac cooling'],
    required: false,
    dataType: 'string',
    category: 'features'
  },

  // Financial Information
  {
    standardName: 'TaxesAnnual',
    variations: ['taxes annual', 'annual taxes', 'property taxes', 'taxes', 'tax amount', 'taxes_annual', 'yearly taxes'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'TaxYear',
    variations: ['tax year', 'tax_year', 'assessment year', 'tax assessment year'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'AssociationFee',
    variations: ['association fee', 'hoa fee', 'hoa', 'homeowners association', 'association_fee', 'monthly hoa', 'hoa dues'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'BuyerAgentCompensation',
    variations: ['buyer agent compensation', 'buyer commission', 'co-op commission', 'buyer_agent_compensation', 'commission'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },
  {
    standardName: 'SpecialAssessments',
    variations: ['special assessments', 'assessments', 'special_assessments', 'additional fees', 'special fees'],
    required: false,
    dataType: 'number',
    category: 'financial'
  },

  // Agent Information (ALL REQUIRED)
  {
    standardName: 'ListingAgentFullName',
    variations: ['listing agent', 'agent name', 'listing_agent', 'agent', 'listing agent name', 'realtor name'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentLicense',
    variations: ['listing agent license', 'agent license', 'license number', 'agent license number', 'listing_agent_license', 'realtor license'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentPhone',
    variations: ['listing agent phone', 'agent phone', 'phone', 'contact phone', 'listing_agent_phone', 'agent number'],
    required: true,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingAgentEmail',
    variations: ['listing agent email', 'agent email', 'email', 'contact email', 'listing_agent_email', 'agent contact'],
    required: false,
    dataType: 'string',
    category: 'agent'
  },
  {
    standardName: 'ListingOfficeName',
    variations: ['listing office', 'brokerage', 'office name', 'listing_office', 'real estate office', 'broker office'],
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
    variations: ['photos', 'images', 'photo urls', 'photo_urls', 'pictures', 'listing photos', 'property images'],
    required: false,
    dataType: 'array',
    category: 'media'
  },
  {
    standardName: 'PublicRemarks',
    variations: ['public remarks', 'description', 'listing description', 'public_remarks', 'property description', 'remarks'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'BrokerRemarks',
    variations: ['broker remarks', 'private remarks', 'agent remarks', 'broker_remarks', 'internal notes', 'broker notes'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'ShowingInstructions',
    variations: ['showing instructions', 'showing', 'access instructions', 'showing_instructions', 'viewing instructions'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'VirtualTourURL',
    variations: ['virtual tour', 'virtual tour url', 'tour link', 'virtual_tour_url', '3d tour', 'online tour'],
    required: false,
    dataType: 'string',
    category: 'media'
  },
  {
    standardName: 'VideoURL',
    variations: ['video', 'video url', 'property video', 'video_url', 'listing video', 'video link'],
    required: false,
    dataType: 'string',
    category: 'media'
  }
]

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

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  completionPercentage: number
  errors: ValidationError[]
  warnings: ValidationError[]
}

// Levenshtein distance calculation for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return (maxLength - distance) / maxLength
}

// Enhanced address parsing function
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
  
  // Extract street number (first part that contains digits)
  let streetNumber = ''
  let remainingParts = [...parts]
  
  if (parts[0] && /\d/.test(parts[0])) {
    streetNumber = parts[0]
    remainingParts = parts.slice(1)
  }
  
  // Find street suffix (last part that matches known suffixes)
  let streetSuffix = ''
  let streetNameParts = [...remainingParts]
  
  for (let i = remainingParts.length - 1; i >= 0; i--) {
    const part = remainingParts[i].toUpperCase()
    if (STREET_SUFFIXES.includes(part)) {
      streetSuffix = part
      streetNameParts = remainingParts.slice(0, i)
      break
    }
  }
  
  // Everything else is street name
  const streetName = streetNameParts.join(' ')
  
  return {
    streetNumber,
    streetName,
    streetSuffix
  }
}

// Enhanced CSV header mapping with fuzzy matching
export function mapCSVHeaders(headers: string[], threshold: number = 0.7): MappingResult {
  const mappings: FieldMapping[] = []
  const unmapped: string[] = []
  
  console.log('🔍 Starting enhanced field mapping with', headers.length, 'headers')
  
  for (const header of headers) {
    let bestMatch: { field: MLSFieldDefinition; confidence: number } | null = null
    
    for (const fieldDef of MLS_FIELD_DEFINITIONS) {
      // Check exact matches first
      for (const variation of fieldDef.variations) {
        if (header.toLowerCase() === variation.toLowerCase()) {
          bestMatch = { field: fieldDef, confidence: 1.0 }
          break
        }
      }
      
      if (bestMatch?.confidence === 1.0) break
      
      // Check fuzzy matches
      for (const variation of fieldDef.variations) {
        const similarity = calculateSimilarity(header, variation)
        if (similarity >= threshold && (!bestMatch || similarity > bestMatch.confidence)) {
          bestMatch = { field: fieldDef, confidence: similarity }
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
      console.log(`✅ Mapped: "${header}" → ${bestMatch.field.standardName} (${Math.round(bestMatch.confidence * 100)}%)`)
    } else {
      unmapped.push(header)
      console.log(`❌ Unmapped: "${header}"`)
    }
  }
  
  // Find missing required fields
  const mappedStandardNames = mappings.map(m => m.mlsField.standardName)
  const missingRequired = MLS_FIELD_DEFINITIONS.filter(
    field => field.required && !mappedStandardNames.includes(field.standardName)
  )
  
  console.log(`📊 Mapping Summary:`)
  console.log(`  ✅ Mapped: ${mappings.length}`)
  console.log(`  ❌ Unmapped: ${unmapped.length}`)
  console.log(`  ⚠️ Missing Required: ${missingRequired.length}`)
  
  return {
    mappings,
    unmapped,
    missingRequired
  }
}

// Enhanced MLS data validation
export function validateMLSData(record: Record<string, any>, fieldMappings: FieldMapping[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  
  // Check required fields
  const requiredMappings = fieldMappings.filter(m => m.isRequired)
  for (const mapping of requiredMappings) {
    const value = record[mapping.inputField]
    if (!value || value === '' || value === null || value === undefined) {
      errors.push({
        field: mapping.mlsField.standardName,
        message: `Required field "${mapping.mlsField.standardName}" is missing or empty`,
        severity: 'error'
      })
    }
  }
  
  // Validate data types and formats
  for (const mapping of fieldMappings) {
    const value = record[mapping.inputField]
    if (value && value !== '') {
      switch (mapping.mlsField.dataType) {
        case 'number':
          if (isNaN(parseFloat(value))) {
            errors.push({
              field: mapping.mlsField.standardName,
              message: `Field "${mapping.mlsField.standardName}" should be a number`,
              severity: 'error'
            })
          }
          break
        case 'string':
          if (typeof value !== 'string' && value.toString().trim().length === 0) {
            warnings.push({
              field: mapping.mlsField.standardName,
              message: `Field "${mapping.mlsField.standardName}" appears to be empty`,
              severity: 'warning'
            })
          }
          break
      }
    }
  }
  
  // Calculate completion percentage
  const totalRequiredFields = MLS_FIELD_DEFINITIONS.filter(f => f.required).length
  const completedRequiredFields = totalRequiredFields - errors.length
  const completionPercentage = Math.round((completedRequiredFields / totalRequiredFields) * 100)
  
  return {
    isValid: errors.length === 0,
    completionPercentage,
    errors,
    warnings
  }
}

// Helper function to extract field value using fuzzy matching
export function extractFieldValue(record: Record<string, any>, fieldName: string, threshold: number = 0.7): string | null {
  // First try exact match
  if (record[fieldName]) {
    return record[fieldName].toString().trim()
  }
  
  // Try fuzzy matching
  const keys = Object.keys(record)
  let bestMatch: { key: string; confidence: number } | null = null
  
  for (const key of keys) {
    const similarity = calculateSimilarity(key, fieldName)
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.confidence)) {
      bestMatch = { key, confidence: similarity }
    }
  }
  
  if (bestMatch) {
    return record[bestMatch.key]?.toString().trim() || null
  }
  
  return null
}