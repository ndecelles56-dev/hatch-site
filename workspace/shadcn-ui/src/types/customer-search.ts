import type { SortOption, ViewMode } from '@/contexts/CustomerExperienceContext'
import type { Database } from './database'

export type ConsumerPropertyRow = Database['public']['Views']['vw_consumer_properties']['Row']

export interface NormalizedListing {
  raw: ConsumerPropertyRow
  id: string
  slug: string | null
  addressLine: string
  formattedAddress: string
  city: string | null
  stateCode: string | null
  zipCode: string | null
  coordinates: {
    lat: number | null
    lng: number | null
  }
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  lotSizeSqFt: number | null
  lotSizeAcres: number | null
  yearBuilt: number | null
  propertyType: string
  propertySubType: string | null
  heroPhoto: string
  photoUrls: string[]
  features: string[]
  remarks: string | null
  statusLabel: 'New' | 'Price Reduced' | 'Pending' | 'Sold' | 'Live'
  isNew: boolean
  isPending: boolean
  isSold: boolean
  isPriceReduced: boolean
  publishedAt: string | null
  lastUpdatedAt: string
  brokerageName: string | null
  brokeragePhone: string | null
  hasPool: boolean
  hasGarage: boolean
  searchTokens: string[]
  locationLabel: string
  score: number
}

export interface SearchStateSnapshot {
  query: string
  filters: {
    priceRange: [number, number]
    bedrooms: number | null
    bathrooms: number | null
    propertyTypes: string[]
    sqftRange: [number | null, number | null]
    yearBuiltRange: [number | null, number | null]
    hasGarage: boolean
    hasPool: boolean
  }
  sort: SortOption
  viewMode: ViewMode
}
