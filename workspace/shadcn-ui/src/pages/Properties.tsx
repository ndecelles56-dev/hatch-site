import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Heart,
  Filter,
  Calendar,
  Phone,
  Mail,
  Shield,
  User,
  Building2,
  LogIn,
  UserPlus,
  Menu,
  X
} from 'lucide-react'

// Mock property data
const mockProperties = [
  {
    id: 1,
    title: "Modern Downtown Condo",
    address: "123 Main St, Miami, FL 33101",
    price: 450000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    type: "Condo",
    yearBuilt: 2018,
    lotSize: "0.1 acres",
    description: "Beautiful modern condo with stunning city views. Features high-end finishes, stainless steel appliances, and floor-to-ceiling windows. Located in the heart of downtown Miami with easy access to restaurants, shopping, and entertainment.",
    features: ["Hardwood Floors", "Stainless Steel Appliances", "City Views", "Balcony", "In-Unit Laundry", "Parking Included"],
    daysOnMarket: 15,
    mlsNumber: "MLS000001"
  },
  {
    id: 2,
    title: "Luxury Waterfront Villa",
    address: "456 Ocean Dr, Miami Beach, FL 33139",
    price: 1250000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
    type: "Villa",
    yearBuilt: 2020,
    lotSize: "0.3 acres",
    description: "Stunning waterfront villa with private beach access. This luxury home features an open floor plan, gourmet kitchen, and expansive outdoor living spaces. Perfect for entertaining with a pool, spa, and outdoor kitchen.",
    features: ["Waterfront", "Private Beach", "Pool & Spa", "Gourmet Kitchen", "3-Car Garage", "Smart Home Technology"],
    daysOnMarket: 8,
    mlsNumber: "MLS000002"
  },
  {
    id: 3,
    title: "Cozy Family Home",
    address: "789 Elm St, Coral Gables, FL 33134",
    price: 650000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
    type: "House",
    yearBuilt: 2015,
    lotSize: "0.2 acres",
    description: "Charming family home in the desirable Coral Gables neighborhood. Features updated kitchen, spacious bedrooms, and a beautiful backyard perfect for children and pets. Close to top-rated schools and parks.",
    features: ["Updated Kitchen", "Hardwood Floors", "Large Backyard", "2-Car Garage", "Near Schools", "Quiet Neighborhood"],
    daysOnMarket: 22,
    mlsNumber: "MLS000003"
  },
  {
    id: 4,
    title: "High-Rise Apartment",
    address: "321 Biscayne Blvd, Miami, FL 33132",
    price: 380000,
    beds: 1,
    baths: 1,
    sqft: 900,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    type: "Apartment",
    yearBuilt: 2019,
    lotSize: "N/A",
    description: "Modern high-rise apartment with breathtaking bay views. This unit features contemporary finishes, floor-to-ceiling windows, and access to world-class amenities including pool, fitness center, and concierge services.",
    features: ["Bay Views", "High-Rise Living", "Concierge", "Fitness Center", "Pool", "Valet Parking"],
    daysOnMarket: 5,
    mlsNumber: "MLS000004"
  }
]

export default function Properties() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProperties, setFilteredProperties] = useState(mockProperties)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setFilteredProperties(mockProperties)
    } else {
      const filtered = mockProperties.filter(property =>
        property.title.toLowerCase().includes(term.toLowerCase()) ||
        property.address.toLowerCase().includes(term.toLowerCase()) ||
        property.type.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredProperties(filtered)
    }
  }

  const handleViewDetails = (property: any) => {
    setSelectedProperty(property)
    setShowDetails(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <Building2 className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Hatch</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Properties
              </Button>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button variant="ghost" onClick={() => navigate('/register')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
              <Button onClick={() => navigate('/broker/dashboard')}>
                Broker Portal
              </Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4">
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" className="justify-start" onClick={() => navigate('/')}>
                  Properties
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => navigate('/login')}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => navigate('/register')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </Button>
                <Button className="justify-start" onClick={() => navigate('/broker/dashboard')}>
                  Broker Portal
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Properties</h1>
          <p className="text-lg text-gray-600 mb-6">
            Find your perfect home in Florida's most desirable locations
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by location, property type, or keywords..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredProperties.length} of {mockProperties.length} properties
            </p>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Badge className="absolute top-2 left-2 bg-blue-600">
                  {property.type}
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.address}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {property.beds} beds
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {property.baths} baths
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    {property.sqft} sqft
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => handleViewDetails(property)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all available properties.
            </p>
          </div>
        )}

        {/* Property Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProperty?.title}</DialogTitle>
              <DialogDescription>
                {selectedProperty?.address} • MLS# {selectedProperty?.mlsNumber}
              </DialogDescription>
            </DialogHeader>
            
            {selectedProperty && (
              <div className="space-y-6">
                {/* Property Image */}
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedProperty.image}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Price and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-600 mb-2">
                        {formatPrice(selectedProperty.price)}
                      </h3>
                      <div className="flex items-center gap-4 text-lg">
                        <span className="flex items-center">
                          <Bed className="w-5 h-5 mr-2" />
                          {selectedProperty.beds} Bedrooms
                        </span>
                        <span className="flex items-center">
                          <Bath className="w-5 h-5 mr-2" />
                          {selectedProperty.baths} Bathrooms
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Property Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Square Feet: {selectedProperty.sqft?.toLocaleString()}</div>
                        <div>Year Built: {selectedProperty.yearBuilt}</div>
                        <div>Lot Size: {selectedProperty.lotSize}</div>
                        <div>Property Type: {selectedProperty.type}</div>
                        <div>Days on Market: {selectedProperty.daysOnMarket}</div>
                        <div>MLS Number: {selectedProperty.mlsNumber}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Contact Agent</h4>
                      <div className="space-y-2">
                        <Button className="w-full" variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Agent
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Agent
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Showing
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button className="w-full" variant="outline">
                          <Heart className="w-4 h-4 mr-2" />
                          Save to Favorites
                        </Button>
                        <Button className="w-full" variant="outline">
                          Calculate Mortgage
                        </Button>
                        <Button className="w-full" variant="outline">
                          Share Property
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-600">{selectedProperty.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-2">Property Features</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedProperty.features?.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neighborhood Info */}
                <div>
                  <h4 className="font-semibold mb-2">Neighborhood & Schools</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Nearby Schools:</p>
                      <ul className="text-gray-600">
                        <li>• Miami Elementary School (0.3 miles)</li>
                        <li>• Central Middle School (0.7 miles)</li>
                        <li>• Miami High School (1.2 miles)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Nearby Amenities:</p>
                      <ul className="text-gray-600">
                        <li>• Shopping Center (0.5 miles)</li>
                        <li>• Public Park (0.2 miles)</li>
                        <li>• Hospital (1.5 miles)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Building2 className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-bold">Hatch</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner in finding the perfect home in Florida.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/')}>Properties</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/login')}>Login</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/register')}>Register</Button></li>
                <li><Button variant="link" className="text-gray-400 p-0 h-auto" onClick={() => navigate('/broker/dashboard')}>Broker Portal</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@hatch.com</li>
                <li>Address: 123 Main St, Miami, FL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Facebook
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Instagram
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}