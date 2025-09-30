export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet: number;
  lotSize?: number;
  propertyType: PropertyType;
  propertyCategory: PropertyCategory;
  yearBuilt: number;
  daysOnMarket: number;
  listingStatus: 'Active' | 'New' | 'Price Reduced' | 'Open House' | 'Under Contract' | 'Sold' | 'For Lease' | 'Leased';
  listingType: 'For Sale' | 'For Lease' | 'Sale/Leaseback' | 'Build-to-Suit' | 'NNN Lease';
  hoaFees?: number;
  features: string[];
  imageUrl: string;
  listingDate: string;
  description: string;
  isSaved: boolean;
  
  // Commercial/Investment specific fields
  capRate?: number;
  noi?: number; // Net Operating Income
  pricePerSqft?: number;
  occupancyRate?: number;
  parkingSpaces?: number;
  zoning?: string;
  tenantInfo?: string;
  leaseTerms?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Work' | 'Distressed';
  
  // Agricultural specific fields
  acres?: number;
  soilType?: string;
  waterRights?: boolean;
  
  agent: {
    name: string;
    phone: string;
    email: string;
    company: string;
  };

  // MLS Professional Data
  mls: {
    // Owner Information
    owner: {
      name: string;
      mailingAddress: string;
      ownerOccupied: boolean;
      ownerOccupiedCode: 'O' | 'N' | 'U'; // Occupied, Non-occupied, Unknown
    };

    // Enhanced Property Location
    location: {
      subdivision: string;
      subdivisionNumber?: string;
      section: string;
      township: string;
      range: string;
      carrierRoute: string;
      censusTract: string;
      blockGroup: string;
      neighborhoodCode: string;
      schoolDistrict: string;
      schoolDistrictCode: string;
      taxingAuthority: string;
    };

    // Valuation (AVM)
    valuation: {
      estimatedValue: number;
      avmRangeLow: number;
      avmRangeHigh: number;
      valueDate: string;
      confidenceScore: number; // 0-100
      forecastStandardDeviation: number;
    };

    // Tax Information
    tax: {
      parcelId: string;
      strapNumber: string;
      alternateParcelId: string;
      lotNumber: string;
      taxAreaCode: string;
      homesteadExemption: boolean;
      legalDescription: string;
    };

    // Assessment History (3 years)
    assessmentHistory: Array<{
      year: number;
      marketValue: number;
      landValue: number;
      improvedValue: number;
      assessedValue: number;
      taxAmount: number;
    }>;

    // Detailed Lot & Land Info
    lot: {
      sizeAcres: number;
      sizeSqFt: number;
      shape: 'Standard' | 'Irregular' | 'Corner' | 'Cul-de-sac' | 'Waterfront';
      countyUseCode: string;
      stateLandUseCode: string;
      stateLandUseDescription: string;
    };

    // Comprehensive Building Details
    building: {
      yearBuilt: number;
      effectiveYearBuilt: number;
      totalLivingSqFt: number;
      grossArea: number;
      totalBuildingSqFt: number;
      stories: number;
      bedrooms: number;
      bathroomsFull: number;
      bathroomsHalf: number;
      cooling: string;
      heating: string;
      exteriorWall: string;
      interiorWall: string;
      flooring: string;
      roofType: string;
      garage: {
        type: 'Attached' | 'Detached' | 'Carport' | 'None';
        capacity: number;
        sqFt: number;
      };
      pool: {
        hasPool: boolean;
        sqFt?: number;
        type?: 'In-ground' | 'Above-ground' | 'Spa';
      };
      porch: {
        open?: number; // sq ft
        enclosed?: number; // sq ft
        finished?: number; // sq ft
      };
      patio: {
        open?: number; // sq ft
        enclosed?: number; // sq ft
      };
    };

    // Building Features & Additions
    features: Array<{
      featureType: string;
      size?: string;
      quantity?: number;
      yearBuilt?: number;
      sqFt?: number;
    }>;
  };
}

export type PropertyCategory = 
  | 'Residential' 
  | 'Commercial' 
  | 'Industrial' 
  | 'Agricultural' 
  | 'Special Purpose' 
  | 'Investment' 
  | 'Land';

export type PropertyType = 
  // Residential
  | 'Single Family' 
  | 'Condo' 
  | 'Townhouse' 
  | 'Multi-Family' 
  | 'Duplex' 
  | 'Triplex' 
  | 'Apartment Complex'
  // Commercial
  | 'Office Building' 
  | 'Retail Space' 
  | 'Shopping Center' 
  | 'Mall' 
  | 'Restaurant' 
  | 'Hotel' 
  | 'Warehouse'
  // Industrial
  | 'Manufacturing' 
  | 'Distribution Center' 
  | 'Flex Space' 
  | 'Cold Storage' 
  | 'Data Center'
  // Agricultural
  | 'Farm Land' 
  | 'Ranch' 
  | 'Orchard' 
  | 'Vineyard' 
  | 'Timber Land' 
  | 'Hunting Land'
  // Special Purpose
  | 'Church' 
  | 'School' 
  | 'Hospital' 
  | 'Gas Station' 
  | 'Car Wash' 
  | 'Self Storage'
  // Land
  | 'Vacant Land' 
  | 'Development Land';

// Professional MLS-formatted Florida property database
export const mockProperties: Property[] = [
  // RESIDENTIAL PROPERTIES - SINGLE FAMILY (Enhanced MLS Format)
  {
    id: 'R001',
    address: '22835 Snaptail Court',
    city: 'Estero',
    state: 'FL',
    zipCode: '33928-2345',
    neighborhood: 'Forest Ridge Shores',
    price: 631000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2080,
    lotSize: 0.248,
    propertyType: 'Single Family',
    propertyCategory: 'Residential',
    yearBuilt: 2001,
    daysOnMarket: 15,
    listingStatus: 'Active',
    listingType: 'For Sale',
    features: ['Pool', 'Screen Porch', 'Irrigation System', 'Concrete Pool Deck', 'Attached Garage'],
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
    listingDate: '2024-01-15',
    description: 'Beautiful single-family home in the desirable Forest Ridge Shores subdivision. This 4-bedroom, 3-bathroom home features 2,080 sq ft of living space on a 0.248-acre lot. Built in 2001, the home includes a pool, screened porch, and irrigation system. Perfect for families seeking a comfortable home in a well-established neighborhood.',
    isSaved: false,
    pricePerSqft: 303,
    condition: 'Good',
    zoning: 'RM-2',
    agent: {
      name: 'Sarah Johnson',
      phone: '(239) 555-0123',
      email: 'sarah@estero-realty.com',
      company: 'Estero Premier Realty'
    },
    mls: {
      owner: {
        name: 'Melissa Ann Bailey',
        mailingAddress: '22835 Snaptail Ct, Estero, FL 33928-2345',
        ownerOccupied: true,
        ownerOccupiedCode: 'O'
      },
      location: {
        subdivision: 'Forest Ridge Shores Sub',
        subdivisionNumber: 'E4',
        section: '04',
        township: '47',
        range: '25E',
        carrierRoute: 'R002',
        censusTract: '050320',
        blockGroup: '2',
        neighborhoodCode: '4613800',
        schoolDistrict: 'Lee County SD',
        schoolDistrictCode: '1201080',
        taxingAuthority: 'Village of Estero / Estero Fire'
      },
      valuation: {
        estimatedValue: 631000,
        avmRangeLow: 573200,
        avmRangeHigh: 688800,
        valueDate: '2024-09-15',
        confidenceScore: 83,
        forecastStandardDeviation: 9
      },
      tax: {
        parcelId: '04-47-25-E4-10000.0170',
        strapNumber: '10452525',
        alternateParcelId: '044725E4100000170',
        lotNumber: '17',
        taxAreaCode: '316',
        homesteadExemption: true,
        legalDescription: 'FOREST RIDGE SHORES SUBD PB 64 PGS 83-87 LOT 17'
      },
      assessmentHistory: [
        {
          year: 2024,
          marketValue: 580922,
          landValue: 223074,
          improvedValue: 357848,
          assessedValue: 351479,
          taxAmount: 4382.15
        },
        {
          year: 2023,
          marketValue: 541247,
          landValue: 224500,
          improvedValue: 316747,
          assessedValue: 341242,
          taxAmount: 4255.43
        },
        {
          year: 2022,
          marketValue: 443405,
          landValue: 99482,
          improvedValue: 343923,
          assessedValue: 331303,
          taxAmount: 4271.73
        }
      ],
      lot: {
        sizeAcres: 0.248,
        sizeSqFt: 10803,
        shape: 'Standard',
        countyUseCode: '100',
        stateLandUseCode: 'SFR',
        stateLandUseDescription: 'Single Family Residential'
      },
      building: {
        yearBuilt: 2001,
        effectiveYearBuilt: 2002,
        totalLivingSqFt: 2080,
        grossArea: 2549,
        totalBuildingSqFt: 2500,
        stories: 1,
        bedrooms: 4,
        bathroomsFull: 3,
        bathroomsHalf: 0,
        cooling: 'Central Air',
        heating: 'Forced Air (Electric)',
        exteriorWall: 'Concrete Block with Stucco',
        interiorWall: 'Drywall',
        flooring: 'Ceramic Tile',
        roofType: 'Asphalt Shingle',
        garage: {
          type: 'Attached',
          capacity: 2,
          sqFt: 469
        },
        pool: {
          hasPool: true,
          sqFt: 312,
          type: 'In-ground'
        },
        porch: {
          open: 187,
          enclosed: 980,
          finished: 339
        },
        patio: {
          enclosed: 668
        }
      },
      features: [
        {
          featureType: 'Pool (Residential)',
          sqFt: 312,
          yearBuilt: 2001
        },
        {
          featureType: 'Concrete Pool Deck Patio',
          sqFt: 668,
          yearBuilt: 2001
        },
        {
          featureType: 'Lawn Irrigation System',
          yearBuilt: 2001
        },
        {
          featureType: 'Enclosed Screen Porch',
          sqFt: 980
        },
        {
          featureType: 'Finished Porch Areas',
          sqFt: 526
        },
        {
          featureType: 'Finished Garage Area',
          sqFt: 469
        }
      ]
    }
  },

  {
    id: 'R002',
    address: '456 Sunset Boulevard',
    city: 'Tampa',
    state: 'FL',
    zipCode: '33602',
    neighborhood: 'Hyde Park',
    price: 725000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2200,
    lotSize: 0.25,
    propertyType: 'Single Family',
    propertyCategory: 'Residential',
    yearBuilt: 2015,
    daysOnMarket: 8,
    listingStatus: 'New',
    listingType: 'For Sale',
    features: ['Garage', 'Pool', 'Fireplace', 'Updated Kitchen', 'Hardwood Floors'],
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
    listingDate: '2024-01-25',
    description: 'Stunning modern home in prestigious Hyde Park neighborhood. This 4-bedroom, 3-bathroom residence offers 2,200 sq ft of elegant living space with premium finishes throughout.',
    isSaved: true,
    pricePerSqft: 329,
    condition: 'Excellent',
    zoning: 'RS-50',
    agent: {
      name: 'Mike Rodriguez',
      phone: '(813) 555-0456',
      email: 'mike@tampabay.com',
      company: 'Tampa Bay Homes'
    },
    mls: {
      owner: {
        name: 'Robert J. Martinez',
        mailingAddress: '456 Sunset Blvd, Tampa, FL 33602',
        ownerOccupied: false,
        ownerOccupiedCode: 'N'
      },
      location: {
        subdivision: 'Hyde Park Historic District',
        subdivisionNumber: 'HP1',
        section: '15',
        township: '28',
        range: '18E',
        carrierRoute: 'C032',
        censusTract: '011500',
        blockGroup: '1',
        neighborhoodCode: '3315200',
        schoolDistrict: 'Hillsborough County SD',
        schoolDistrictCode: '1301040',
        taxingAuthority: 'City of Tampa / Hillsborough County'
      },
      valuation: {
        estimatedValue: 725000,
        avmRangeLow: 665000,
        avmRangeHigh: 785000,
        valueDate: '2024-09-20',
        confidenceScore: 91,
        forecastStandardDeviation: 8
      },
      tax: {
        parcelId: '15-28-18-HP1-20000.0045',
        strapNumber: '15281845',
        alternateParcelId: '152818HP1200000045',
        lotNumber: '45',
        taxAreaCode: '101',
        homesteadExemption: false,
        legalDescription: 'HYDE PARK HISTORIC DISTRICT PB 12 PGS 15-18 LOT 45'
      },
      assessmentHistory: [
        {
          year: 2024,
          marketValue: 698500,
          landValue: 285000,
          improvedValue: 413500,
          assessedValue: 425000,
          taxAmount: 8950.25
        },
        {
          year: 2023,
          marketValue: 652000,
          landValue: 275000,
          improvedValue: 377000,
          assessedValue: 398500,
          taxAmount: 8387.50
        },
        {
          year: 2022,
          marketValue: 589000,
          landValue: 265000,
          improvedValue: 324000,
          assessedValue: 365000,
          taxAmount: 7665.00
        }
      ],
      lot: {
        sizeAcres: 0.25,
        sizeSqFt: 10890,
        shape: 'Standard',
        countyUseCode: '100',
        stateLandUseCode: 'SFR',
        stateLandUseDescription: 'Single Family Residential'
      },
      building: {
        yearBuilt: 2015,
        effectiveYearBuilt: 2015,
        totalLivingSqFt: 2200,
        grossArea: 2650,
        totalBuildingSqFt: 2600,
        stories: 2,
        bedrooms: 4,
        bathroomsFull: 3,
        bathroomsHalf: 1,
        cooling: 'Central Air',
        heating: 'Heat Pump',
        exteriorWall: 'Brick Veneer',
        interiorWall: 'Drywall',
        flooring: 'Hardwood/Tile',
        roofType: 'Tile',
        garage: {
          type: 'Attached',
          capacity: 2,
          sqFt: 450
        },
        pool: {
          hasPool: true,
          sqFt: 400,
          type: 'In-ground'
        },
        porch: {
          open: 200,
          finished: 150
        },
        patio: {
          open: 300
        }
      },
      features: [
        {
          featureType: 'Swimming Pool',
          sqFt: 400,
          yearBuilt: 2015
        },
        {
          featureType: 'Hardwood Flooring',
          sqFt: 1800,
          yearBuilt: 2015
        },
        {
          featureType: 'Granite Countertops',
          yearBuilt: 2015
        },
        {
          featureType: 'Stainless Steel Appliances',
          yearBuilt: 2015
        }
      ]
    }
  },

  // COMMERCIAL PROPERTIES - OFFICE BUILDINGS (Enhanced MLS Format)
  {
    id: 'COM001',
    address: '1000 Biscayne Boulevard',
    city: 'Miami',
    state: 'FL',
    zipCode: '33132',
    neighborhood: 'Downtown',
    price: 18500000,
    squareFeet: 65000,
    propertyType: 'Office Building',
    propertyCategory: 'Commercial',
    yearBuilt: 2008,
    daysOnMarket: 45,
    listingStatus: 'Active',
    listingType: 'For Sale',
    features: ['Elevator', 'Parking Garage', 'Conference Rooms', 'Fiber Internet', 'HVAC', 'Security System'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    listingDate: '2023-12-10',
    description: 'Prime downtown Miami office building with bay views. Class A office space featuring modern amenities, elevator access, and structured parking. Excellent investment opportunity in the heart of Miami\'s financial district.',
    isSaved: false,
    capRate: 6.2,
    noi: 1147000,
    pricePerSqft: 285,
    occupancyRate: 85,
    parkingSpaces: 180,
    zoning: 'T6-80-O',
    tenantInfo: '22 tenants, average lease 5 years remaining',
    condition: 'Good',
    agent: {
      name: 'Carlos Martinez',
      phone: '(305) 555-0987',
      email: 'carlos@commercialmiami.com',
      company: 'Miami Commercial Group'
    },
    mls: {
      owner: {
        name: 'Biscayne Properties LLC',
        mailingAddress: '1000 Biscayne Blvd, Miami, FL 33132',
        ownerOccupied: false,
        ownerOccupiedCode: 'N'
      },
      location: {
        subdivision: 'Downtown Miami CBD',
        subdivisionNumber: 'DT1',
        section: '01',
        township: '54',
        range: '42E',
        carrierRoute: 'C001',
        censusTract: '003600',
        blockGroup: '1',
        neighborhoodCode: '2501100',
        schoolDistrict: 'Miami-Dade County SD',
        schoolDistrictCode: '1301300',
        taxingAuthority: 'City of Miami / Miami-Dade County'
      },
      valuation: {
        estimatedValue: 18500000,
        avmRangeLow: 16800000,
        avmRangeHigh: 20200000,
        valueDate: '2024-08-30',
        confidenceScore: 78,
        forecastStandardDeviation: 12
      },
      tax: {
        parcelId: '01-54-42-DT1-50000.1000',
        strapNumber: '01544210',
        alternateParcelId: '015442DT1500001000',
        lotNumber: '1000',
        taxAreaCode: '001',
        homesteadExemption: false,
        legalDescription: 'DOWNTOWN MIAMI CBD BLOCK 10 LOTS 1-5'
      },
      assessmentHistory: [
        {
          year: 2024,
          marketValue: 17850000,
          landValue: 8500000,
          improvedValue: 9350000,
          assessedValue: 17850000,
          taxAmount: 428400.00
        },
        {
          year: 2023,
          marketValue: 16900000,
          landValue: 8200000,
          improvedValue: 8700000,
          assessedValue: 16900000,
          taxAmount: 405600.00
        },
        {
          year: 2022,
          marketValue: 15800000,
          landValue: 7800000,
          improvedValue: 8000000,
          assessedValue: 15800000,
          taxAmount: 379200.00
        }
      ],
      lot: {
        sizeAcres: 1.2,
        sizeSqFt: 52272,
        shape: 'Standard',
        countyUseCode: '050',
        stateLandUseCode: 'COM',
        stateLandUseDescription: 'Commercial Office'
      },
      building: {
        yearBuilt: 2008,
        effectiveYearBuilt: 2008,
        totalLivingSqFt: 65000,
        grossArea: 75000,
        totalBuildingSqFt: 75000,
        stories: 15,
        bedrooms: 0,
        bathroomsFull: 24,
        bathroomsHalf: 12,
        cooling: 'Central Chilled Water',
        heating: 'Central Hot Water',
        exteriorWall: 'Steel Frame with Glass Curtain Wall',
        interiorWall: 'Drywall/Glass Partition',
        flooring: 'Carpet/Tile',
        roofType: 'Built-up Membrane',
        garage: {
          type: 'Attached',
          capacity: 180,
          sqFt: 54000
        },
        pool: {
          hasPool: false
        },
        porch: {
          open: 0
        },
        patio: {
          open: 2000
        }
      },
      features: [
        {
          featureType: 'High-Speed Elevators',
          quantity: 4,
          yearBuilt: 2008
        },
        {
          featureType: 'Structured Parking',
          sqFt: 54000,
          yearBuilt: 2008
        },
        {
          featureType: 'Conference Facilities',
          sqFt: 2500,
          yearBuilt: 2008
        },
        {
          featureType: 'Fiber Optic Infrastructure',
          yearBuilt: 2008
        },
        {
          featureType: 'HVAC System',
          yearBuilt: 2008
        },
        {
          featureType: 'Security System',
          yearBuilt: 2008
        }
      ]
    }
  },

  // AGRICULTURAL PROPERTIES (Enhanced MLS Format)
  {
    id: 'AG001',
    address: '15000 State Road 70',
    city: 'Okeechobee',
    state: 'FL',
    zipCode: '34974',
    neighborhood: 'Rural',
    price: 3500000,
    squareFeet: 0,
    acres: 750,
    propertyType: 'Ranch',
    propertyCategory: 'Agricultural',
    yearBuilt: 1985,
    daysOnMarket: 65,
    listingStatus: 'Active',
    listingType: 'For Sale',
    features: ['Cattle Operation', 'Water Wells', 'Fencing', 'Equipment Barn', 'Irrigation', 'Pasture Land'],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    listingDate: '2023-11-20',
    description: 'Working cattle ranch with excellent pasture and water rights. 750 acres of prime agricultural land with established cattle operation, multiple water wells, and comprehensive fencing. Includes equipment barn and irrigation systems.',
    isSaved: false,
    pricePerSqft: 0,
    soilType: 'Sandy loam',
    waterRights: true,
    condition: 'Good',
    zoning: 'AG-1',
    agent: {
      name: 'Tom Wilson',
      phone: '(863) 555-0432',
      email: 'twilson@ruralfl.com',
      company: 'Florida Ranch Properties'
    },
    mls: {
      owner: {
        name: 'Okeechobee Cattle Company LLC',
        mailingAddress: '15000 State Road 70, Okeechobee, FL 34974',
        ownerOccupied: false,
        ownerOccupiedCode: 'N'
      },
      location: {
        subdivision: 'Rural Okeechobee County',
        section: '25',
        township: '37',
        range: '35E',
        carrierRoute: 'R015',
        censusTract: '950100',
        blockGroup: '3',
        neighborhoodCode: '9501300',
        schoolDistrict: 'Okeechobee County SD',
        schoolDistrictCode: '1504700',
        taxingAuthority: 'Okeechobee County'
      },
      valuation: {
        estimatedValue: 3500000,
        avmRangeLow: 3200000,
        avmRangeHigh: 3800000,
        valueDate: '2024-07-15',
        confidenceScore: 72,
        forecastStandardDeviation: 15
      },
      tax: {
        parcelId: '25-37-35-AG-75000.0001',
        strapNumber: '25373501',
        alternateParcelId: '253735AG750000001',
        lotNumber: '1',
        taxAreaCode: '950',
        homesteadExemption: false,
        legalDescription: 'SEC 25 TWP 37S RNG 35E AGRICULTURAL TRACT 750 ACRES'
      },
      assessmentHistory: [
        {
          year: 2024,
          marketValue: 3350000,
          landValue: 3200000,
          improvedValue: 150000,
          assessedValue: 875000, // Agricultural exemption
          taxAmount: 21875.00
        },
        {
          year: 2023,
          marketValue: 3150000,
          landValue: 3000000,
          improvedValue: 150000,
          assessedValue: 825000,
          taxAmount: 20625.00
        },
        {
          year: 2022,
          marketValue: 2950000,
          landValue: 2800000,
          improvedValue: 150000,
          assessedValue: 775000,
          taxAmount: 19375.00
        }
      ],
      lot: {
        sizeAcres: 750,
        sizeSqFt: 32670000,
        shape: 'Irregular',
        countyUseCode: '010',
        stateLandUseCode: 'AGR',
        stateLandUseDescription: 'Agricultural - Cattle Ranch'
      },
      building: {
        yearBuilt: 1985,
        effectiveYearBuilt: 1990,
        totalLivingSqFt: 2400,
        grossArea: 8500,
        totalBuildingSqFt: 8500,
        stories: 1,
        bedrooms: 3,
        bathroomsFull: 2,
        bathroomsHalf: 0,
        cooling: 'Window Units',
        heating: 'None',
        exteriorWall: 'Metal Siding',
        interiorWall: 'Drywall',
        flooring: 'Concrete/Vinyl',
        roofType: 'Metal',
        garage: {
          type: 'Detached',
          capacity: 4,
          sqFt: 1200
        },
        pool: {
          hasPool: false
        },
        porch: {
          open: 400
        },
        patio: {
          open: 0
        }
      },
      features: [
        {
          featureType: 'Cattle Handling Facilities',
          sqFt: 2500,
          yearBuilt: 1985
        },
        {
          featureType: 'Equipment Barn',
          sqFt: 4800,
          yearBuilt: 1985
        },
        {
          featureType: 'Water Wells',
          quantity: 4,
          yearBuilt: 1985
        },
        {
          featureType: 'Perimeter Fencing',
          size: '12 miles',
          yearBuilt: 1985
        },
        {
          featureType: 'Cross Fencing',
          size: '8 miles',
          yearBuilt: 1990
        },
        {
          featureType: 'Irrigation System',
          size: '200 acres',
          yearBuilt: 1995
        }
      ]
    }
  }
];

// Helper functions for filtering
export const getPropertyCategories = (): PropertyCategory[] => [
  'Residential',
  'Commercial', 
  'Industrial',
  'Agricultural',
  'Special Purpose',
  'Investment',
  'Land'
];

export const getPropertyTypesByCategory = (category: PropertyCategory): PropertyType[] => {
  const typeMap: Record<PropertyCategory, PropertyType[]> = {
    'Residential': ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Duplex', 'Triplex', 'Apartment Complex'],
    'Commercial': ['Office Building', 'Retail Space', 'Shopping Center', 'Mall', 'Restaurant', 'Hotel', 'Warehouse'],
    'Industrial': ['Manufacturing', 'Distribution Center', 'Flex Space', 'Cold Storage', 'Data Center'],
    'Agricultural': ['Farm Land', 'Ranch', 'Orchard', 'Vineyard', 'Timber Land', 'Hunting Land'],
    'Special Purpose': ['Church', 'School', 'Hospital', 'Gas Station', 'Car Wash', 'Self Storage'],
    'Investment': ['Office Building', 'Retail Space', 'Restaurant', 'Hotel', 'Apartment Complex'],
    'Land': ['Vacant Land', 'Development Land']
  };
  
  return typeMap[category] || [];
};

export const getCitiesByRegion = () => ({
  'South Florida': ['Miami', 'Miami Beach', 'Fort Lauderdale', 'Hollywood', 'Aventura', 'Coral Gables'],
  'Central Florida': ['Orlando', 'Tampa', 'St. Petersburg', 'Clearwater', 'Lakeland', 'Winter Park'],
  'North Florida': ['Jacksonville', 'Tallahassee', 'Gainesville', 'Ocala', 'Panama City'],
  'Southwest Florida': ['Naples', 'Fort Myers', 'Cape Coral', 'Sarasota', 'Bradenton', 'Port Charlotte'],
  'Treasure Coast': ['West Palm Beach', 'Boca Raton', 'Delray Beach', 'Stuart', 'Vero Beach'],
  'Florida Keys': ['Key West', 'Key Largo', 'Marathon', 'Islamorada']
});