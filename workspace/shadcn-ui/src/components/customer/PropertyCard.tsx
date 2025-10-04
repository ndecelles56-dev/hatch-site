import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Heart, MapPin, Bed, Bath, Square, ArrowLeft, ArrowRight, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { NormalizedListing } from '@/types/customer-search'

interface PropertyCardProps {
  listing: NormalizedListing
  isFavorite: boolean
  onToggleFavorite: () => void
  onViewDetails: () => void
  onHover?: (listing: NormalizedListing | null) => void
}

const formatPrice = (price: number) => {
  if (!Number.isFinite(price) || price <= 0) {
    return 'Contact for pricing'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price)
}

const statusBadgeClasses: Record<NormalizedListing['statusLabel'], string> = {
  New: 'bg-emerald-600 text-white',
  'Price Reduced': 'bg-amber-500 text-white',
  Pending: 'bg-sky-600 text-white',
  Sold: 'bg-slate-700 text-white',
  Live: 'bg-indigo-600 text-white',
}

const PropertyCard: React.FC<PropertyCardProps> = ({ listing, isFavorite, onToggleFavorite, onViewDetails, onHover }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: listing.photoUrls.length > 1 })
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const handleSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap() ?? 0)
    emblaApi.on('select', handleSelect)
    handleSelect()
    return () => {
      emblaApi.off('select', handleSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    return () => {
      if (onHover) onHover(null)
    }
  }, [onHover])

  const uniquePhotos = useMemo(() => {
    if (listing.photoUrls.length === 0) {
      return [listing.heroPhoto]
    }
    return listing.photoUrls
      .filter((url) => url && /^https?:\/\//i.test(url))
      .filter((url, index, arr) => arr.indexOf(url) === index)
  }, [listing.heroPhoto, listing.photoUrls])

  const goPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const goNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const onMouseEnter = useCallback(() => {
    if (onHover) onHover(listing)
  }, [onHover, listing])

  const onMouseLeave = useCallback(() => {
    if (onHover) onHover(null)
  }, [onHover])

  return (
    <Card
      className="group overflow-hidden border border-slate-200/70 transition-all hover:shadow-xl hover:border-indigo-300/80"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid="property-card"
    >
      <div className="relative">
        <div className="relative overflow-hidden">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {uniquePhotos.map((photo, index) => (
                <div
                  className="relative h-60 min-w-0 flex-[0_0_100%] overflow-hidden"
                  key={photo ?? `${listing.id}-${index}`}
                >
                  <img
                    src={photo}
                    alt={listing.formattedAddress}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </div>
          </div>

          {uniquePhotos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg transition hover:bg-black/60"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-lg transition hover:bg-black/60"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                {uniquePhotos.map((_, index) => (
                  <span
                    key={`${listing.id}-dot-${index}`}
                    className={cn(
                      'h-1.5 w-6 rounded-full bg-white/40 transition-all',
                      index === selectedIndex && 'bg-white'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className={cn('text-xs font-semibold uppercase tracking-wide', statusBadgeClasses[listing.statusLabel])}>
            {listing.statusLabel}
          </Badge>
          {listing.isNew && listing.statusLabel !== 'New' && (
            <Badge variant="secondary" className="border border-emerald-200 bg-emerald-50 text-emerald-700">
              <BadgeCheck className="mr-1 h-3 w-3" /> Fresh Listing
            </Badge>
          )}
        </div>

        <Button
          size="icon"
          variant="secondary"
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          onClick={(event) => {
            event.stopPropagation()
            void onToggleFavorite()
          }}
          className={cn(
            'absolute right-3 top-3 h-10 w-10 rounded-full bg-white/90 text-slate-700 transition hover:bg-white',
            isFavorite && 'text-rose-600'
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </Button>
      </div>

      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl font-bold leading-tight text-indigo-700">
            {formatPrice(listing.price)}
          </CardTitle>
          <div className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            {listing.bedrooms} bd · {listing.bathrooms} ba
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {listing.propertyType && (
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              {listing.propertyType}
            </Badge>
          )}
          {listing.propertySubType && (
            <Badge variant="outline" className="border-dashed">
              {listing.propertySubType}
            </Badge>
          )}
        </div>
        <p className="flex items-center text-sm text-slate-600">
          <MapPin className="mr-2 h-4 w-4 text-indigo-500" />
          <span className="truncate" title={listing.formattedAddress}>{listing.formattedAddress}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-indigo-500" />
            <span>{listing.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-indigo-500" />
            <span>{listing.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-indigo-500" />
            <span>{listing.sqft.toLocaleString()} Sq Ft</span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">
          {listing.remarks ?? 'Schedule a private tour to discover more details about this home.'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 text-xs">
            {listing.hasPool && <Badge variant="outline">Pool</Badge>}
            {listing.hasGarage && <Badge variant="outline">Garage</Badge>}
            {listing.yearBuilt ? <Badge variant="outline">Built {listing.yearBuilt}</Badge> : null}
            {listing.propertySubType && <Badge variant="outline">{listing.propertySubType}</Badge>}
          </div>
          <Button size="sm" onClick={onViewDetails} className="rounded-full px-4">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyCard
