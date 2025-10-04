import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Heart, MapPin, Bed, Bath, Square, Share2, Trash2 } from 'lucide-react'
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&h=600&fit=crop'

const CustomerFavorites: React.FC = () => {
  const navigate = useNavigate()
  const { favorites, toggleFavorite, recordView } = useCustomerExperience()

  const handleViewDetails = (favorite: (typeof favorites)[number]) => {
    recordView(favorite)
    navigate(`/customer/property/${favorite.slug ?? favorite.id}`)
  }

  const handleRemove = async (favorite: (typeof favorites)[number]) => {
    await toggleFavorite(favorite)
    toast.success('Removed from favorites')
  }

  const handleShare = async (favorite: (typeof favorites)[number]) => {
    const url = `${window.location.origin}/customer/property/${favorite.slug ?? favorite.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch (error) {
      console.error('Failed to copy favorite link', error)
      toast.error('Unable to copy link')
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">No favorites yet</h1>
          <p className="mt-2 text-slate-600">
            Save homes you love to compare features, get alerts, and share with your agent.
          </p>
          <Button className="mt-6" onClick={() => navigate('/customer/search')}>
            Start exploring homes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My favorites</h1>
          <p className="text-slate-600">{favorites.length} saved {favorites.length === 1 ? 'home' : 'homes'}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden border border-slate-200 shadow-sm">
              <div className="relative">
                <img
                  src={favorite.photoUrl || FALLBACK_IMAGE}
                  alt={favorite.address}
                  className="h-48 w-full object-cover"
                />
                <Badge className="absolute left-3 top-3 bg-indigo-600 text-white">
                  {favorite.status ?? 'Saved'}
                </Badge>
              </div>
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg text-slate-900">{favorite.address}</CardTitle>
                <p className="flex items-center text-sm text-slate-600">
                  <MapPin className="mr-2 h-4 w-4 text-indigo-500" />
                  {[favorite.city, favorite.state, favorite.zipCode].filter(Boolean).join(', ')}
                </p>
                <p className="text-xl font-semibold text-emerald-600">{favorite.price ? favorite.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) : 'Contact for pricing'}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{favorite.bedrooms ?? '—'} bd</span>
                  <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{favorite.bathrooms ?? '—'} ba</span>
                  <span className="flex items-center gap-1"><Square className="h-4 w-4" />{favorite.sqft ? favorite.sqft.toLocaleString() : '—'} sqft</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {favorite.propertyType && <Badge variant="outline">{favorite.propertyType}</Badge>}
                  {favorite.savedAt && <Badge variant="secondary" className="bg-white text-slate-600">Saved {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(favorite.savedAt))}</Badge>}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button onClick={() => handleViewDetails(favorite)} className="w-full">View details</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="w-full" onClick={() => handleShare(favorite)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="w-full text-rose-500" onClick={() => handleRemove(favorite)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerFavorites
