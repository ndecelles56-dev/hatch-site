import type { ConsumerPropertyRow, NormalizedListing } from '@/types/customer-search'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop'

const parseFeatureList = (value?: string | null) =>
  value
    ? value
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const toLower = (value: string | null | undefined) => (value ? value.toLowerCase() : '')

export const normaliseConsumerProperty = (property: ConsumerPropertyRow): NormalizedListing => {
  const enriched = property as ConsumerPropertyRow & {
    pool_features?: string | null
    interior_features?: string | null
    exterior_features?: string | null
    community_features?: string | null
    utilities?: string | null
    garage_spaces?: number | null
    bathrooms_full?: number | null
  }

  const photoUrls = (property.photos ?? []).filter((url) => url && /^https?:\/\//i.test(url))
  const heroPhoto = property.cover_photo_url && /^https?:\/\//i.test(property.cover_photo_url)
    ? property.cover_photo_url
    : photoUrls[0] ?? PLACEHOLDER_IMAGE

  const streetParts = [property.street_number, property.street_name, property.street_suffix].filter(Boolean)
  const addressLine = streetParts.join(' ')
  const formattedAddress = [addressLine, property.city, property.state_code, property.zip_code]
    .filter(Boolean)
    .join(', ')

  const price = Number(property.list_price ?? 0)
  const bedrooms = Number(property.bedrooms_total ?? 0)
  const bathrooms = Number(property.bathrooms_total ?? enriched.bathrooms_full ?? 0)
  const sqft = Number(property.living_area_sq_ft ?? 0)
  const yearBuilt = property.year_built ? Number(property.year_built) : null
  const lotSizeSqFt = property.lot_size_sq_ft ? Number(property.lot_size_sq_ft) : null
  const lotSizeAcres = property.lot_size_acres ? Number(property.lot_size_acres) : null

  const rawType = property.property_type ?? 'Home'
  const propertyType = rawType.replace(/_/g, ' ')
  const propertySubType = property.property_sub_type ? property.property_sub_type.replace(/_/g, ' ') : null

  const interior = parseFeatureList(enriched.interior_features)
  const exterior = parseFeatureList(enriched.exterior_features)
  const pool = parseFeatureList(enriched.pool_features)
  const community = parseFeatureList(enriched.community_features)
  const utilities = parseFeatureList(enriched.utilities)
  const features = [...interior, ...exterior, ...pool, ...community, ...utilities]

  const remarksLower = toLower(property.public_remarks)
  const statusLower = toLower(property.status)
  const publishedAt = property.published_at
  const updatedAt = property.updated_at

  const daysSincePublished = publishedAt ? (Date.now() - Date.parse(publishedAt)) / (1000 * 60 * 60 * 24) : null
  const isNew = daysSincePublished !== null && daysSincePublished <= 14
  const isPending = property.state === 'PROPERTY_PENDING' || statusLower.includes('pending')
  const isSold = property.state === 'SOLD'
  const isPriceReduced = statusLower.includes('reduced') || remarksLower.includes('price reduced')

  let statusLabel: NormalizedListing['statusLabel'] = 'Live'
  if (isSold) statusLabel = 'Sold'
  else if (isPending) statusLabel = 'Pending'
  else if (isPriceReduced) statusLabel = 'Price Reduced'
  else if (isNew) statusLabel = 'New'

  const hasPool = pool.length > 0 || features.some((feature) => feature.toLowerCase().includes('pool'))
  const hasGarage = (enriched.garage_spaces ?? 0) > 0 || features.some((feature) => feature.toLowerCase().includes('garage'))

  const tokens = new Set<string>()
  ;[
    formattedAddress,
    property.city,
    property.state_code,
    property.zip_code,
    propertyType,
    propertySubType ?? undefined,
    property.public_remarks ?? undefined,
    property.brokerage_name ?? undefined,
  ]
    .filter(Boolean)
    .forEach((value) => {
      const lower = value!.toLowerCase()
      tokens.add(lower)
      lower
        .split(/\s+/)
        .map((segment) => segment.trim())
        .filter(Boolean)
        .forEach((segment) => tokens.add(segment))
    })

  return {
    raw: property,
    id: property.id,
    slug: property.slug,
    addressLine,
    formattedAddress,
    city: property.city,
    stateCode: property.state_code,
    zipCode: property.zip_code,
    coordinates: {
      lat: property.latitude ?? null,
      lng: property.longitude ?? null,
    },
    price,
    bedrooms,
    bathrooms,
    sqft,
    lotSizeSqFt,
    lotSizeAcres,
    yearBuilt,
    propertyType,
    propertySubType,
    heroPhoto,
    photoUrls: [heroPhoto, ...photoUrls.filter((url) => url !== heroPhoto)],
    features,
    remarks: property.public_remarks,
    statusLabel,
    isNew,
    isPending,
    isSold,
    isPriceReduced,
    publishedAt,
    lastUpdatedAt: updatedAt,
    brokerageName: property.brokerage_name,
    brokeragePhone: property.brokerage_phone,
    hasPool,
    hasGarage,
    searchTokens: Array.from(tokens),
    locationLabel: [property.city, property.state_code].filter(Boolean).join(', ') || 'Florida',
    score: price > 0 ? 1 / price : 0,
  }
}

export { PLACEHOLDER_IMAGE }
