import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Calendar,
  Home,
  Bed,
  Bath,
  Square,
  DollarSign,
  Clock,
  Save,
  RotateCcw
} from 'lucide-react'

export interface PropertyFilters {
  search: string
  priceRange: [number, number]
  propertyTypes: string[]
  bedrooms: string
  bathrooms: string
  sqftRange: [number, number]
  yearBuiltRange: [number, number]
  status: string[]
  agents: string[]
  cities: string[]
  daysOnMarket: [number, number]
  listingDateRange: {
    from: string
    to: string
  }
  mlsNumber: string
  lotSizeRange: [number, number]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface PropertyFiltersProps {
  filters: PropertyFilters
  onFiltersChange: (filters: PropertyFilters) => void
  agents: Array<{ id: string; name: string }>
  onSavePreset: (name: string, filters: PropertyFilters) => void
  onLoadPreset: (filters: PropertyFilters) => void
  savedPresets: Array<{ name: string; filters: PropertyFilters }>
  propertyCount: number
  totalCount: number
}

const PROPERTY_TYPES = [
  'House',
  'Condo',
  'Townhouse',
  'Duplex',
  'Land',
  'Commercial',
  'Multi-Family',
  'Mobile Home'
]

const BEDROOM_OPTIONS = ['Any', '1', '2', '3', '4', '5', '6+']
const BATHROOM_OPTIONS = ['Any', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+']

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'sold', label: 'Sold', color: 'bg-blue-100 text-blue-800' },
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' }
]

const SORT_OPTIONS = [
  { value: 'price', label: 'Price' },
  { value: 'listingDate', label: 'Listing Date' },
  { value: 'sqft', label: 'Square Feet' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'daysOnMarket', label: 'Days on Market' },
  { value: 'viewCount', label: 'Views' },
  { value: 'leadCount', label: 'Leads' }
]

export function PropertyFiltersComponent({
  filters,
  onFiltersChange,
  agents,
  onSavePreset,
  onLoadPreset,
  savedPresets,
  propertyCount,
  totalCount
}: PropertyFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)

  const updateFilters = (updates: Partial<PropertyFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    const defaultFilters: PropertyFilters = {
      search: '',
      priceRange: [0, 10000000],
      propertyTypes: [],
      bedrooms: 'Any',
      bathrooms: 'Any',
      sqftRange: [0, 10000],
      yearBuiltRange: [1900, new Date().getFullYear()],
      status: [],
      agents: [],
      cities: [],
      daysOnMarket: [0, 365],
      listingDateRange: { from: '', to: '' },
      mlsNumber: '',
      lotSizeRange: [0, 100],
      sortBy: 'listingDate',
      sortOrder: 'desc'
    }
    onFiltersChange(defaultFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++
    if (filters.propertyTypes.length > 0) count++
    if (filters.bedrooms !== 'Any') count++
    if (filters.bathrooms !== 'Any') count++
    if (filters.sqftRange[0] > 0 || filters.sqftRange[1] < 10000) count++
    if (filters.status.length > 0) count++
    if (filters.agents.length > 0) count++
    if (filters.cities.length > 0) count++
    if (filters.mlsNumber) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim(), filters)
      setPresetName('')
      setShowSavePreset(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg">Property Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {propertyCount} of {totalCount} properties
            </span>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Properties</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Search by address, MLS#, or description..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* MLS Number */}
        <div className="space-y-2">
          <Label htmlFor="mlsNumber">MLS Number</Label>
          <Input
            id="mlsNumber"
            placeholder="Enter MLS number..."
            value={filters.mlsNumber}
            onChange={(e) => updateFilters({ mlsNumber: e.target.value })}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-3">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
              max={10000000}
              min={0}
              step={50000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>${filters.priceRange[0].toLocaleString()}</span>
              <span>${filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <Label>Property Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {PROPERTY_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.propertyTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters({
                        propertyTypes: [...filters.propertyTypes, type]
                      })
                    } else {
                      updateFilters({
                        propertyTypes: filters.propertyTypes.filter(t => t !== type)
                      })
                    }
                  }}
                />
                <Label htmlFor={type} className="text-sm font-normal">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={status.value}
                  checked={filters.status.includes(status.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters({
                        status: [...filters.status, status.value]
                      })
                    } else {
                      updateFilters({
                        status: filters.status.filter(s => s !== status.value)
                      })
                    }
                  }}
                />
                <Label htmlFor={status.value} className="text-sm font-normal">
                  <Badge className={status.color} variant="outline">
                    {status.label}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Select value={filters.bedrooms} onValueChange={(value) => updateFilters({ bedrooms: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BEDROOM_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    <div className="flex items-center">
                      <Bed className="h-3 w-3 mr-2" />
                      {option}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Select value={filters.bathrooms} onValueChange={(value) => updateFilters({ bathrooms: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BATHROOM_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    <div className="flex items-center">
                      <Bath className="h-3 w-3 mr-2" />
                      {option}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agent Filter */}
        <div className="space-y-3">
          <Label>Assigned Agent</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center space-x-2">
                <Checkbox
                  id={agent.id}
                  checked={filters.agents.includes(agent.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters({
                        agents: [...filters.agents, agent.id]
                      })
                    } else {
                      updateFilters({
                        agents: filters.agents.filter(a => a !== agent.id)
                      })
                    }
                  }}
                />
                <Label htmlFor={agent.id} className="text-sm font-normal">
                  {agent.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              Advanced Filters
              {isAdvancedOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Square Footage */}
            <div className="space-y-3">
              <Label>Square Footage</Label>
              <div className="px-3">
                <Slider
                  value={filters.sqftRange}
                  onValueChange={(value) => updateFilters({ sqftRange: value as [number, number] })}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{filters.sqftRange[0].toLocaleString()} sq ft</span>
                  <span>{filters.sqftRange[1].toLocaleString()} sq ft</span>
                </div>
              </div>
            </div>

            {/* Year Built */}
            <div className="space-y-3">
              <Label>Year Built</Label>
              <div className="px-3">
                <Slider
                  value={filters.yearBuiltRange}
                  onValueChange={(value) => updateFilters({ yearBuiltRange: value as [number, number] })}
                  max={new Date().getFullYear()}
                  min={1900}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{filters.yearBuiltRange[0]}</span>
                  <span>{filters.yearBuiltRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Days on Market */}
            <div className="space-y-3">
              <Label>Days on Market</Label>
              <div className="px-3">
                <Slider
                  value={filters.daysOnMarket}
                  onValueChange={(value) => updateFilters({ daysOnMarket: value as [number, number] })}
                  max={365}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{filters.daysOnMarket[0]} days</span>
                  <span>{filters.daysOnMarket[1]} days</span>
                </div>
              </div>
            </div>

            {/* Listing Date Range */}
            <div className="space-y-3">
              <Label>Listing Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="dateFrom" className="text-xs">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.listingDateRange.from}
                    onChange={(e) => updateFilters({
                      listingDateRange: {
                        ...filters.listingDateRange,
                        from: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-xs">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.listingDateRange.to}
                    onChange={(e) => updateFilters({
                      listingDateRange: {
                        ...filters.listingDateRange,
                        to: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <div className="flex space-x-2">
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilters({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
              })}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* Saved Presets */}
        <div className="space-y-3">
          <Label>Filter Presets</Label>
          <div className="space-y-2">
            {savedPresets.length > 0 && (
              <div className="space-y-1">
                {savedPresets.map((preset, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{preset.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLoadPreset(preset.filters)}
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {!showSavePreset ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavePreset(true)}
                className="w-full"
              >
                <Save className="h-3 w-3 mr-2" />
                Save Current Filters
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Input
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSavePreset}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSavePreset(false)
                    setPresetName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}