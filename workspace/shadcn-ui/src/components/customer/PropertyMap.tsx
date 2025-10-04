import React, { useMemo } from 'react'
import { Map, Marker, ZoomControl } from 'pigeon-maps'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NormalizedListing } from '@/types/customer-search'

interface PropertyMapProps {
  listings: NormalizedListing[]
  selectedId: string | null
  onSelect: (listing: NormalizedListing) => void
  onToggleFavorite: (listing: NormalizedListing) => void
  isFavorite: (propertyId: string) => boolean
  onViewDetails: (listing: NormalizedListing) => void
}

const DEFAULT_CENTER: [number, number] = [27.6648, -81.5158] // Florida centroid

const PropertyMap: React.FC<PropertyMapProps> = ({ listings, selectedId, onSelect, onToggleFavorite, isFavorite, onViewDetails }) => {
  const listingsWithCoords = useMemo(
    () => listings.filter((listing) => Number.isFinite(listing.coordinates.lat) && Number.isFinite(listing.coordinates.lng)),
    [listings]
  )

  const center = useMemo(() => {
    if (selectedId) {
      const selected = listingsWithCoords.find((listing) => listing.id === selectedId)
      if (selected && selected.coordinates.lat && selected.coordinates.lng) {
        return [selected.coordinates.lat, selected.coordinates.lng] as [number, number]
      }
    }
    if (listingsWithCoords.length === 0) return DEFAULT_CENTER

    const latAvg = listingsWithCoords.reduce((sum, listing) => sum + (listing.coordinates.lat ?? 0), 0) / listingsWithCoords.length
    const lngAvg = listingsWithCoords.reduce((sum, listing) => sum + (listing.coordinates.lng ?? 0), 0) / listingsWithCoords.length
    return [latAvg, lngAvg] as [number, number]
  }, [listingsWithCoords, selectedId])

  const selectedListing = useMemo(() => listings.find((listing) => listing.id === selectedId) ?? listings[0] ?? null, [listings, selectedId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <Map
          height={520}
          defaultZoom={selectedId ? 12 : 8}
          center={center}
          animate
          minZoom={6}
          maxZoom={16}
        >
          <ZoomControl />
          {listingsWithCoords.map((listing) => {
            const lat = listing.coordinates.lat ?? 0
            const lng = listing.coordinates.lng ?? 0
            const active = listing.id === selectedId
            return (
              <Marker
                key={listing.id}
                anchor={[lat, lng]}
                width={active ? 45 : 35}
                color={active ? '#4f46e5' : '#22c55e'}
                onClick={() => onSelect(listing)}
              />
            )
          })}
        </Map>
      </div>

      <div className="space-y-4">
        {selectedListing ? (
          <Card className="h-full overflow-hidden border border-indigo-100 bg-indigo-50/60">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-600 text-white">{selectedListing.statusLabel}</Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={isFavorite(selectedListing.id) ? 'Remove favorite' : 'Save favorite'}
                  onClick={() => onToggleFavorite(selectedListing)}
                  className={cn(
                    'h-9 w-9 rounded-full border bg-white text-indigo-600 transition hover:bg-indigo-100',
                    isFavorite(selectedListing.id) && 'text-rose-600'
                  )}
                >
                  <Heart className={cn('h-5 w-5', isFavorite(selectedListing.id) && 'fill-current')} />
                </Button>
              </div>
              <CardTitle className="text-2xl text-slate-900">{selectedListing.formattedAddress}</CardTitle>
              <p className="flex items-center text-sm text-slate-600">
                <MapPin className="mr-2 h-4 w-4 text-indigo-500" />
                {selectedListing.locationLabel}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={selectedListing.heroPhoto}
                alt={selectedListing.formattedAddress}
                className="h-56 w-full rounded-xl object-cover"
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-indigo-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                    }).format(selectedListing.price)}
                  </div>
                  <p className="text-sm text-slate-600">
                    {selectedListing.bedrooms} bd · {selectedListing.bathrooms} ba · {selectedListing.sqft.toLocaleString()} sqft
                  </p>
                </div>
                <Button onClick={() => onViewDetails(selectedListing)}>View Listing</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full items-center justify-center">
            <CardContent className="text-center text-slate-500">
              Select a marker to preview a property.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PropertyMap
