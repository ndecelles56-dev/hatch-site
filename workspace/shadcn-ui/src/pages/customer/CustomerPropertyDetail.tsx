import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  Calendar,
  Car,
  Copy,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Square,
  Star,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCustomerExperience,
  type PropertySummary,
  type LeadRequest,
} from '@/contexts/CustomerExperienceContext'
import { AuthModal } from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Map, Marker } from 'pigeon-maps'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PropertyCard from '@/components/customer/PropertyCard'
import { Navbar } from '@/components/layout/Navbar'
import { getConsumerProperty, searchConsumerProperties } from '@/lib/api/properties'
import { normaliseConsumerProperty, PLACEHOLDER_IMAGE } from '@/lib/normalizeConsumerProperty'
import type { ConsumerPropertyRow, NormalizedListing } from '@/types/customer-search'

const formatPrice = (price?: number | null) => {
  if (!price || Number.isNaN(price)) return 'Contact for pricing'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

const formatNumber = (value?: number | null, unit?: string) => {
  if (!value || Number.isNaN(value)) return '—'
  return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`
}

const toPropertySummary = (property: ConsumerPropertyRow, normalized: NormalizedListing): PropertySummary => ({
  id: property.id,
  slug: property.slug ?? undefined,
  address: normalized.addressLine || normalized.formattedAddress,
  city: property.city ?? undefined,
  state: property.state_code ?? undefined,
  zipCode: property.zip_code ?? undefined,
  price: property.list_price ?? undefined,
  bedrooms: property.bedrooms_total ?? undefined,
  bathrooms: property.bathrooms_total ?? property.bathrooms_full ?? undefined,
  sqft: property.living_area_sq_ft ?? undefined,
  photoUrl: normalized.heroPhoto,
  status: normalized.statusLabel,
  propertyType: normalized.propertyType,
  latitude: property.latitude ?? undefined,
  longitude: property.longitude ?? undefined,
})

const normalizedToSummary = (home: NormalizedListing): PropertySummary => ({
  id: home.id,
  slug: home.slug ?? undefined,
  address: home.addressLine || home.formattedAddress,
  city: home.city ?? undefined,
  state: home.stateCode ?? undefined,
  zipCode: home.zipCode ?? undefined,
  price: home.price ?? undefined,
  bedrooms: home.bedrooms ?? undefined,
  bathrooms: home.bathrooms ?? undefined,
  sqft: home.sqft ?? undefined,
  photoUrl: home.heroPhoto,
  status: home.statusLabel,
  propertyType: home.propertyType,
  latitude: home.coordinates.lat ?? undefined,
  longitude: home.coordinates.lng ?? undefined,
})

interface NearbyPlace {
  id: string
  name: string
  type: 'School' | 'Shop' | 'Park' | 'Dining'
  distance: string
  description: string
  coordinates?: { lat: number; lng: number }
}

const buildNearbyPlaces = (
  city: string | null,
  coordinates: { lat: number | null; lng: number | null }
): NearbyPlace[] => {
  const baseName = city ?? 'Local'
  const defaults: NearbyPlace[] = [
    {
      id: 'school',
      name: `${baseName} Preparatory School`,
      type: 'School',
      distance: '1.2 mi',
      description: 'Highly rated K-8 academy with STEM enrichment.',
    },
    {
      id: 'shop',
      name: `${baseName} Commons`,
      type: 'Shop',
      distance: '0.9 mi',
      description: 'Boutique shopping, cafes, and weekly farmers market.',
    },
    {
      id: 'park',
      name: `${baseName} Riverwalk Park`,
      type: 'Park',
      distance: '1.8 mi',
      description: 'Waterfront greenspace with walking trails and kayak launch.',
    },
    {
      id: 'dining',
      name: 'Harbor House Dining',
      type: 'Dining',
      distance: '0.6 mi',
      description: 'Locally loved seafood bistro with marina views.',
    },
  ]

  if (coordinates.lat !== null && coordinates.lng !== null) {
    const deltas = [
      { lat: 0.012, lng: -0.008 },
      { lat: -0.01, lng: 0.01 },
      { lat: 0.006, lng: 0.014 },
      { lat: -0.014, lng: -0.012 },
    ]
    return defaults.map((place, index) => ({
      ...place,
      coordinates: {
        lat: coordinates.lat! + deltas[index].lat,
        lng: coordinates.lng! + deltas[index].lng,
      },
    }))
  }

  return defaults
}

const generateTestimonials = (city: string | null) => [
  {
    name: 'Elena M.',
    quote: `We moved to ${city ?? 'the neighborhood'} last year and love the community atmosphere and weekend events.`,
    rating: 5,
  },
  {
    name: 'Ravi & Priya',
    quote: 'The schools are fantastic and everything is nearby—shopping, parks, and waterfront dining.',
    rating: 5,
  },
]

interface HomeValuationProps {
  baselinePricePerSqft: number | null
  defaults: { sqft: number; beds: number; baths: number }
}

const HomeValuationCard: React.FC<HomeValuationProps> = ({ baselinePricePerSqft, defaults }) => {
  const [inputs, setInputs] = useState({
    sqft: Math.max(defaults.sqft, 1200),
    beds: Math.max(defaults.beds, 2),
    baths: Math.max(defaults.baths, 2),
    condition: 'updated' as 'needs-love' | 'updated' | 'renovated',
  })

  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      sqft: Math.max(defaults.sqft, 1200),
      beds: Math.max(defaults.beds, 2),
      baths: Math.max(defaults.baths, 2),
    }))
  }, [defaults.sqft, defaults.beds, defaults.baths])

  const estimate = useMemo(() => {
    const basePrice = baselinePricePerSqft && baselinePricePerSqft > 0 ? baselinePricePerSqft : 320
    const conditionMultiplier =
      inputs.condition === 'renovated' ? 1.08 : inputs.condition === 'needs-love' ? 0.92 : 1
    const pricePerSqft = basePrice * conditionMultiplier
    const bedroomAdjustment = (inputs.beds - defaults.beds) * 8000
    const bathroomAdjustment = (inputs.baths - defaults.baths) * 6000
    const estimatedValue = inputs.sqft * pricePerSqft + bedroomAdjustment + bathroomAdjustment
    return Math.max(Math.round(estimatedValue / 1000) * 1000, 0)
  }, [baselinePricePerSqft, defaults.baths, defaults.beds, inputs])

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's your home worth?</CardTitle>
        <CardDescription>Estimate value using comparable price per square foot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Square footage</Label>
            <Input
              type="number"
              min={600}
              value={inputs.sqft}
              onChange={(event) => setInputs((prev) => ({ ...prev, sqft: Number(event.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input
              type="number"
              min={1}
              value={inputs.beds}
              onChange={(event) => setInputs((prev) => ({ ...prev, beds: Number(event.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Input
              type="number"
              min={1}
              step={0.5}
              value={inputs.baths}
              onChange={(event) => setInputs((prev) => ({ ...prev, baths: Number(event.target.value) }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Condition</Label>
          <Select value={inputs.condition} onValueChange={(value) => setInputs((prev) => ({ ...prev, condition: value as 'needs-love' | 'updated' | 'renovated' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="needs-love">Needs work</SelectItem>
              <SelectItem value="updated">Move-in ready</SelectItem>
              <SelectItem value="renovated">Recently renovated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="rounded-xl bg-emerald-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Estimated value</p>
          <p className="text-2xl font-semibold text-emerald-700">{formatPrice(estimate)}</p>
          <p className="text-xs text-emerald-700">Based on ${Math.round((baselinePricePerSqft ?? 320))}/sqft comparables.</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface MortgageInputs {
  homePrice: number
  downPaymentPercent: number
  interestRate: number
  termYears: number
  propertyTaxRate: number
  insurance: number
  hoa: number
}

const MortgageCalculator: React.FC<{ price: number }> = ({ price }) => {
  const [inputs, setInputs] = useState<MortgageInputs>({
    homePrice: Math.max(price, 0),
    downPaymentPercent: 20,
    interestRate: 6.5,
    termYears: 30,
    propertyTaxRate: 1.1,
    insurance: 150,
    hoa: 0,
  })

  useEffect(() => {
    if (!price || Number.isNaN(price)) return
    setInputs((prev) => ({ ...prev, homePrice: price }))
  }, [price])

  const breakdown = useMemo(() => {
    const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100)
    const loanAmount = Math.max(inputs.homePrice - downPayment, 0)
    const monthlyRate = inputs.interestRate / 100 / 12
    const totalPayments = Math.max(inputs.termYears * 12, 1)
    const principalAndInterest = monthlyRate === 0
      ? loanAmount / totalPayments
      : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1)

    const monthlyTaxes = (inputs.homePrice * (inputs.propertyTaxRate / 100)) / 12
    const totalMonthly = principalAndInterest + monthlyTaxes + inputs.insurance + inputs.hoa

    return {
      downPayment,
      loanAmount,
      principalAndInterest,
      monthlyTaxes,
      totalMonthly,
    }
  }, [inputs])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mortgage Snapshot</CardTitle>
        <p className="text-sm text-slate-600">Adjust the numbers to tailor an estimate for your financing.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Home price</Label>
            <Input
              type="number"
              min={0}
              value={Math.round(inputs.homePrice)}
              onChange={(event) => setInputs((prev) => ({ ...prev, homePrice: Number(event.target.value) }))}
            />
          </div>
          <div>
            <Label>Down payment %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              value={inputs.downPaymentPercent}
              onChange={(event) => setInputs((prev) => ({ ...prev, downPaymentPercent: Number(event.target.value) }))}
            />
          </div>
          <div>
            <Label>Interest rate %</Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={inputs.interestRate}
              onChange={(event) => setInputs((prev) => ({ ...prev, interestRate: Number(event.target.value) }))}
            />
          </div>
          <div>
            <Label>Loan term (years)</Label>
            <Input
              type="number"
              min={1}
              value={inputs.termYears}
              onChange={(event) => setInputs((prev) => ({ ...prev, termYears: Number(event.target.value) }))}
            />
          </div>
          <div>
            <Label>Property tax %</Label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={inputs.propertyTaxRate}
              onChange={(event) => setInputs((prev) => ({ ...prev, propertyTaxRate: Number(event.target.value) }))}
            />
          </div>
          <div>
            <Label>Insurance (monthly $)</Label>
            <Input
              type="number"
              min={0}
              value={Math.round(inputs.insurance)}
              onChange={(event) => setInputs((prev) => ({ ...prev, insurance: Number(event.target.value) }))}
            />
          </div>
          <div>
            <Label>HOA (monthly $)</Label>
            <Input
              type="number"
              min={0}
              value={Math.round(inputs.hoa)}
              onChange={(event) => setInputs((prev) => ({ ...prev, hoa: Number(event.target.value) }))}
            />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Down payment</p>
            <p className="text-lg font-semibold text-slate-900">{formatPrice(Math.round(breakdown.downPayment))}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Loan amount</p>
            <p className="text-lg font-semibold text-slate-900">{formatPrice(Math.round(breakdown.loanAmount))}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Principal & interest</p>
            <p className="text-lg font-semibold text-slate-900">{formatPrice(Math.round(breakdown.principalAndInterest))}/mo</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Estimated taxes</p>
            <p className="text-lg font-semibold text-slate-900">{formatPrice(Math.round(breakdown.monthlyTaxes))}/mo</p>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-indigo-600">Estimated monthly payment</p>
          <p className="text-2xl font-semibold text-indigo-700">{formatPrice(Math.round(breakdown.totalMonthly))}</p>
          <p className="text-xs text-indigo-600">Includes loan, taxes, insurance, and HOA (if entered).</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface LeadFormState {
  name: string
  email: string
  phone: string
  date: string
  time: string
  message: string
  channel: 'schedule' | 'contact'
}

const CustomerPropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    isFavorite,
    toggleFavorite,
    recordView,
    recordLeadRequest,
  } = useCustomerExperience()

  const [property, setProperty] = useState<ConsumerPropertyRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [similarHomes, setSimilarHomes] = useState<NormalizedListing[]>([])
  const [similarLoading, setSimilarLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadForm, setLeadForm] = useState<LeadFormState>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
    channel: 'schedule',
  })
  const [agentModalOpen, setAgentModalOpen] = useState(false)

  const requireAuth = useCallback((action: () => void) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    action()
  }, [user])

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return
      setIsLoading(true)
      setError(null)

      try {
        const data = await getConsumerProperty(id)
        setProperty(data)
        setGalleryIndex(0)
      } catch (err) {
        console.error('Failed to load consumer property', err)
        setError('This property is no longer available or could not be found.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProperty()
  }, [id])

  const normalized = useMemo(() => (
    property ? normaliseConsumerProperty(property) : null
  ), [property])

  useEffect(() => {
    if (!normalized || !property) return
    const summary = toPropertySummary(property, normalized)
    recordView(summary)
  }, [normalized, property, recordView])

  useEffect(() => {
    if (!normalized) return

    setSimilarLoading(true)
    const fetchSimilar = async () => {
      try {
        const filters: Record<string, unknown> = {}
        if (normalized.price > 0) {
          filters.priceMin = Math.max(Math.floor(normalized.price * 0.75), 0)
          filters.priceMax = Math.ceil(normalized.price * 1.25)
        }
        if (normalized.propertyType) {
          filters.propertyType = normalized.propertyType
        }
        const response = await searchConsumerProperties({
          q: normalized.city ?? undefined,
          filters,
          limit: 12,
        })
        const normalizedResults = response
          .map(normaliseConsumerProperty)
          .filter((listing) => listing.id !== normalized.id)
          .slice(0, 6)
        setSimilarHomes(normalizedResults)
      } catch (err) {
        console.error('Failed to load similar homes', err)
        setSimilarHomes([])
      } finally {
        setSimilarLoading(false)
      }
    }

    void fetchSimilar()
  }, [normalized])

  useEffect(() => {
    setLeadForm((prev) => ({
      ...prev,
      email: prev.email || user?.email || '',
      name: prev.name || (property?.city ? `${property.city} Buyer` : ''),
    }))
  }, [property?.city, user?.email])

  const mediaImages = useMemo(() => {
    if (normalized?.photoUrls?.length) {
      return normalized.photoUrls
    }
    if (normalized?.heroPhoto) {
      return [normalized.heroPhoto]
    }
    return [PLACEHOLDER_IMAGE]
  }, [normalized])

  const isSaved = normalized ? isFavorite(normalized.id) : false
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const pricePerSqft = useMemo(() => {
    if (!normalized) return null
    if (normalized.price && normalized.sqft) {
      return normalized.price / normalized.sqft
    }
    if (similarHomes.length > 0) {
      const values = similarHomes.filter((home) => home.price && home.sqft)
      if (values.length > 0) {
        const total = values.reduce((sum, home) => sum + (home.price ?? 0) / Math.max(home.sqft, 1), 0)
        return total / values.length
      }
    }
    return null
  }, [normalized, similarHomes])

  const valuationDefaults = useMemo(() => {
    if (!normalized) {
      return { sqft: 1800, beds: 3, baths: 2 }
    }
    return {
      sqft: normalized.sqft > 0 ? normalized.sqft : 1800,
      beds: normalized.bedrooms > 0 ? normalized.bedrooms : 3,
      baths: normalized.bathrooms > 0 ? normalized.bathrooms : 2,
    }
  }, [normalized])

  const nearbyPlaces = useMemo(() => (
    normalized ? buildNearbyPlaces(normalized.city, normalized.coordinates) : []
  ), [normalized])

  const testimonials = useMemo(() => generateTestimonials(normalized?.city ?? null), [normalized?.city])

  const handleFavorite = () => {
    if (!normalized || !property) return
    requireAuth(() => {
      void toggleFavorite(toPropertySummary(property, normalized))
      toast.success(isFavorite(normalized.id) ? 'Removed from favorites' : 'Saved to favorites')
    })
  }

  const handleShare = async () => {
    if (!normalized) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${normalized.propertyType} in ${normalized.city ?? 'Florida'}`,
          text: normalized.formattedAddress,
          url: shareUrl,
        })
        return
      }
    } catch (err) {
      console.warn('Native share failed', err)
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch (err) {
      console.error('Clipboard copy failed', err)
      toast.error('Unable to copy link automatically.')
    }
  }

  const handleLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!normalized || !property) return

    requireAuth(() => {
      setLeadSubmitting(true)
      try {
        const entry: Omit<LeadRequest, 'id' | 'createdAt'> = {
          propertyId: property.id,
          propertyAddress: normalized.formattedAddress,
          propertyPrice: property.list_price ?? null,
          contactName: leadForm.name.trim() || 'Prospective Buyer',
          contactEmail: leadForm.email.trim() || 'unknown@email.com',
          contactPhone: leadForm.phone.trim() || null,
          preferredDate: leadForm.channel === 'schedule' ? leadForm.date || null : null,
          preferredTime: leadForm.channel === 'schedule' ? leadForm.time || null : null,
          message: leadForm.message || null,
          channel: leadForm.channel,
        }
        const saved = recordLeadRequest(entry)
        toast.success('Your request has been shared with the listing agent')
        setLeadForm({ name: '', email: user?.email ?? '', phone: '', date: '', time: '', message: '', channel: leadForm.channel })
        return saved
      } finally {
        setLeadSubmitting(false)
      }
    })
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center text-slate-600">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Loading property details…
          </div>
        </div>
      </>
    )
  }

  if (error || !property || !normalized) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Button variant="ghost" onClick={() => navigate('/customer/search')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Property unavailable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">{error ?? 'We could not find this property. It may have been removed or is no longer available.'}</p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const virtualTourUrl =
    (property as { virtual_tour_url?: string | null }).virtual_tour_url ??
    'https://www.youtube.com/embed/TzJ8dStpPj4'

  const propertyFacts = [
    { label: 'Bedrooms', value: formatNumber(normalized.bedrooms, 'bd'), icon: Bed },
    { label: 'Bathrooms', value: formatNumber(normalized.bathrooms, 'ba'), icon: Bath },
    { label: 'Living area', value: formatNumber(normalized.sqft, 'sqft'), icon: Square },
    { label: 'Lot size', value: normalized.lotSizeAcres ? `${normalized.lotSizeAcres.toFixed(2)} acres` : formatNumber(normalized.lotSizeSqFt, 'sqft'), icon: Building2 },
    { label: 'Year built', value: normalized.yearBuilt ? String(normalized.yearBuilt) : '—', icon: Calendar },
    { label: 'Garage', value: normalized.hasGarage ? 'Yes' : '—', icon: Car },
  ]

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate('/customer/search')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to search
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button
              variant={isSaved ? 'default' : 'outline'}
              onClick={handleFavorite}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-rose-600' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={mediaImages[galleryIndex]}
                  alt={normalized.formattedAddress}
                  className="h-[420px] w-full object-cover"
                  onClick={() => setIsGalleryOpen(true)}
                />
                {mediaImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                    {galleryIndex + 1} of {mediaImages.length}
                  </div>
                )}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <Badge className="bg-indigo-600 text-white">{normalized.statusLabel}</Badge>
                  {normalized.propertyType && (
                    <Badge variant="secondary" className="capitalize text-indigo-700">
                      {normalized.propertyType}
                    </Badge>
                  )}
                </div>
              </div>
              {mediaImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto px-4 py-3">
                  {mediaImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setGalleryIndex(index)}
                      className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border ${
                        galleryIndex === index ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-slate-900">{formatPrice(property.list_price)}</h1>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                  {normalized.statusLabel === 'Live' ? 'Active' : normalized.statusLabel}
                </Badge>
              </div>
              <p className="flex items-center text-slate-600">
                <MapPin className="mr-2 h-4 w-4 text-indigo-500" /> {normalized.formattedAddress}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-3">
              {propertyFacts.map((fact) => {
                const Icon = fact.icon
                return (
                  <div key={fact.label} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">{fact.label}</p>
                        <p className="text-sm font-semibold text-slate-900">{fact.value}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Property description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  {property.public_remarks || 'Detailed remarks will be available soon. Request a tour to learn more about finishes, upgrades, and neighborhood lifestyle.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {normalized.features.slice(0, 12).map((feature) => (
                    <Badge key={feature} variant="outline" className="bg-white">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {virtualTourUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Virtual tour</CardTitle>
                  <p className="text-sm text-slate-600">Explore the layout before you arrive in person.</p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-xl border border-slate-200">
                    <iframe
                      src={virtualTourUrl}
                      title="Virtual Tour"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Neighborhood highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <Map
                    height={320}
                    defaultZoom={14}
                    center={[
                      normalized.coordinates.lat ?? 27.6648,
                      normalized.coordinates.lng ?? -81.5158,
                    ]}
                  >
                    <Marker
                      anchor={[
                        normalized.coordinates.lat ?? 27.6648,
                        normalized.coordinates.lng ?? -81.5158,
                      ]}
                      color="#4f46e5"
                    />
                    {nearbyPlaces
                      .filter((place) => place.coordinates)
                      .map((place) => (
                        <Marker
                          key={place.id}
                          anchor={[place.coordinates!.lat, place.coordinates!.lng]}
                          color="#22c55e"
                        />
                      ))}
                  </Map>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {nearbyPlaces.map((place) => (
                    <div key={place.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">{place.name}</p>
                        <Badge variant="secondary" className="bg-white text-slate-700">{place.type}</Badge>
                      </div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{place.distance}</p>
                      <p className="mt-2 text-sm text-slate-600">{place.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What neighbors say</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">“{testimonial.quote}”</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Similar homes you may like</CardTitle>
              </CardHeader>
              <CardContent>
                {similarLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading nearby options…
                  </div>
                ) : similarHomes.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {similarHomes.map((home) => (
                      <div key={home.id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
                        <PropertyCard
                          listing={home}
                          isFavorite={isFavorite(home.id)}
                          onToggleFavorite={() => requireAuth(() => {
                            const summary = normalizedToSummary(home)
                            const currentlyFavorite = isFavorite(home.id)
                            void toggleFavorite(summary)
                            toast.success(currentlyFavorite ? 'Removed from favorites' : 'Saved to favorites')
                          })}
                          onViewDetails={() => navigate(`/customer/property/${home.slug ?? home.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No similar homes to display right now. Adjust your filters for more options.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listing Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{property.listing_office_name ?? 'Brokerage Team'}</p>
                  <p className="text-sm text-slate-600">License {property.listing_office_license ?? 'pending'}</p>
                  {property.listing_office_phone && <p className="text-sm text-slate-600">{property.listing_office_phone}</p>}
                  {property.listing_office_email && <p className="text-sm text-slate-600">{property.listing_office_email}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {property.listing_office_phone ? (
                  <Button className="w-full gap-2" asChild>
                    <a href={`tel:${property.listing_office_phone.replace(/[^0-9+]/g, '')}`}>
                      <Phone className="h-4 w-4" /> Call now
                    </a>
                  </Button>
                ) : (
                  <Button className="w-full gap-2" onClick={() => toast.info('Phone number coming soon')}>
                    <Phone className="h-4 w-4" /> Call now
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => requireAuth(() => toast.success('Drafting an email to the listing agent'))}
                >
                  <Mail className="h-4 w-4" /> Email agent
                </Button>
                <Button variant="ghost" className="w-full gap-2" onClick={() => setAgentModalOpen(true)}>
                  <MessageSquare className="h-4 w-4" /> Meet the team
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule a tour</CardTitle>
              <p className="text-sm text-slate-600">Share your info and preferred time—we will confirm within the hour.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLeadSubmit}>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={leadForm.channel === 'schedule' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setLeadForm((prev) => ({ ...prev, channel: 'schedule' }))}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Schedule tour
                  </Button>
                  <Button
                    type="button"
                    variant={leadForm.channel === 'contact' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setLeadForm((prev) => ({ ...prev, channel: 'contact' }))}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Ask a question
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input
                    required
                    value={leadForm.name}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    value={leadForm.email}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={leadForm.phone}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>

                {leadForm.channel === 'schedule' && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Preferred date</Label>
                      <Input
                        type="date"
                        value={leadForm.date}
                        onChange={(event) => setLeadForm((prev) => ({ ...prev, date: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred time</Label>
                      <Input
                        type="time"
                        value={leadForm.time}
                        onChange={(event) => setLeadForm((prev) => ({ ...prev, time: event.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{leadForm.channel === 'schedule' ? 'Anything we should know?' : 'Tell us about your goals'}</Label>
                  <Textarea
                    rows={3}
                    value={leadForm.message}
                    onChange={(event) => setLeadForm((prev) => ({ ...prev, message: event.target.value }))}
                    placeholder={leadForm.channel === 'schedule' ? 'Add notes about timing, financing, or must-see features' : 'Share what you are looking for and we will tailor recommendations.'}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={leadSubmitting}>
                  {leadSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
                  {leadForm.channel === 'schedule' ? 'Request tour' : 'Contact agent'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <MortgageCalculator price={normalized?.price ?? 0} />
          <HomeValuationCard baselinePricePerSqft={pricePerSqft} defaults={valuationDefaults} />

          <Card>
            <CardHeader>
              <CardTitle>Share with friends</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share listing link
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl)
                    toast.success('Link copied!')
                  } catch (err) {
                    console.error(err)
                    toast.error('Unable to copy link automatically.')
                  }
                }}
              >
                <Copy className="h-4 w-4" /> Copy link
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" /> Share on Facebook
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" /> Share on Twitter
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2"
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" /> Share via WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{normalized.formattedAddress}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <img src={mediaImages[galleryIndex]} alt={`Gallery image ${galleryIndex + 1}`} className="max-h-[70vh] w-full object-contain" />
            {mediaImages.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {mediaImages.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setGalleryIndex(index)}
                    className={`h-16 w-24 overflow-hidden rounded-lg border ${
                      galleryIndex === index ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={agentModalOpen} onOpenChange={setAgentModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Meet your brokerage team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Our dedicated concierge team coordinates tours, negotiates offers, and keeps you informed every step of the way. You will receive a text confirmation shortly after submitting your request.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Key contacts</p>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <strong>Showing specialist:</strong> {property.listing_office_name ?? 'Your assigned agent'}
                </li>
                <li>
                  <strong>Direct line:</strong> {property.listing_office_phone ?? '(305) 555-1001'}
                </li>
                <li>
                  <strong>Email:</strong> {property.listing_office_email ?? 'hello@premieragents.com'}
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}

export default CustomerPropertyDetail
