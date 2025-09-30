import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Calendar,
  Mail,
  Phone,
  Share2,
  ArrowLeft,
  DollarSign,
  User,
  Star,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

// Mock property data - in real app, this would come from API
const mockProperty = {
  id: 1,
  title: "Luxury Waterfront Villa",
  address: "123 Ocean Drive, Miami Beach, FL 33139",
  price: 2850000,
  bedrooms: 5,
  bathrooms: 4,
  sqft: 3200,
  lotSize: 0.5,
  yearBuilt: 2018,
  type: "Single Family",
  status: "For Sale",
  description: "Stunning waterfront villa with panoramic ocean views. This modern masterpiece features an open floor plan, gourmet kitchen with top-of-the-line appliances, and luxurious master suite. The outdoor space includes a resort-style pool, spa, and private dock. Perfect for entertaining with multiple living areas and a rooftop terrace.",
  images: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop"
  ],
  features: [
    "Waterfront", "Pool", "Spa", "Private Dock", "Rooftop Terrace",
    "Gourmet Kitchen", "Master Suite", "Open Floor Plan", "Ocean Views",
    "2-Car Garage", "Security System", "Smart Home Technology"
  ],
  agent: {
    name: "Sarah Johnson",
    title: "Luxury Real Estate Specialist",
    phone: "(305) 555-0123",
    email: "sarah@luxuryrealty.com",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 127,
    yearsExperience: 8
  },
  neighborhood: {
    name: "Miami Beach",
    walkScore: 88,
    schools: [
      { name: "Miami Beach Elementary", rating: 8, distance: "0.3 miles" },
      { name: "Nautilus Middle School", rating: 7, distance: "0.8 miles" },
      { name: "Miami Beach Senior High", rating: 9, distance: "1.2 miles" }
    ],
    amenities: [
      "Beach Access", "Shopping", "Restaurants", "Marina", "Golf Course"
    ]
  }
};

const CustomerPropertyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const property = mockProperty; // In real app, fetch by id

  const handleSaveProperty = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Property removed from saved list' : 'Property saved successfully');
  };

  const handleContactAgent = (action: 'email' | 'phone' | 'message') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    switch (action) {
      case 'email':
        toast.success(`Opening email to ${property.agent.name}`);
        break;
      case 'phone':
        toast.success(`Calling ${property.agent.name} at ${property.agent.phone}`);
        break;
      case 'message':
        toast.success('Opening message composer');
        break;
    }
  };

  const handleScheduleTour = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    toast.success('Opening tour scheduler');
  };

  const handleMakeOffer = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    navigate('/customer/offers');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Property link copied to clipboard');
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/customer/search')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-blue-600">{property.status}</Badge>
                  <Badge variant="secondary">{property.type}</Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSaveProperty}
                    className={isSaved ? 'bg-red-100 text-red-600' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${property.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Square className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.sqft.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.yearBuilt}</div>
                  <div className="text-sm text-gray-600">Year Built</div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              <Separator className="my-6" />

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Neighborhood Info */}
          <Card>
            <CardHeader>
              <CardTitle>Neighborhood: {property.neighborhood.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Nearby Schools</h4>
                  <div className="space-y-2">
                    {property.neighborhood.schools.map((school, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <div className="font-medium">{school.name}</div>
                          <div className="text-gray-600">{school.distance}</div>
                        </div>
                        <Badge variant="secondary">{school.rating}/10</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Local Amenities</h4>
                  <div className="space-y-1">
                    {property.neighborhood.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">Walk Score</div>
                    <div className="text-2xl font-bold text-green-600">{property.neighborhood.walkScore}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <img
                  src={property.agent.image}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold">{property.agent.name}</div>
                  <div className="text-sm text-gray-600">{property.agent.title}</div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                    {property.agent.rating} ({property.agent.reviews} reviews)
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                {property.agent.yearsExperience} years experience
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleContactAgent('phone')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Agent
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleContactAgent('email')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Agent
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleContactAgent('message')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                <div>{property.agent.phone}</div>
                <div>{property.agent.email}</div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleScheduleTour}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Tour
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={handleMakeOffer}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Make Offer
                </Button>
              </div>
              
              {!user && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Sign in for full access
                  </div>
                  <div className="text-xs text-blue-600">
                    Create an account to save properties, contact agents, and schedule tours.
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Sign In / Sign Up
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Property Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type:</span>
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lot Size:</span>
                  <span className="font-medium">{property.lotSize} acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built:</span>
                  <span className="font-medium">{property.yearBuilt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="secondary">{property.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default CustomerPropertyDetail;