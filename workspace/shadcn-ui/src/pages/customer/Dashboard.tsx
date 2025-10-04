import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerExperience } from '@/contexts/CustomerExperienceContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, Heart, MessageSquare, Search, MapPin, Calendar, Bell, User } from 'lucide-react'

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { favorites, savedSearches, recentlyViewed, leadRequests } = useCustomerExperience()

  const topSavedSearches = useMemo(() => savedSearches.slice(0, 3), [savedSearches])
  const topFavorites = useMemo(() => favorites.slice(0, 3), [favorites])
  const latestInquiries = useMemo(() => leadRequests.slice(0, 3), [leadRequests])

  const upcomingTour = leadRequests.find((request) => request.channel === 'schedule' && request.preferredDate)

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-600">Review your favorite homes, saved searches, and tour activity at a glance.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="cursor-pointer border border-slate-200 transition hover:shadow-lg" onClick={() => navigate('/customer/search')}>
            <CardContent className="p-6 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-indigo-500" />
              <h3 className="font-semibold text-slate-900">Search properties</h3>
              <p className="text-sm text-slate-600">Discover the latest listings</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border border-slate-200 transition hover:shadow-lg" onClick={() => navigate('/customer/favorites')}>
            <CardContent className="p-6 text-center">
              <Heart className="mx-auto mb-3 h-8 w-8 text-rose-500" />
              <h3 className="font-semibold text-slate-900">Saved homes</h3>
              <p className="text-sm text-slate-600">{favorites.length} {favorites.length === 1 ? 'home' : 'homes'} favorited</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border border-slate-200 transition hover:shadow-lg" onClick={() => navigate('/customer/saved')}>
            <CardContent className="p-6 text-center">
              <MapPin className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
              <h3 className="font-semibold text-slate-900">Saved searches</h3>
              <p className="text-sm text-slate-600">{savedSearches.length} personalized alerts</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border border-slate-200 transition hover:shadow-lg" onClick={() => navigate('/customer/profile')}>
            <CardContent className="p-6 text-center">
              <User className="mx-auto mb-3 h-8 w-8 text-purple-500" />
              <h3 className="font-semibold text-slate-900">Profile</h3>
              <p className="text-sm text-slate-600">Manage account & alerts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" /> Recent searches
              </CardTitle>
              <CardDescription>Your latest saved filters</CardDescription>
            </CardHeader>
            <CardContent>
              {topSavedSearches.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                  Create a saved search to receive instant alerts when new listings match your criteria.
                </div>
              ) : (
                <div className="space-y-4">
                  {topSavedSearches.map((search) => (
                    <div key={search.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          <span className="font-semibold text-slate-900">{search.name}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {search.query || 'Any location'} • {search.sort.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate({ pathname: '/customer/search', search: `?savedSearch=${search.id}` })}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" /> Saved homes
              </CardTitle>
              <CardDescription>Properties you are tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {topFavorites.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                  Tap the heart on any listing to save it here for easy access.
                </div>
              ) : (
                <div className="space-y-4">
                  {topFavorites.map((favorite) => (
                    <div key={favorite.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{favorite.address}</p>
                        <p className="text-sm text-slate-600">
                          {favorite.propertyType || 'Home'} • {favorite.bedrooms ?? '—'} bd {favorite.bathrooms ?? '—'} ba
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-emerald-600">{favorite.price ? favorite.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) : 'Contact for pricing'}</p>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/customer/property/${favorite.slug ?? favorite.id}`)}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Recent inquiries
            </CardTitle>
            <CardDescription>Follow up with agents directly.</CardDescription>
          </CardHeader>
          <CardContent>
            {latestInquiries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                Request a tour from a property page to start a conversation with the listing agent.
              </div>
            ) : (
              <div className="space-y-4">
                {latestInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-indigo-500" />
                        <span className="font-semibold text-slate-900">{inquiry.propertyAddress}</span>
                        <Badge variant={inquiry.channel === 'schedule' ? 'default' : 'secondary'}>
                          {inquiry.channel === 'schedule' ? 'Tour request' : 'Message'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">Sent {new Date(inquiry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/customer/inquiries')}>
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notifications
            </CardTitle>
            <CardDescription>Important updates at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTour ? (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <Calendar className="h-4 w-4" /> Tour requested for {upcomingTour.propertyAddress} on{' '}
                {upcomingTour.preferredDate} {upcomingTour.preferredTime ? `at ${upcomingTour.preferredTime}` : ''}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                No upcoming tours scheduled yet. Request a showing to see personalized reminders here.
              </div>
            )}
            {recentlyViewed.length > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700">
                <MapPin className="h-4 w-4" /> You viewed {recentlyViewed[0].address}. Ready to take the next step?
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CustomerDashboard
