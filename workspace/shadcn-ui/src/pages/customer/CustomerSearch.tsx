import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Filter, Search, Map as MapIcon, List, SlidersHorizontal, Save, Loader2, Sparkles, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCustomerExperience,
  type PropertySummary,
  type SavedSearch,
  type SortOption,
  type ViewMode,
} from '@/contexts/CustomerExperienceContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { searchConsumerProperties } from '@/lib/api/properties'
import PropertyCard from '@/components/customer/PropertyCard'
import PropertyMap from '@/components/customer/PropertyMap'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/layout/Navbar'
import { normaliseConsumerProperty } from '@/lib/normalizeConsumerProperty'
import type { NormalizedListing } from '@/types/customer-search'

const PROPERTY_TYPE_OPTIONS = [
  { label: 'Single Family', match: ['single', 'single family', 'residential'] },
  { label: 'Condo', match: ['condo', 'condominium'] },
  { label: 'Townhouse', match: ['townhouse', 'townhome'] },
  { label: 'Rental', match: ['rental', 'rent'] },
  { label: 'Land', match: ['land', 'lot'] },
]

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4, 5]
const BATHROOM_OPTIONS = [0, 1, 2, 3, 4]


type FiltersState = {
  priceRange: [number, number]
  bedrooms: number
  bathrooms: number
  propertyTypes: string[]
  sqftRange: [number | null, number | null]
  yearBuiltRange: [number | null, number | null]
  hasGarage: boolean
  hasPool: boolean
}

interface UrlSearchState {
  query?: string
  priceRange?: [number, number]
  bedrooms?: number
  bathrooms?: number
  propertyTypes?: string[]
  sqftRange?: [number | null, number | null]
  yearBuiltRange?: [number | null, number | null]
  hasGarage?: boolean
  hasPool?: boolean
  sort?: SortOption
  viewMode?: ViewMode
  savedSearchId?: string | null
}

const parseSearchParams = (search: string): UrlSearchState | null => {
  if (!search) return null
  const params = new URLSearchParams(search)
  if (Array.from(params.keys()).length === 0) return null

  const toNumber = (value: string | null) => {
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const query = params.get('q') ?? undefined
  const priceMin = toNumber(params.get('priceMin'))
  const priceMax = toNumber(params.get('priceMax'))
  const bedrooms = toNumber(params.get('beds'))
  const bathrooms = toNumber(params.get('baths'))
  const sqftMin = toNumber(params.get('sqftMin'))
  const sqftMax = toNumber(params.get('sqftMax'))
  const yearBuiltMin = toNumber(params.get('yearBuiltMin'))
  const yearBuiltMax = toNumber(params.get('yearBuiltMax'))
  const propertyTypes = params.get('types')?.split(',').map((value) => value.trim()).filter(Boolean) ?? []
  const sortParam = params.get('sort')
  const viewParam = params.get('view')
  const savedSearchId = params.get('savedSearch')

  const result: UrlSearchState = {}
  if (query) result.query = query
  if (priceMin !== undefined || priceMax !== undefined) {
    result.priceRange = [
      priceMin ?? DEFAULT_PRICE_RANGE[0],
      priceMax ?? DEFAULT_PRICE_RANGE[1],
    ]
  }
  if (bedrooms !== undefined) result.bedrooms = bedrooms
  if (bathrooms !== undefined) result.bathrooms = bathrooms
  if (propertyTypes.length > 0) result.propertyTypes = propertyTypes
  if (sqftMin !== undefined || sqftMax !== undefined) {
    result.sqftRange = [sqftMin ?? null, sqftMax ?? null]
  }
  if (yearBuiltMin !== undefined || yearBuiltMax !== undefined) {
    result.yearBuiltRange = [yearBuiltMin ?? null, yearBuiltMax ?? null]
  }
  if (params.get('garage') === '1') result.hasGarage = true
  if (params.get('pool') === '1') result.hasPool = true
  if (sortParam && ['newest', 'priceLowHigh', 'priceHighLow', 'sqft'].includes(sortParam)) {
    result.sort = sortParam as SortOption
  }
  if (viewParam && ['list', 'map'].includes(viewParam)) {
    result.viewMode = viewParam as ViewMode
  }
  if (savedSearchId) result.savedSearchId = savedSearchId

  return result
}

const DEFAULT_PRICE_RANGE: [number, number] = [0, 10_000_000]

type SuggestionType = 'City' | 'ZIP' | 'Address'

interface Suggestion {
  id: string
  label: string
  secondary?: string
  type: SuggestionType
  searchValue: string
}

const buildSuggestions = (listings: NormalizedListing[]): Suggestion[] => {
  const map = new Map<string, Suggestion>()

  listings.forEach((listing) => {
    if (listing.city && listing.stateCode) {
      const key = `city:${listing.city.toLowerCase()}-${listing.stateCode.toLowerCase()}`
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          label: `${listing.city}, ${listing.stateCode}`,
          secondary: 'City match',
          type: 'City',
          searchValue: `${listing.city}, ${listing.stateCode}`,
        })
      }
    }

    if (listing.zipCode) {
      const key = `zip:${listing.zipCode}`
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          label: listing.zipCode,
          secondary: listing.city ? `${listing.city}, ${listing.stateCode ?? 'FL'}` : 'ZIP code',
          type: 'ZIP',
          searchValue: listing.zipCode,
        })
      }
    }

    if (listing.addressLine) {
      const key = `addr:${listing.id}`
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          label: listing.addressLine,
          secondary: [listing.city, listing.stateCode, listing.zipCode].filter(Boolean).join(', '),
          type: 'Address',
          searchValue: listing.addressLine,
        })
      }
    }
  })

  return Array.from(map.values()).slice(0, 40)
}

const useDebouncedValue = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(handle)
  }, [value, delay])
  return debounced
}

const MAX_RECENT_RESULTS = 60

const CustomerSearch: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const paramsFromUrl = useMemo(() => parseSearchParams(location.search), [location.search])


  const {
    isFavorite,
    toggleFavorite,
    recordView,
    saveSearch,
    notificationSettings,
    setLastAppliedFilters,
    lastAppliedFilters,
    savedSearches,
    favorites,
  } = useCustomerExperience()

  const { user } = useAuth()

  const resolvedState = useMemo<UrlSearchState | null>(() => {
    if (!paramsFromUrl?.savedSearchId) {
      return paramsFromUrl
    }
    const saved = savedSearches.find((search) => search.id === paramsFromUrl.savedSearchId)
    if (!saved) {
      return paramsFromUrl
    }
    const priceRange: [number, number] | undefined =
      saved.filters.priceMin !== undefined || saved.filters.priceMax !== undefined
        ? [
            saved.filters.priceMin ?? DEFAULT_PRICE_RANGE[0],
            saved.filters.priceMax ?? DEFAULT_PRICE_RANGE[1],
          ]
        : paramsFromUrl.priceRange

    return {
      query: saved.query ?? paramsFromUrl.query,
      priceRange,
      bedrooms: saved.filters.bedrooms ?? paramsFromUrl.bedrooms,
      bathrooms: saved.filters.bathrooms ?? paramsFromUrl.bathrooms,
      propertyTypes: saved.filters.propertyTypes ?? paramsFromUrl.propertyTypes,
      sqftRange: [
        saved.filters.sqftMin ?? paramsFromUrl.sqftRange?.[0] ?? null,
        saved.filters.sqftMax ?? paramsFromUrl.sqftRange?.[1] ?? null,
      ],
      yearBuiltRange: [
        saved.filters.yearBuiltMin ?? paramsFromUrl.yearBuiltRange?.[0] ?? null,
        saved.filters.yearBuiltMax ?? paramsFromUrl.yearBuiltRange?.[1] ?? null,
      ],
      hasGarage: saved.filters.hasGarage ?? paramsFromUrl.hasGarage ?? false,
      hasPool: saved.filters.hasPool ?? paramsFromUrl.hasPool ?? false,
      sort: saved.sort ?? paramsFromUrl.sort,
      viewMode: saved.viewMode ?? paramsFromUrl.viewMode,
      savedSearchId: saved.id,
    }
  }, [paramsFromUrl, savedSearches])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [properties, setProperties] = useState<NormalizedListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [activeSavedSearchId, setActiveSavedSearchId] = useState<string | null>(() => resolvedState?.savedSearchId ?? null)
  const [searchQuery, setSearchQuery] = useState(() => resolvedState?.query ?? lastAppliedFilters?.query ?? '')
  const [filters, setFilters] = useState<FiltersState>(() => ({
    priceRange: resolvedState?.priceRange ?? lastAppliedFilters?.filters?.priceRange ?? DEFAULT_PRICE_RANGE,
    bedrooms: resolvedState?.bedrooms ?? lastAppliedFilters?.filters?.bedrooms ?? 0,
    bathrooms: resolvedState?.bathrooms ?? lastAppliedFilters?.filters?.bathrooms ?? 0,
    propertyTypes: resolvedState?.propertyTypes ?? lastAppliedFilters?.filters?.propertyTypes ?? [],
    sqftRange: resolvedState?.sqftRange ?? lastAppliedFilters?.filters?.sqftRange ?? [null, null],
    yearBuiltRange: resolvedState?.yearBuiltRange ?? lastAppliedFilters?.filters?.yearBuiltRange ?? [null, null],
    hasGarage: resolvedState?.hasGarage ?? lastAppliedFilters?.filters?.hasGarage ?? false,
    hasPool: resolvedState?.hasPool ?? lastAppliedFilters?.filters?.hasPool ?? false,
  }))
  const [sortOption, setSortOption] = useState<SortOption>(() => resolvedState?.sort ?? lastAppliedFilters?.sort ?? 'newest')
  const [viewMode, setViewMode] = useState<ViewMode>(() => resolvedState?.viewMode ?? lastAppliedFilters?.viewMode ?? 'list')
  const [activeListingId, setActiveListingId] = useState<string | null>(null)
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveEmailAlerts, setSaveEmailAlerts] = useState(notificationSettings.emailAlerts)
  const [saveSmsAlerts, setSaveSmsAlerts] = useState(notificationSettings.smsAlerts)
  const [suggestionOpen, setSuggestionOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const updateSearchQuery = useCallback((value: string) => {
    setActiveSavedSearchId(null)
    setSearchQuery(value)
  }, [])

  const updateFilters = useCallback((updater: Partial<FiltersState> | ((prev: FiltersState) => FiltersState)) => {
    setActiveSavedSearchId(null)
    if (typeof updater === 'function') {
      setFilters(updater)
    } else {
      setFilters((prev) => ({ ...prev, ...updater }))
    }
  }, [])

  useEffect(() => {
    if (!resolvedState) return

    setActiveSavedSearchId(resolvedState.savedSearchId ?? null)
    setSearchQuery(resolvedState.query ?? '')
    setFilters({
      priceRange: resolvedState.priceRange ?? DEFAULT_PRICE_RANGE,
      bedrooms: resolvedState.bedrooms ?? 0,
      bathrooms: resolvedState.bathrooms ?? 0,
      propertyTypes: resolvedState.propertyTypes ?? [],
      sqftRange: resolvedState.sqftRange ?? [null, null],
      yearBuiltRange: resolvedState.yearBuiltRange ?? [null, null],
      hasGarage: resolvedState.hasGarage ?? false,
      hasPool: resolvedState.hasPool ?? false,
    })
    setSortOption(resolvedState.sort ?? 'newest')
    setViewMode(resolvedState.viewMode ?? 'list')
  }, [resolvedState])

  const debouncedQuery = useDebouncedValue(searchQuery, 350)

  useEffect(() => {
    setSaveEmailAlerts(notificationSettings.emailAlerts)
    setSaveSmsAlerts(notificationSettings.smsAlerts)
  }, [notificationSettings.emailAlerts, notificationSettings.smsAlerts])

  const backendFilterKey = useMemo(() => JSON.stringify({
    priceMin: filters.priceRange[0] || undefined,
    priceMax: filters.priceRange[1] === DEFAULT_PRICE_RANGE[1] ? undefined : filters.priceRange[1],
    bedroomsMin: filters.bedrooms || undefined,
    bathroomsMin: filters.bathrooms || undefined,
    propertyType: filters.propertyTypes.length === 1 ? filters.propertyTypes[0] : undefined,
  }), [filters])

  useEffect(() => {
    const lastSnapshot = {
      query: searchQuery,
      filters: {
        priceRange: filters.priceRange,
        bedrooms: filters.bedrooms || null,
        bathrooms: filters.bathrooms || null,
        propertyTypes: filters.propertyTypes,
        sqftRange: filters.sqftRange,
        yearBuiltRange: filters.yearBuiltRange,
        hasGarage: filters.hasGarage,
        hasPool: filters.hasPool,
      },
      sort: sortOption,
      viewMode,
    }
    setLastAppliedFilters(lastSnapshot)
  }, [filters, searchQuery, setLastAppliedFilters, sortOption, viewMode])

  useEffect(() => {
    let isCancelled = false

    const fetchListings = async () => {
      setIsLoading(true)
      setFetchError(null)

      const parsedFilters = JSON.parse(backendFilterKey) as {
        priceMin?: number
        priceMax?: number
        bedroomsMin?: number
        bathroomsMin?: number
        propertyType?: string
      }

      try {
        const response = await searchConsumerProperties({
          q: debouncedQuery.trim() || undefined,
          filters: parsedFilters,
          limit: 200,
        })

        if (isCancelled) return

        const normalised = response.map(normaliseConsumerProperty)
        setProperties(normalised.slice(0, MAX_RECENT_RESULTS))
        if (normalised.length > 0) {
          setActiveListingId(normalised[0].id)
        }
      } catch (error) {
        console.error('Failed to load consumer properties', error)
        if (!isCancelled) {
          setFetchError('Unable to load properties. Please try again shortly.')
          setProperties([])
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void fetchListings()

    return () => {
      isCancelled = true
    }
  }, [backendFilterKey, debouncedQuery])

  const suggestions = useMemo(() => buildSuggestions(properties), [properties])

  const activeSavedSearch = useMemo(() => savedSearches.find((search) => search.id === activeSavedSearchId) ?? null, [savedSearches, activeSavedSearchId])

  const averageFavoritePrice = useMemo(() => {
    if (favorites.length === 0) return null
    const total = favorites.reduce((sum, favorite) => sum + (favorite.price ?? 0), 0)
    return total > 0 ? total / favorites.length : null
  }, [favorites])



  const filteredProperties = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()

    const result = properties.filter((property) => {
      const withinPrice = property.price >= filters.priceRange[0] && property.price <= filters.priceRange[1]
      if (!withinPrice) return false

      if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false
      if (filters.bathrooms && property.bathrooms < filters.bathrooms) return false

      if (filters.propertyTypes.length > 0) {
        const propertyTypeKey = property.propertyType.toLowerCase()
        const subTypeKey = property.propertySubType?.toLowerCase() ?? ''
        const matchesType = filters.propertyTypes.some((option) => {
          const lowered = option.toLowerCase()
          return propertyTypeKey.includes(lowered) || subTypeKey.includes(lowered)
        })
        if (!matchesType) return false
      }

      if (filters.sqftRange[0] && property.sqft < filters.sqftRange[0]!) return false
      if (filters.sqftRange[1] && property.sqft > filters.sqftRange[1]!) return false

      if (filters.yearBuiltRange[0] && (!property.yearBuilt || property.yearBuilt < filters.yearBuiltRange[0]!)) return false
      if (filters.yearBuiltRange[1] && (!property.yearBuilt || property.yearBuilt > filters.yearBuiltRange[1]!)) return false

      if (filters.hasPool && !property.hasPool) return false
      if (filters.hasGarage && !property.hasGarage) return false

      if (term.length > 0) {
        const matchesSearch = property.searchTokens.some((token) => token.includes(term))
        if (!matchesSearch) return false
      }

      return true
    })

    const sorted = result.slice().sort((a, b) => {
      if (sortOption === 'priceLowHigh') return a.price - b.price
      if (sortOption === 'priceHighLow') return b.price - a.price
      if (sortOption === 'sqft') return b.sqft - a.sqft

      const dateA = a.publishedAt ? Date.parse(a.publishedAt) : Date.parse(a.lastUpdatedAt)
      const dateB = b.publishedAt ? Date.parse(b.publishedAt) : Date.parse(b.lastUpdatedAt)
      return dateB - dateA
    })

    return sorted
  }, [debouncedQuery, filters, properties, sortOption])

  const aiRecommendations = useMemo(() => {
    if (filteredProperties.length === 0) return []
    const typeCounts = favorites.reduce<Map<string, number>>((acc, favorite) => {
      const key = favorite.propertyType ? favorite.propertyType.toLowerCase() : null
      if (key) {
        acc.set(key, (acc.get(key) ?? 0) + 1)
      }
      return acc
    }, new Map())

    const favoriteIds = new Set(favorites.map((favorite) => favorite.id))
    const basePrice = averageFavoritePrice

    return filteredProperties
      .filter((property) => !favoriteIds.has(property.id))
      .map((property) => {
        const typeScore = typeCounts.get(property.propertyType.toLowerCase()) ?? 0
        const priceScore = basePrice && property.price
          ? 1 / (1 + Math.abs(property.price - basePrice) / basePrice)
          : 0
        const freshnessScore = property.isNew ? 0.5 : 0
        return { property, score: typeScore * 2 + priceScore + freshnessScore }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.property)
      .slice(0, 6)
  }, [filteredProperties, favorites, averageFavoritePrice])

  useEffect(() => {
    if (filteredProperties.length === 0) {
      setActiveListingId(null)
      return
    }
    if (!activeListingId || !filteredProperties.find((property) => property.id === activeListingId)) {
      setActiveListingId(filteredProperties[0].id)
    }
  }, [activeListingId, filteredProperties])

  const handleRequireAuth = useCallback((action: () => void) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    action()
  }, [user])

  const listingToSummary = useCallback((listing: NormalizedListing): PropertySummary => ({
    id: listing.id,
    slug: listing.slug ?? undefined,
    address: listing.addressLine || listing.formattedAddress,
    city: listing.city ?? undefined,
    state: listing.stateCode ?? undefined,
    zipCode: listing.zipCode ?? undefined,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    photoUrl: listing.heroPhoto,
    status: listing.statusLabel,
    propertyType: listing.propertyType,
    latitude: listing.coordinates.lat ?? undefined,
    longitude: listing.coordinates.lng ?? undefined,
  }), [])

  const handleToggleFavorite = useCallback(async (listing: NormalizedListing) => {
    handleRequireAuth(() => {
      void toggleFavorite(listingToSummary(listing))
      toast.success(isFavorite(listing.id) ? 'Removed from favorites' : 'Saved to favorites')
    })
  }, [handleRequireAuth, isFavorite, listingToSummary, toggleFavorite])

  const handleViewDetails = useCallback((listing: NormalizedListing) => {
    recordView(listingToSummary(listing))
    navigate(`/customer/property/${listing.slug ?? listing.id}`)
  }, [navigate, recordView, listingToSummary])

  const visibleSuggestionList = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    if (term.length === 0) {
      return suggestions.slice(0, 6)
    }
    return suggestions.filter((suggestion) => suggestion.label.toLowerCase().includes(term)).slice(0, 8)
  }, [searchQuery, suggestions])

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    updateSearchQuery(suggestion.searchValue)
    setSuggestionOpen(false)
  }

  const handlePropertyTypeToggle = (value: string) => {
    updateFilters((prev) => {
      const hasValue = prev.propertyTypes.includes(value)
      return {
        ...prev,
        propertyTypes: hasValue
          ? prev.propertyTypes.filter((item) => item !== value)
          : [...prev.propertyTypes, value],
      }
    })
  }

  const handleSaveSearch = () => {
    handleRequireAuth(() => setIsSaveDialogOpen(true))
  }

  const submitSaveSearch = () => {
    if (!saveName.trim()) {
      toast.error('Give your saved search a name')
      return
    }

    const payload: Omit<SavedSearch, 'id' | 'createdAt'> = {
      name: saveName.trim(),
      query: searchQuery,
      filters: {
        priceMin: filters.priceRange[0],
        priceMax: filters.priceRange[1],
        bedrooms: filters.bedrooms || undefined,
        bathrooms: filters.bathrooms || undefined,
        propertyTypes: filters.propertyTypes,
        sqftMin: filters.sqftRange[0] ?? undefined,
        sqftMax: filters.sqftRange[1] ?? undefined,
        yearBuiltMin: filters.yearBuiltRange[0] ?? undefined,
        yearBuiltMax: filters.yearBuiltRange[1] ?? undefined,
        hasGarage: filters.hasGarage || undefined,
        hasPool: filters.hasPool || undefined,
      },
      sort: sortOption,
      viewMode,
      notifyEmail: saveEmailAlerts,
      notifySms: saveSmsAlerts,
    }

    const saved = saveSearch(payload)
    toast.success(`Saved search “${saved.name}”`)
    setIsSaveDialogOpen(false)
    setSaveName('')
  }

  const activeCountLabel = filteredProperties.length === 1 ? 'home' : 'homes'

  const selectedForMap = hoveredListingId
    ? filteredProperties.find((listing) => listing.id === hoveredListingId)
    : filteredProperties.find((listing) => listing.id === activeListingId) ?? null

  return (
    <>
      <Navbar />
      <div className="bg-slate-50 pb-16 pt-12">
        <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Find Homes Tailored to You</h1>
          <p className="mt-2 text-slate-600">
            Explore Florida listings, fine-tune filters, and switch to map view to explore neighborhoods in real time.
          </p>
        </div>

        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <Card className="mb-6 border-indigo-100 shadow-sm sticky top-24 z-30 bg-white/95 backdrop-blur md:static md:z-auto md:bg-white md:backdrop-blur-none">
            <CardHeader className="space-y-4 pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-indigo-500" /> Smart Search
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full border-indigo-200 text-indigo-600"
                  onClick={() => setFiltersOpen((prev) => !prev)}
                >
                  Filters
                  <ChevronDown className={cn('h-4 w-4 transition-transform', filtersOpen ? 'rotate-180' : '')} />
                </Button>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => updateSearchQuery(event.target.value)}
                  onFocus={() => setSuggestionOpen(true)}
                  onBlur={() => window.setTimeout(() => setSuggestionOpen(false), 120)}
                  placeholder="Search by city, ZIP, or address"
                  className="h-12 rounded-xl border-slate-200 pl-10 pr-4 text-base shadow-sm focus:border-indigo-400 focus:ring-indigo-200"
                />
                {suggestionOpen && visibleSuggestionList.length > 0 && (
                  <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {visibleSuggestionList.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onMouseDown={() => handleSelectSuggestion(suggestion)}
                        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-indigo-50"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">{suggestion.label}</div>
                          {suggestion.secondary && (
                            <div className="text-xs text-slate-500">{suggestion.secondary}</div>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                          {suggestion.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {activeSavedSearch && (
                  <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                    <span>Showing results for saved search <strong>{activeSavedSearch.name}</strong></span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSavedSearchId(null)}>Clear</Button>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Property Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
                        <Button
                          key={option.label}
                          type="button"
                          variant={filters.propertyTypes.includes(option.label) ? 'default' : 'outline'}
                          className="rounded-full border-slate-200 text-xs"
                          onClick={() => handlePropertyTypeToggle(option.label)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Bedrooms</Label>
                    <ToggleGroup
                      type="single"
                      value={String(filters.bedrooms)}
                      onValueChange={(value) => updateFilters((prev) => ({ ...prev, bedrooms: Number(value) }))}
                      className="flex flex-wrap gap-2"
                    >
                      {BEDROOM_OPTIONS.map((value) => (
                        <ToggleGroupItem key={value} value={String(value)} className="rounded-full border-slate-200 px-4">
                          {value === 0 ? 'Any' : `${value}+`}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Bathrooms</Label>
                    <ToggleGroup
                      type="single"
                      value={String(filters.bathrooms)}
                      onValueChange={(value) => updateFilters((prev) => ({ ...prev, bathrooms: Number(value) }))}
                      className="flex flex-wrap gap-2"
                    >
                      {BATHROOM_OPTIONS.map((value) => (
                        <ToggleGroupItem key={value} value={String(value)} className="rounded-full border-slate-200 px-4">
                          {value === 0 ? 'Any' : `${value}+`}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-slate-700">Price Range</Label>
                    <div className="px-1 pb-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => updateFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))}
                        min={0}
                        max={10_000_000}
                        step={25_000}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(filters.priceRange[0])}</span>
                      <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                      <SlidersHorizontal className="h-4 w-4" /> More filters
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Square Footage</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder="Min"
                            value={filters.sqftRange[0] ?? ''}
                            onChange={(event) =>
                              updateFilters((prev) => ({
                                ...prev,
                                sqftRange: [event.target.value ? Number(event.target.value) : null, prev.sqftRange[1]],
                              }))
                            }
                          />
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder="Max"
                            value={filters.sqftRange[1] ?? ''}
                            onChange={(event) =>
                              updateFilters((prev) => ({
                                ...prev,
                                sqftRange: [prev.sqftRange[0], event.target.value ? Number(event.target.value) : null],
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Year Built</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="From"
                            value={filters.yearBuiltRange[0] ?? ''}
                            onChange={(event) =>
                              updateFilters((prev) => ({
                                ...prev,
                                yearBuiltRange: [event.target.value ? Number(event.target.value) : null, prev.yearBuiltRange[1]],
                              }))
                            }
                          />
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="To"
                            value={filters.yearBuiltRange[1] ?? ''}
                            onChange={(event) =>
                              updateFilters((prev) => ({
                                ...prev,
                                yearBuiltRange: [prev.yearBuiltRange[0], event.target.value ? Number(event.target.value) : null],
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700">Amenities</Label>
                        <div className="flex flex-col gap-2 text-sm text-slate-700">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={filters.hasGarage}
                              onCheckedChange={(checked) =>
                                updateFilters((prev) => ({ ...prev, hasGarage: Boolean(checked) }))
                              }
                            />
                            Garage
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={filters.hasPool}
                              onCheckedChange={(checked) =>
                                updateFilters((prev) => ({ ...prev, hasPool: Boolean(checked) }))
                              }
                            />
                            Pool
                          </label>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      {filteredProperties.length} {activeCountLabel}
                    </Badge>
                    <span>Sorted by</span>
                    <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                      <SelectTrigger className="h-10 w-44 rounded-full border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="priceLowHigh">Price: Low to High</SelectItem>
                        <SelectItem value="priceHighLow">Price: High to Low</SelectItem>
                        <SelectItem value="sqft">Square Footage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => {
                      updateFilters({
                        priceRange: DEFAULT_PRICE_RANGE,
                        bedrooms: 0,
                        bathrooms: 0,
                        propertyTypes: [],
                        sqftRange: [null, null],
                        yearBuiltRange: [null, null],
                        hasGarage: false,
                        hasPool: false,
                      })
                      setActiveSavedSearchId(null)
                      updateSearchQuery('')
                    }}>
                      Reset
                    </Button>
                    <Button variant="outline" onClick={handleSaveSearch} className="flex items-center gap-2">
                      <Save className="h-4 w-4" /> Save search
                    </Button>
                    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
                      <ToggleGroupItem value="list" className="rounded-full px-4">
                        <List className="mr-1 h-4 w-4" /> List
                      </ToggleGroupItem>
                      <ToggleGroupItem value="map" className="rounded-full px-4">
                        <MapIcon className="mr-1 h-4 w-4" /> Map
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-indigo-200 bg-white py-20 text-indigo-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading homes…
          </div>
        )}

        {fetchError && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {fetchError}
          </div>
        )}

        {!isLoading && !fetchError && aiRecommendations.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-indigo-700">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-slate-900">Homes you may like</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {aiRecommendations.map((property) => (
                <div key={property.id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
                  <PropertyCard
                    listing={property}
                    isFavorite={isFavorite(property.id)}
                    onToggleFavorite={() => handleToggleFavorite(property)}
                    onViewDetails={() => handleViewDetails(property)}
                    onHover={(listing) => setHoveredListingId(listing?.id ?? null)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !fetchError && filteredProperties.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">
            No properties match these filters yet. Try widening your search.
          </div>
        )}

        {!isLoading && !fetchError && filteredProperties.length > 0 && (
          viewMode === 'map' ? (
            <PropertyMap
              listings={filteredProperties}
              selectedId={selectedForMap?.id ?? null}
              onSelect={(listing) => setActiveListingId(listing.id)}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
              onViewDetails={handleViewDetails}
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <div key={property.id} className="w-80 flex-shrink-0 md:w-full">
                  <PropertyCard
                    listing={property}
                    isFavorite={isFavorite(property.id)}
                    onToggleFavorite={() => handleToggleFavorite(property)}
                    onViewDetails={() => handleViewDetails(property)}
                    onHover={(listing) => setHoveredListingId(listing?.id ?? null)}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>

    <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save this search</DialogTitle>
          <DialogDescription>
            Name your search and opt into alerts so we can notify you when matching homes hit the market.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Miami Waterfront" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Alerts</Label>
            <div className="flex flex-col gap-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <Checkbox checked={saveEmailAlerts} onCheckedChange={(checked) => setSaveEmailAlerts(Boolean(checked))} />
                Email me when new homes match
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={saveSmsAlerts} onCheckedChange={(checked) => setSaveSmsAlerts(Boolean(checked))} />
                Send SMS alerts
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitSaveSearch}>Save Search</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
  </>
  )
}

export default CustomerSearch
