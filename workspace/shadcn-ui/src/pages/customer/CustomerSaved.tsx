import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Trash2,
  Eye,
  Filter,
  SortDesc
} from 'lucide-react';

interface SavedProperty {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  status: string;
  images: string[];
  savedDate: string;
  agent: {
    name: string;
    photo: string;
  };
}

const CustomerSaved = () => {
  const navigate = useNavigate();
  
  // Mock saved properties data
  const [savedProperties] = useState<SavedProperty[]>([
    {
      id: '1',
      title: 'Stunning Modern Home with Pool',
      price: 850000,
      address: '123 Sunset Boulevard',
      city: 'Miami',
      state: 'FL',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      propertyType: 'Single Family',
      status: 'Active',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300'
      ],
      savedDate: '2024-01-15',
      agent: {
        name: 'Sarah Johnson',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
      }
    },
    {
      id: '2',
      title: 'Luxury Waterfront Condo',
      price: 1200000,
      address: '456 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 2200,
      propertyType: 'Condo',
      status: 'Active',
      images: [
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300'
      ],
      savedDate: '2024-01-12',
      agent: {
        name: 'Mike Rodriguez',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      }
    }
  ]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/customer/property/${propertyId}`);
  };

  const PropertyCard = ({ property }: { property: SavedProperty }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-green-600">{property.status}</Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </Button>
          <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">${property.price.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {property.bedrooms} beds
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {property.bathrooms} baths
            </div>
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              {property.sqft.toLocaleString()} sqft
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Saved {property.savedDate}</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => handlePropertyClick(property.id)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
              <p className="text-gray-600">{savedProperties.length} properties saved</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SortDesc className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {savedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved properties</h3>
            <p className="text-gray-600 mb-4">
              Start browsing properties and save your favorites here
            </p>
            <Button onClick={() => navigate('/customer/search')}>
              Browse Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSaved;