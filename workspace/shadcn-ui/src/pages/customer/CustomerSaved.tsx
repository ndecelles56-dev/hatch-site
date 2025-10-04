import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bookmark, Filter, Mail, MessageCircle, Pencil, Trash2, Search } from 'lucide-react'
import { useCustomerExperience, type SavedSearch } from '@/contexts/CustomerExperienceContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const buildSearchParamsFromSaved = (saved: SavedSearch) => {
  const params = new URLSearchParams()
  if (saved.query) params.set('q', saved.query)
  const { filters } = saved
  if (filters.priceMin) params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax) params.set('priceMax', String(filters.priceMax))
  if (filters.bedrooms) params.set('beds', String(filters.bedrooms))
  if (filters.bathrooms) params.set('baths', String(filters.bathrooms))
  if (filters.sqftMin) params.set('sqftMin', String(filters.sqftMin))
  if (filters.sqftMax) params.set('sqftMax', String(filters.sqftMax))
  if (filters.yearBuiltMin) params.set('yearBuiltMin', String(filters.yearBuiltMin))
  if (filters.yearBuiltMax) params.set('yearBuiltMax', String(filters.yearBuiltMax))
  if (filters.propertyTypes?.length) params.set('types', filters.propertyTypes.join(','))
  if (filters.hasGarage) params.set('garage', '1')
  if (filters.hasPool) params.set('pool', '1')
  params.set('sort', saved.sort)
  params.set('view', saved.viewMode)
  params.set('savedSearch', saved.id)
  return params.toString()
}

const formatTimestamp = (iso: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(iso))

const describeFilters = (saved: SavedSearch) => {
  const chips: string[] = []
  const { filters } = saved
  if (filters.propertyTypes?.length) chips.push(filters.propertyTypes.join(' · '))
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin ? `$${(filters.priceMin / 1000).toFixed(0)}k` : 'Any'
    const max = filters.priceMax ? `$${(filters.priceMax / 1000).toFixed(0)}k` : 'Any'
    chips.push(`Price ${min} - ${max}`)
  }
  if (filters.bedrooms) chips.push(`${filters.bedrooms}+ bd`)
  if (filters.bathrooms) chips.push(`${filters.bathrooms}+ ba`)
  if (filters.sqftMin || filters.sqftMax) {
    const min = filters.sqftMin ? `${filters.sqftMin.toLocaleString()} sqft` : 'Any'
    const max = filters.sqftMax ? `${filters.sqftMax.toLocaleString()} sqft` : 'Any'
    chips.push(`Size ${min} - ${max}`)
  }
  if (filters.yearBuiltMin || filters.yearBuiltMax) {
    const min = filters.yearBuiltMin ?? 'Any'
    const max = filters.yearBuiltMax ?? 'Any'
    chips.push(`Year ${min} - ${max}`)
  }
  if (filters.hasPool) chips.push('Pool')
  if (filters.hasGarage) chips.push('Garage')
  return chips
}

const CustomerSaved: React.FC = () => {
  const navigate = useNavigate()
  const { savedSearches, removeSavedSearch, saveSearch } = useCustomerExperience()
  const [renameModal, setRenameModal] = useState<{ open: boolean; search?: SavedSearch }>({ open: false })
  const [newName, setNewName] = useState('')

  const sortedSearches = useMemo(() => savedSearches.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [savedSearches])

  const openRename = (search: SavedSearch) => {
    setRenameModal({ open: true, search })
    setNewName(search.name)
  }

  const applyRename = () => {
    if (!renameModal.search) return
    if (!newName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    saveSearch({ ...renameModal.search, id: renameModal.search.id, name: newName.trim() })
    toast.success('Saved search renamed')
    setRenameModal({ open: false })
  }

  const toggleEmailAlerts = (search: SavedSearch, next: boolean) => {
    saveSearch({ ...search, id: search.id, notifyEmail: next })
    toast.success(`Email alerts ${next ? 'enabled' : 'disabled'}`)
  }

  const toggleSmsAlerts = (search: SavedSearch, next: boolean) => {
    saveSearch({ ...search, id: search.id, notifySms: next })
    toast.success(`SMS alerts ${next ? 'enabled' : 'disabled'}`)
  }

  const launchSearch = (search: SavedSearch) => {
    const query = buildSearchParamsFromSaved(search)
    navigate({ pathname: '/customer/search', search: `?${query}` })
    toast.info('Loading saved search…')
  }

  if (sortedSearches.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Bookmark className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">No saved searches yet</h1>
          <p className="mt-2 text-slate-600">
            Map out your dream home criteria. Save a search to get instant alerts when matches hit the market.
          </p>
          <Button className="mt-6" onClick={() => navigate('/customer/search')}>
            Create your first saved search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Saved searches</h1>
            <p className="text-slate-600">Stay ahead with tailored alerts in the neighborhoods you follow.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/customer/search')} className="gap-2">
            <Search className="h-4 w-4" /> New search
          </Button>
        </div>

        <div className="space-y-6">
          {sortedSearches.map((search) => (
            <Card key={search.id} className="border border-slate-200">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900">{search.name}</CardTitle>
                  <p className="text-sm text-slate-500">Saved {formatTimestamp(search.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => openRename(search)}>
                    <Pencil className="h-4 w-4" /> Rename
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => launchSearch(search)}
                  >
                    <Filter className="h-4 w-4" /> View results
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-rose-500"
                    onClick={() => {
                      removeSavedSearch(search.id)
                      toast.success('Saved search removed')
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {describeFilters(search).map((chip) => (
                    <Badge key={chip} variant="outline" className="bg-white text-slate-600">
                      {chip}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">Alerts</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-indigo-500" /> Email updates
                        </div>
                        <Switch checked={search.notifyEmail} onCheckedChange={(checked) => toggleEmailAlerts(search, Boolean(checked))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-indigo-500" /> SMS alerts
                        </div>
                        <Switch checked={search.notifySms} onCheckedChange={(checked) => toggleSmsAlerts(search, Boolean(checked))} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="text-sm font-semibold text-slate-900">Summary</p>
                    <p className="mt-2">
                      Searching for {search.query ? <strong>{search.query}</strong> : 'new listings'} with preferred sort{' '}
                      <strong>{search.sort.replace(/([A-Z])/g, ' $1').toLowerCase()}</strong> in {search.viewMode === 'map' ? 'map view' : 'list view'}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={renameModal.open} onOpenChange={(open) => setRenameModal(open ? renameModal : { open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename saved search</DialogTitle>
          </DialogHeader>
          <Input value={newName} onChange={(event) => setNewName(event.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameModal({ open: false })}>
              Cancel
            </Button>
            <Button onClick={applyRename}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomerSaved
