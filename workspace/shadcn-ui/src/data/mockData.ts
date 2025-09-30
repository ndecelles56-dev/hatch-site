// Mock data for the real estate application

export const mockProperties = [
  {
    id: '1',
    title: 'Modern Downtown Condo',
    address: '123 Biscayne Blvd, Miami, FL 33132',
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    type: 'Condo',
    status: 'For Sale',
    images: ['/api/placeholder/400/300'],
    agent: 'Sarah Johnson',
    agentPhone: '(305) 555-0123',
    agentEmail: 'sarah@hatch.com',
    listingDate: '2024-01-15',
    description: 'Stunning modern condo with panoramic city views, premium finishes, and resort-style amenities.',
    features: ['City Views', 'Balcony', 'Parking', 'Pool', 'Gym', 'Concierge'],
    yearBuilt: 2020,
    daysOnMarket: 12,
    pricePerSqft: 708,
    propertyTax: 8500,
    hoaFees: 450
  },
  {
    id: '2',
    title: 'Luxury Waterfront Villa',
    address: '456 Ocean Drive, Miami Beach, FL 33139',
    price: 2500000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    type: 'Single Family',
    status: 'For Sale',
    images: ['/api/placeholder/400/300'],
    agent: 'Michael Rodriguez',
    agentPhone: '(305) 555-0456',
    agentEmail: 'michael@hatch.com',
    listingDate: '2024-01-10',
    description: 'Breathtaking waterfront villa with private dock, infinity pool, and direct ocean access.',
    features: ['Waterfront', 'Private Dock', 'Pool', 'Garden', 'Garage', 'Security'],
    yearBuilt: 2018,
    daysOnMarket: 18,
    pricePerSqft: 781,
    propertyTax: 25000,
    hoaFees: 0
  }
]

export const mockAgents = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@hatch.com',
    phone: '(305) 555-0123',
    specialties: ['Luxury Condos', 'Downtown Properties'],
    rating: 4.9,
    totalSales: 45,
    experience: '8 years',
    bio: 'Specializing in luxury downtown properties with a focus on client satisfaction.',
    image: '/api/placeholder/150/150'
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael@hatch.com',
    phone: '(305) 555-0456',
    specialties: ['Waterfront Properties', 'Luxury Homes'],
    rating: 4.8,
    totalSales: 38,
    experience: '6 years',
    bio: 'Expert in waterfront and luxury residential properties throughout South Florida.',
    image: '/api/placeholder/150/150'
  }
]

export const mockTestimonials = [
  {
    id: '1',
    name: 'Jennifer Martinez',
    role: 'Home Buyer',
    content: 'Hatch made finding our dream home effortless. The platform is intuitive and the agents are incredibly knowledgeable.',
    rating: 5,
    image: '/api/placeholder/60/60'
  },
  {
    id: '2',
    name: 'David Chen',
    role: 'Property Investor',
    content: 'As an investor, I appreciate the detailed market analytics and professional service that Hatch provides.',
    rating: 5,
    image: '/api/placeholder/60/60'
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    role: 'First-time Buyer',
    content: 'The team at Hatch guided me through every step of buying my first home. Highly recommended!',
    rating: 5,
    image: '/api/placeholder/60/60'
  }
]

export const mockStats = {
  totalProperties: 1250,
  propertiesSold: 890,
  happyClients: 2100,
  yearsExperience: 15
}