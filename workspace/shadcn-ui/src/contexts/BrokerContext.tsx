import React, { createContext, useContext, useState, useEffect } from 'react'
import { MLSProperty } from '@/types/MLSProperty'

// Types for the broker context
interface Lead {
  id: string
  name: string
  email: string
  phone: string
  propertyId: string
  status: 'new' | 'contacted' | 'qualified' | 'closed'
  source: string
  createdAt: string
  notes?: string
}

interface Property {
  id: string
  title: string
  address: string
  price: number
  status: 'active' | 'pending' | 'sold' | 'draft'
  type: 'residential' | 'commercial' | 'land'
  bedrooms: number
  bathrooms: number
  sqft: number
  listingDate: string
  images?: string[]
  description?: string
  agentId: string
  leadCount: number
  viewCount: number
  favoriteCount: number
}

interface BrokerContextType {
  // Properties
  properties: MLSProperty[]
  draftProperties: MLSProperty[]
  addProperty: (property: Property) => void
  updateProperty: (id: string, updates: Partial<MLSProperty>) => void
  deleteProperty: (id: string) => void
  publishDraftProperty: (id: string) => void
  addDraftProperties: (draftListings: Record<string, unknown>[]) => MLSProperty[]
  getDraftProperties: () => MLSProperty[]
  
  // Leads
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  
  // Analytics
  getAnalytics: () => {
    totalProperties: number
    activeProperties: number
    totalLeads: number
    newLeads: number
    conversionRate: number
  }
}

const BrokerContext = createContext<BrokerContextType | undefined>(undefined)

// Storage keys with size limits
const STORAGE_KEYS = {
  properties: 'broker_properties_demo_broker_1',
  draftProperties: 'broker_draft_properties_demo_broker_1',
  leads: 'broker_leads_demo_broker_1'
}

// Storage size limits (in characters)
const STORAGE_LIMITS = {
  properties: 500000, // ~500KB
  draftProperties: 1000000, // ~1MB
  leads: 200000 // ~200KB
}

// Helper function to safely store data with size checks
const safeSetItem = (key: string, data: Record<string, unknown>[], limit: number) => {
  try {
    const jsonString = JSON.stringify(data)
    
    // Check if data exceeds limit
    if (jsonString.length > limit) {
      console.warn(`Data for ${key} exceeds size limit. Truncating...`)
      
      // If it's an array, keep only the most recent items
      if (Array.isArray(data)) {
        const truncatedData = data.slice(-Math.floor(data.length * 0.7)) // Keep 70% of most recent items
        const truncatedString = JSON.stringify(truncatedData)
        
        if (truncatedString.length <= limit) {
          localStorage.setItem(key, truncatedString)
          console.log(`Truncated ${key} from ${data.length} to ${truncatedData.length} items`)
          return
        }
      }
      
      // If still too large, clear the storage
      console.warn(`Unable to store ${key} - clearing storage`)
      localStorage.removeItem(key)
      return
    }
    
    localStorage.setItem(key, jsonString)
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      console.error(`QuotaExceededError for ${key}. Clearing storage...`)
      localStorage.removeItem(key)
      
      // Try to clear other broker data to free up space
      Object.values(STORAGE_KEYS).forEach(storageKey => {
        if (storageKey !== key) {
          try {
            const existingData = localStorage.getItem(storageKey)
            if (existingData) {
              const parsed = JSON.parse(existingData)
              if (Array.isArray(parsed) && parsed.length > 10) {
                // Keep only 10 most recent items
                const reduced = parsed.slice(-10)
                localStorage.setItem(storageKey, JSON.stringify(reduced))
                console.log(`Reduced ${storageKey} to 10 items to free space`)
              }
            }
          } catch (cleanupError) {
            console.error(`Error cleaning up ${storageKey}:`, cleanupError)
            localStorage.removeItem(storageKey)
          }
        }
      })
    } else {
      console.error(`Error storing ${key}:`, error)
    }
  }
}

// Helper function to safely get data
const safeGetItem = (key: string, defaultValue: Record<string, unknown>[] = []) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error parsing ${key}:`, error)
    localStorage.removeItem(key)
    return defaultValue
  }
}

// Helper function to safely process PhotoURLs and prevent phantom photos
const safeProcessPhotos = (photoData: unknown): string[] => {
  if (!photoData) return []
  
  if (Array.isArray(photoData)) {
    // If it's already an array, filter out empty/invalid URLs
    return photoData
      .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
      .slice(0, 20) // Limit to 20 photos max
  }
  
  if (typeof photoData === 'string') {
    // If it's a string, split by semicolon and filter
    return photoData
      .split(';')
      .map(url => url.trim())
      .filter(url => url.length > 0 && url.startsWith('http')) // Only valid HTTP URLs
      .slice(0, 20) // Limit to 20 photos max
  }
  
  return []
}

export function BrokerProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with data from localStorage
  const [properties, setProperties] = useState<MLSProperty[]>(() => 
    safeGetItem(STORAGE_KEYS.properties, [])
  )
  
  const [draftProperties, setDraftProperties] = useState<MLSProperty[]>(() => 
    safeGetItem(STORAGE_KEYS.draftProperties, [])
  )
  
  const [leads, setLeads] = useState<Lead[]>(() => 
    safeGetItem(STORAGE_KEYS.leads, [])
  )

  // Save to localStorage whenever state changes
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.properties, properties, STORAGE_LIMITS.properties)
  }, [properties])

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.draftProperties, draftProperties, STORAGE_LIMITS.draftProperties)
  }, [draftProperties])

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.leads, leads, STORAGE_LIMITS.leads)
  }, [leads])

  // Property management functions
  const addProperty = (property: Property) => {
    const newProperty: MLSProperty = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: property.status as 'active' | 'pending' | 'sold' | 'draft',
      visibility: 'public',
      listPrice: property.price,
      listingDate: property.listingDate,
      city: property.address.split(',')[1]?.trim() || '',
      state: property.address.split(',')[2]?.trim().split(' ')[0] || '',
      zipCode: property.address.split(',')[2]?.trim().split(' ')[1] || '',
      propertyType: property.type as 'residential' | 'commercial' | 'land',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      livingAreaSqFt: property.sqft,
      photos: property.images || [],
      publicRemarks: property.description,
      agentId: property.agentId,
      leadCount: property.leadCount,
      viewCount: property.viewCount,
      favoriteCount: property.favoriteCount,
      // Parse address into components
      streetNumber: property.address.split(' ')[0] || '',
      streetName: property.address.split(' ').slice(1, -3).join(' ') || '',
      streetSuffix: property.address.split(' ').slice(-3, -2)[0] || ''
    }
    
    setProperties(prev => [newProperty, ...prev])
  }

  const updateProperty = (id: string, updates: Partial<MLSProperty>) => {
    setProperties(prev => prev.map(prop => 
      prop.id === id 
        ? { ...prop, ...updates, updatedAt: new Date().toISOString() }
        : prop
    ))
    
    setDraftProperties(prev => prev.map(prop => 
      prop.id === id 
        ? { ...prop, ...updates, updatedAt: new Date().toISOString() }
        : prop
    ))
  }

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(prop => prop.id !== id))
    setDraftProperties(prev => prev.filter(prop => prop.id !== id))
  }

  // FIXED: Properly transfer all draft data to published properties
  const publishDraftProperty = (id: string) => {
    console.log('🚀 Publishing draft property:', id)
    
    const draftProperty = draftProperties.find(prop => prop.id === id)
    if (draftProperty) {
      console.log('📋 Found draft property:', draftProperty)
      
      // Create published property with all draft data preserved
      const publishedProperty: MLSProperty = {
        ...draftProperty, // Preserve ALL draft data
        status: 'active' as const,
        visibility: 'public',
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        // Ensure required fields for published properties
        leadCount: draftProperty.leadCount || 0,
        viewCount: draftProperty.viewCount || 0,
        favoriteCount: draftProperty.favoriteCount || 0
      }
      
      console.log('✅ Created published property:', publishedProperty)
      
      // Add to published properties
      setProperties(prev => {
        const updated = [publishedProperty, ...prev]
        console.log('📦 Updated properties list:', updated)
        return updated
      })
      
      // Remove from draft properties
      setDraftProperties(prev => {
        const updated = prev.filter(prop => prop.id !== id)
        console.log('📝 Updated draft properties:', updated)
        return updated
      })
      
      console.log('🎉 Property published successfully!')
    } else {
      console.error('❌ Draft property not found:', id)
    }
  }

  // FIXED: Properly map CSV data to MLSProperty structure with safe photo processing
  const addDraftProperties = (draftListings: Record<string, unknown>[]): MLSProperty[] => {
    console.log('🏠 BrokerContext: Adding draft properties:', draftListings)
    
    const newDraftProperties = draftListings.map(draft => {
      console.log('📋 Processing draft listing:', draft)
      
      // Extract data from mappedData or originalData
      const data = (draft.mappedData as Record<string, unknown>) || (draft.originalData as Record<string, unknown>) || draft
      console.log('📊 Extracted data:', data)
      
      // CRITICAL FIX: Safely process photos to prevent phantom entries
      const processedPhotos = safeProcessPhotos(data.PhotoURLs || data.photos)
      console.log('📸 Processed photos:', processedPhotos.length, 'photos')
      
      // Create properly mapped MLSProperty
      const mlsProperty: MLSProperty = {
        // Core identification
        id: (draft.id as string) || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agentId: 'demo_broker_1',
        
        // Status and visibility
        status: (draft.status as 'active' | 'pending' | 'sold' | 'draft') || 'draft',
        visibility: 'public',
        
        // CRITICAL: Map imported CSV data to MLSProperty fields
        // Price information
        listPrice: parseFloat(String(data.ListPrice || data.listPrice || data.price || '0')) || 0,
        originalListPrice: parseFloat(String(data.OriginalListPrice || data.originalListPrice || '0')) || undefined,
        
        // Location information - map from CSV fields
        streetNumber: String(data.StreetNumber || data.streetNumber || ''),
        streetName: String(data.StreetName || data.streetName || ''),
        streetSuffix: String(data.StreetSuffix || data.streetSuffix || ''),
        city: String(data.City || data.city || ''),
        state: String(data.State || data.state || data.StateOrProvince || ''),
        zipCode: String(data.ZIP || data.zipCode || data.PostalCode || ''),
        county: String(data.County || data.county || ''),
        subdivision: String(data.Subdivision || data.subdivision || data.SubdivisionName || ''),
        
        // Property details
        propertyType: String(data.PropertyCategory || data.propertyType || data.PropertyType || 'residential'),
        propertySubType: String(data.PropertySubtype || data.propertySubType || data.PropertySubType || ''),
        bedrooms: parseInt(String(data.BedroomsTotal || data.bedrooms || data.Bedrooms || '0')) || 0,
        bathrooms: parseFloat(String(data.BathroomsTotal || data.bathrooms || data.Bathrooms || '0')) || 0,
        bathroomsFull: parseInt(String(data.BathroomsFull || data.bathroomsFull || '0')) || undefined,
        bathroomsHalf: parseInt(String(data.BathroomsHalf || data.bathroomsHalf || '0')) || undefined,
        livingAreaSqFt: parseInt(String(data.LivingAreaSqFt || data.livingAreaSqFt || data.LivingArea || data.sqft || '0')) || 0,
        lotSize: parseInt(String(data.LotSizeSqFt || data.lotSize || data.LotSize || '0')) || undefined,
        yearBuilt: parseInt(String(data.YearBuilt || data.yearBuilt || '0')) || 0,
        
        // Building features
        garageSpaces: parseInt(String(data.GarageSpaces || data.garageSpaces || '0')) || undefined,
        stories: parseInt(String(data.Stories || data.stories || '0')) || undefined,
        pool: Boolean(data.Pool),
        
        // Utilities and systems
        heatingType: String(data.Heating || data.heatingType || data.HeatingType || ''),
        coolingType: String(data.Cooling || data.coolingType || data.CoolingType || ''),
        
        // Financial information
        taxes: parseFloat(String(data.TaxesAnnual || data.taxes || data.Taxes || '0')) || undefined,
        taxYear: parseInt(String(data.TaxYear || data.taxYear || '0')) || undefined,
        
        // Agent information - map from CSV fields
        listingAgentName: String(data.ListingAgentName || data.listingAgentName || data.ListingAgentFullName || ''),
        listingAgentLicense: String(data.ListingAgentLicense || data.listingAgentLicense || ''),
        listingAgentPhone: String(data.ListingAgentPhone || data.listingAgentPhone || ''),
        listingAgentEmail: String(data.ListingAgentEmail || data.listingAgentEmail || ''),
        brokerage: String(data.ListingOfficeName || data.brokerage || data.ListingOffice || ''),
        
        // Marketing information
        publicRemarks: String(data.PublicRemarks || data.publicRemarks || data.description || ''),
        brokerRemarks: String(data.BrokerRemarks || data.brokerRemarks || ''),
        showingInstructions: String(data.ShowingInstructions || data.showingInstructions || ''),
        
        // Media - FIXED: Use safely processed photos
        photos: processedPhotos,
        virtualTourUrl: String(data.VirtualTourURL || data.virtualTourUrl || ''),
        
        // Dates
        listingDate: String(data.ListingDate || data.listingDate || new Date().toISOString().split('T')[0]),
        expirationDate: String(data.ExpirationDate || data.expirationDate || ''),
        
        // Initialize counters for published properties
        leadCount: 0,
        viewCount: 0,
        favoriteCount: 0,
        
        // Validation and completion tracking
        validationErrors: (draft.validationErrors as Array<{ field: string; message: string; severity: 'error' | 'warning' }>) || [],
        validationWarnings: (draft.validationWarnings as Array<{ field: string; message: string; severity: 'error' | 'warning' }>) || [],
        completionPercentage: (draft.completionPercentage as number) || 0,
        mlsCompliant: (draft.mlsCompliant as boolean) || false,
        
        // Additional tracking
        fileName: String(draft.fileName || ''),
        fieldMatches: (draft.fieldMatches as Record<string, unknown>) || {},
        lastModified: new Date().toISOString()
      }
      
      console.log('✅ Created MLSProperty:', mlsProperty)
      return mlsProperty
    })
    
    console.log('📦 Final draft properties to add:', newDraftProperties)
    setDraftProperties(prev => [...newDraftProperties, ...prev])
    return newDraftProperties
  }

  const getDraftProperties = () => draftProperties

  // Lead management functions
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    setLeads(prev => [newLead, ...prev])
  }

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, ...updates } : lead
    ))
  }

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id))
  }

  // Analytics function
  const getAnalytics = () => {
    const totalProperties = properties.length
    const activeProperties = properties.filter(p => p.status === 'active').length
    const totalLeads = leads.length
    const newLeads = leads.filter(l => l.status === 'new').length
    const closedLeads = leads.filter(l => l.status === 'closed').length
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0

    return {
      totalProperties,
      activeProperties,
      totalLeads,
      newLeads,
      conversionRate
    }
  }

  const contextValue: BrokerContextType = {
    properties,
    draftProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    publishDraftProperty,
    addDraftProperties,
    getDraftProperties,
    leads,
    addLead,
    updateLead,
    deleteLead,
    getAnalytics
  }

  return (
    <BrokerContext.Provider value={contextValue}>
      {children}
    </BrokerContext.Provider>
  )
}

export function useBroker() {
  const context = useContext(BrokerContext)
  if (context === undefined) {
    throw new Error('useBroker must be used within a BrokerProvider')
  }
  return context
}