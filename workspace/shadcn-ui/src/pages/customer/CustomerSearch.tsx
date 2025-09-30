import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Heart, Search, MapPin, Bed, Bath, Square, DollarSign, Filter, Eye, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

// Mock property data
const mockProperties = [
  {
    id: 1,
    title: "Luxury Waterfront Villa",
    address: "123 Ocean Drive, Miami Beach, FL 33139",
    price: 2850000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3200,
    type: "Single Family",
    status: "For Sale",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    agent: {
      name: "Sarah Johnson",
      phone: "(305) 555-0123",
      email: "sarah@luxuryrealty.com"
    },
    features: ["Waterfront", "Pool", "Garage", "Modern Kitchen"]
  },
  {
    id: 2,
    title: "Downtown Modern Condo",
    address: "456 Biscayne Blvd, Miami, FL 33132",
    price: 750000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    type: "Condo",
    status: "For Sale",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    agent: {
      name: "Michael Chen",
      phone: "(305) 555-0456",
      email: "michael@miamicondos.com"
    },
    features: ["City View", "Gym", "Concierge", "Balcony"]
  },
  {
    id: 3,
    title: "Coral Gables Family Home",
    address: "789 Miracle Mile, Coral Gables, FL 33134",
    price: 1250000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    type: "Single Family",
    status: "For Sale",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
    agent: {
      name: "Isabella Rodriguez",
      phone: "(305) 555-0789",
      email: "isabella@coralrealty.com"
    },
    features: ["Garden", "Fireplace", "Hardwood Floors", "Updated Kitchen"]
  }
];

const CustomerSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [propertyType, setPropertyType] = useState('all');
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');
  const [savedProperties, setSavedProperties] = useState<number[]>([]);

  const handleSaveProperty = (propertyId: number) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (savedProperties.includes(propertyId)) {
      setSavedProperties(prev => prev.filter(id => id !== propertyId));
      toast.success('Property removed from saved list');
    } else {
      setSavedProperties(prev => [...prev, propertyId]);
      toast.success('Property saved successfully');
    }
  };

  const handleContactAgent = (action: 'email' | 'phone', agent: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (action === 'email') {
      toast.success(`Opening email to ${agent.name}`);
      // In real app, this would open email client or send email
    } else {
      toast.success(`Calling ${agent.name} at ${agent.phone}`);
      // In real app, this would initiate phone call
    }
  };

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
    const matchesType = propertyType === 'all' || property.type.toLowerCase().includes(propertyType.toLowerCase());
    const matchesBedrooms = bedrooms === 'any' || property.bedrooms >= parseInt(bedrooms);
    const matchesBathrooms = bathrooms === 'any' || property.bathrooms >= parseInt(bathrooms);
    
    return matchesSearch && matchesPrice && matchesType && matchesBedrooms && matchesBathrooms;
  });

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dream Home in Florida</h1>
        <p className="text-gray-600">
          {user ? `Welcome back! Browse our exclusive listings.` : 'Browse properties freely. Sign in to save favorites and contact agents.'}
        </p>
      </div>

      {/* Search Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by location, property type, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single family">Single Family</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <Select value={bathrooms} onValueChange={setBathrooms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
            </label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={5000000}
              min={0}
              step={50000}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {filteredProperties.length} Properties Found
        </h2>
        {!user && (
          <Button onClick={() => setShowAuthModal(true)} variant="outline">
            Sign In to Save Properties
          </Button>
        )}
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => handleSaveProperty(property.id)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                  savedProperties.includes(property.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${savedProperties.includes(property.id) ? 'fill-current' : ''}`} />
              </button>
              <Badge className="absolute top-3 left-3 bg-blue-600">
                {property.status}
              </Badge>
            </div>

            <CardContent className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.title}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.address}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  ${property.price.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  {property.bedrooms} bed
                </div>
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  {property.bathrooms} bath
                </div>
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  {property.sqft.toLocaleString()} sqft
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {property.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{property.features.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/customer/property/${property.id}`)}
                  className="flex-1"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  onClick={() => handleContactAgent('email', property.agent)}
                  size="sm"
                  variant="outline"
                  className="px-3"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleContactAgent('phone', property.agent)}
                  size="sm"
                  variant="outline"
                  className="px-3"
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                <div>Agent: {property.agent.name}</div>
                <div>{property.agent.phone}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">Try adjusting your search filters to see more results.</p>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default CustomerSearch;