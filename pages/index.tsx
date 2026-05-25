import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, Home, Building, Car, Utensils, ShoppingBag, Heart, ChevronRight, Menu, User, Globe, Navigation, Clock, TrendingUp, Bed } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { 
  useTripsBookAPI, 
  useCategories, 
  useExploreData, 
  useNearbyServices, 
  useTrendingServices, 
  useSearch,
  useGeolocation 
} from '../hooks/useTripsBookAPI';
import { Category, FeaturedService, PopularDestination } from '../lib/api/tripsbook-api';
import { tripsBookAPI } from '../lib/api/tripsbook-api';

export default function Landing() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('explore');
  
  // API hooks
  const { currentLocation, loading: locationLoading, updateLocation } = useTripsBookAPI();
  const { categories, loading: categoriesLoading } = useCategories();
  const { featuredServices, popularDestinations, loading: exploreLoading, error: exploreError } = useExploreData(currentLocation?.city);
  const { services: nearbyServices, loading: nearbyLoading, error: nearbyError } = useNearbyServices(
    currentLocation?.coordinates?.lat,
    currentLocation?.coordinates?.lng
  );
  const { services: trendingServices, categories: trendingCategories, loading: trendingLoading } = useTrendingServices('week', currentLocation?.city);
  const { searchServices, loading: searchLoading, results } = useSearch();
  const { location: userLocation, getCurrentPosition } = useGeolocation();

  // Debug state tracking
  useEffect(() => {
    console.log('🔍 Featured Services State:', featuredServices);
    console.log('📊 Is Array?:', Array.isArray(featuredServices));
    console.log('📏 Length:', featuredServices?.length);
  }, [featuredServices]);

  useEffect(() => {
    console.log('🔍 Nearby Services State:', nearbyServices);
    console.log('📊 Is Array?:', Array.isArray(nearbyServices));
    console.log('📏 Length:', nearbyServices?.length);
  }, [nearbyServices]);

  // Icon mapping for categories
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home': return Home;
      case 'building': return Bed;
      case 'car': return Car;
      case 'utensils': return Utensils;
      case 'shopping-bag': return ShoppingBag;
      default: return Home;
    }
  };

  // State for filtered services
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Handle destination selection
  const handleDestinationSelect = (destination: PopularDestination) => {
    // Update current location to selected destination
    if (updateLocation) {
      updateLocation(
        destination.name, 
        { lat: 6.4474, lng: 3.3903 } // Default coordinates - would use destination coordinates in production
      );
    }
    // Switch to nearby tab to show services in that city
    setActiveTab('nearby');
    // Track the location change
    tripsBookAPI.trackLocationChange(destination.name);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Track category selection
    if (categories.find(c => c.id === categoryId)) {
      tripsBookAPI.trackCategorySelect(categoryId);
    }
    
    // Filter services by category
    if (categoryId === 'all') {
      setFilteredServices([]);
      setIsFiltering(false);
    } else {
      setIsFiltering(true);
      setActiveTab('nearby');
      
      // Filter from nearby services or search
      const categoryServices = Array.isArray(nearbyServices) 
        ? nearbyServices.filter(
            service => service.type.toLowerCase() === categoryId.toLowerCase()
          )
        : [];
      
      if (categoryServices.length > 0) {
        setFilteredServices(categoryServices);
      } else {
        // If no nearby services, create mock filtered data
        setFilteredServices(getMockFilteredServices(categoryId));
      }
    }
  };

  // Mock filtered services by category
  const getMockFilteredServices = (categoryId: string) => {
    const mockServices: Record<string, any[]> = {
      hotels: [
        {
          id: 'hotel_1',
          name: 'Eko Hotel & Suites',
          type: 'Hotel',
          description: 'Luxury 5-star hotel with ocean view',
          image: 'https://picsum.photos/seed/ekosuite/60/60.jpg',
          rating: 4.8,
          price: '₦75,000/night',
          distance: '2.5km away',
          open_now: true,
          features: ['Pool', 'Spa', 'WiFi', 'Gym']
        },
        {
          id: 'hotel_2',
          name: 'Radisson Blu',
          type: 'Hotel',
          description: 'Premium business hotel in city center',
          image: 'https://picsum.photos/seed/radisson/60/60.jpg',
          rating: 4.6,
          price: '₦55,000/night',
          distance: '4.2km away',
          open_now: true,
          features: ['Pool', 'Conference', 'WiFi']
        },
        {
          id: 'hotel_3',
          name: 'Ibis Lagos Airport',
          type: 'Hotel',
          description: 'Comfortable budget hotel near airport',
          image: 'https://picsum.photos/seed/ibis/60/60.jpg',
          rating: 4.2,
          price: '₦25,000/night',
          distance: '8.1km away',
          open_now: true,
          features: ['WiFi', 'Breakfast', 'Shuttle']
        }
      ],
      transport: [
        {
          id: 'trans_1',
          name: 'Uber Nigeria',
          type: 'Transport',
          description: 'On-demand ride service',
          image: 'https://picsum.photos/seed/uber/60/60.jpg',
          rating: 4.5,
          price: '₦2,000 - ₦15,000',
          distance: 'Available now',
          open_now: true,
          features: ['App Booking', 'Multiple car options', 'Cash/Card']
        },
        {
          id: 'trans_2',
          name: 'Bolt (Taxify)',
          type: 'Transport',
          description: 'Fast and affordable rides',
          image: 'https://picsum.photos/seed/bolt/60/60.jpg',
          rating: 4.4,
          price: '₦1,500 - ₦12,000',
          distance: 'Available now',
          open_now: true,
          features: ['Low prices', 'Quick pickup', 'In-app payment']
        },
        {
          id: 'trans_3',
          name: 'Lagos Ride Hailing',
          type: 'Transport',
          description: 'Local ride service with professional drivers',
          image: 'https://picsum.photos/seed/lagostaxi/60/60.jpg',
          rating: 4.3,
          price: '₦1,000 - ₦10,000',
          distance: '5 drivers nearby',
          open_now: true,
          features: ['Local drivers', 'Negotiable rates', '24/7 service']
        }
      ],
      food: [
        {
          id: 'food_1',
          name: 'Shiro Restaurant',
          type: 'Restaurant',
          description: 'Asian fusion cuisine with a view',
          image: 'https://picsum.photos/seed/shiro/60/60.jpg',
          rating: 4.7,
          price: '₦15,000 - ₦35,000',
          distance: '1.8km away',
          open_now: true,
          features: ['Sushi', 'Pan-Asian', 'Rooftop dining']
        },
        {
          id: 'food_2',
          name: 'Nok by Alara',
          type: 'Restaurant',
          description: 'Contemporary African fine dining',
          image: 'https://picsum.photos/seed/nok/60/60.jpg',
          rating: 4.6,
          price: '₦12,000 - ₦25,000',
          distance: '3.2km away',
          open_now: true,
          features: ['Nigerian cuisine', 'Art gallery', 'Designer space']
        },
        {
          id: 'food_3',
          name: 'The Jazz Hole',
          type: 'Restaurant',
          description: 'Cozy cafe with live music',
          image: 'https://picsum.photos/seed/jazzhole/60/60.jpg',
          rating: 4.4,
          price: '₦3,000 - ₦8,000',
          distance: '2.1km away',
          open_now: false,
          features: ['Live jazz', 'Coffee', 'Books', 'Events']
        }
      ],
      shopping: [
        {
          id: 'shop_1',
          name: 'Ikeja City Mall',
          type: 'Shopping',
          description: 'Large shopping mall with international brands',
          image: 'https://picsum.photos/seed/ikejamall/60/60.jpg',
          rating: 4.5,
          price: '₦₦₦',
          distance: '6.5km away',
          open_now: true,
          features: ['200+ stores', 'Cinema', 'Food court', 'Parking']
        },
        {
          id: 'shop_2',
          name: 'Lekki Arts & Crafts Market',
          type: 'Shopping',
          description: 'Authentic Nigerian arts and crafts',
          image: 'https://picsum.photos/seed/lekkimarket/60/60.jpg',
          rating: 4.3,
          price: '₦ - ₦₦',
          distance: '5.8km away',
          open_now: true,
          features: ['Handmade goods', 'Souvenirs', 'Art', 'Negotiable prices']
        },
        {
          id: 'shop_3',
          name: 'Palms Shopping Mall',
          type: 'Shopping',
          description: 'Popular shopping destination in Lekki',
          image: 'https://picsum.photos/seed/palmsmall/60/60.jpg',
          rating: 4.4,
          price: '₦₦',
          distance: '7.2km away',
          open_now: true,
          features: ['Fashion', 'Supermarket', 'Restaurants', 'Entertainment']
        }
      ]
    };
    
    return mockServices[categoryId] || [];
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && currentLocation) {
      searchServices(query, currentLocation.city, selectedCategory === 'all' ? undefined : selectedCategory);
    }
  };


  const handleServiceOrder = (service: any) => {
    const serviceType = String(service.type || '').toLowerCase();
    const roomType = serviceType === 'hotel' ? 'standard' : undefined;

    router.push({
      pathname: '/bookings/new',
      query: {
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.type,
        ...(roomType ? { roomType } : {})
      }
    });
  };

  // Get user's current location
  const handleGetLocation = async () => {
    try {
      const position = await getCurrentPosition();
      // Update location if we have coordinates
      if (position && currentLocation) {
        // You could reverse geocode here to get city name
        console.log('User location:', position);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const bottomNavItems = [
    {
      icon: Home,
      label: 'Home',
      active: activeTab === 'explore',
      action: () => setActiveTab('explore')
    },
    {
      icon: Search,
      label: 'Search',
      active: activeTab === 'nearby',
      action: () => setActiveTab('nearby')
    },
    {
      icon: Heart,
      label: 'Saved',
      active: false,
      action: () => router.push('/customer/saved')
    },
    {
      icon: Calendar,
      label: 'Bookings',
      active: false,
      action: () => router.push('/customer/bookings')
    },
    {
      icon: User,
      label: 'Profile',
      active: false,
      action: () => router.push('/customer/profile')
    }
  ];

  // Loading state
  const isLoading = locationLoading || categoriesLoading || exploreLoading || nearbyLoading || trendingLoading;
  const servicesNearYouPreview = [
    ...(Array.isArray(nearbyServices) ? nearbyServices : []),
    ...getMockFilteredServices('hotels'),
    ...getMockFilteredServices('food')
  ].slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gtbank-primary to-gtbank-secondary rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TRIPSBOOK</h1>
                <p className="text-xs text-gray-600">Your City. Your Services. Instantly.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-gray-100">
                <MapPin className="w-4 h-4 text-gray-600" />
              </button>
              <div>
                <span className="text-sm font-medium text-gray-900">{currentLocation?.city || 'Lagos'}, Nigeria</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-gtbank-primary to-gtbank-secondary px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search hotels, food, transport..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gtbank-primary"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex gap-6">
            {['explore', 'nearby', 'trending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-gtbank-primary text-gtbank-primary'
                    : 'border-transparent text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {activeTab === 'explore' && (
          <div>
            {/* Quick Categories */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">What are you looking for?</h2>
              {categoriesLoading || !categories ? (
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-xl p-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const Icon = getIcon(category.icon);
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                          selectedCategory === category.id
                            ? 'bg-gtbank-bg-gray border-2 border-gtbank-primary'
                            : 'bg-white border-2 border-gray-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-gray-700 font-medium">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Services Near You Preview */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Services Near You</h2>
                <button
                  onClick={() => setActiveTab('nearby')}
                  className="text-sm text-purple-600 font-medium"
                >
                  View all
                </button>
              </div>
              {nearbyError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">Error loading nearby services: {nearbyError}</p>
                </div>
              ) : nearbyLoading && servicesNearYouPreview.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-xl p-4">
                        <div className="h-12 w-12 bg-gray-300 rounded-lg mb-3"></div>
                        <div className="h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {servicesNearYouPreview.map((place, index) => {
                    return (
                      <motion.div
                        key={place.id || place.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleServiceOrder(place)}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/60/60.jpg';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{place.type}</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{place.distance}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{place.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gtbank-primary">{place.price}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Popular Destinations */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Popular Destinations</h2>
                <Link href="/destinations">
                  <button className="text-sm text-purple-600 font-medium">View all</button>
                </Link>
              </div>
              {exploreLoading || !popularDestinations ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-40 animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-xl mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {popularDestinations && popularDestinations.map((destination, index) => (
                    <motion.div
                      key={destination.name}
                      onClick={() => handleDestinationSelect(destination)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 w-40 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <div className="relative">
                        <img 
                          src={destination.image} 
                          alt={destination.name}
                          className="h-24 w-full object-cover rounded-xl mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/160/96.jpg';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">{destination.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{destination.name}</h3>
                      <p className="text-xs text-gray-500">{destination.distance}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mb-20">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/hotelbooking">
                  <button className="bg-gtbank-primary text-white rounded-xl p-4 font-medium flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Book Hotel
                  </button>
                </Link>
                <button className="bg-gray-100 text-gray-700 rounded-xl p-4 font-medium flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Schedule Ride
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nearby' && (
          <div>
            {/* Nearby Places - Shows filtered results when category selected */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  {isFiltering && selectedCategory !== 'all' 
                    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Near You`
                    : 'Places Near You'
                  }
                </h2>
                {isFiltering && (
                  <button 
                    onClick={() => handleCategorySelect('all')}
                    className="text-sm text-purple-600 font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              
              {/* Show filtered services when filtering */}
              {isFiltering && filteredServices.length > 0 ? (
                <div className="space-y-3">
                  {filteredServices.map((place, index) => {
                    const PlaceIcon = place.type === 'Hotel' ? Building : 
                                     place.type === 'Restaurant' ? Utensils :
                                     place.type === 'Transport' ? Car : ShoppingBag;
                    return (
                      <motion.div
                        key={place.id || place.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleServiceOrder(place)}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <img 
                            src={place.image} 
                            alt={place.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/60/60.jpg';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{place.type}</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{place.distance}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{place.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gtbank-primary">{place.price}</p>
                            {place.features && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {place.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <span key={idx} className="text-xs bg-gtbank-bg-gray text-gtbank-secondary px-2 py-1 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : nearbyError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">Error loading nearby services: {nearbyError}</p>
                </div>
              ) : nearbyLoading || !nearbyServices ? (
                <div className="grid grid-cols-1 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-xl p-4">
                        <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-3"></div>
                        <div className="h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyServices && Array.isArray(nearbyServices) && nearbyServices.map((place, index) => {
                    const PlaceIcon = place.type === 'Hotel' ? Building : 
                                     place.type === 'Restaurant' ? Utensils :
                                     place.type === 'Transport' ? Car : ShoppingBag;
                    return (
                      <motion.div
                        key={place.id || place.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <img 
                            src={place.image} 
                            alt={place.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/60/60.jpg';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{place.type}</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{place.distance}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{place.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gtbank-primary">{place.price}</p>
                            {place.features && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {place.features.slice(0, 3).map((feature: string, idx: number) => (
                                  <span key={idx} className="text-xs bg-gtbank-bg-gray text-gtbank-secondary px-2 py-1 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Distance Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by distance</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['< 1km', '< 5km', '< 10km', 'Any distance'].map((distance) => (
                  <button
                    key={distance}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-orange-100 hover:text-gtbank-secondary transition-colors"
                  >
                    {distance}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Preview */}
            <div className="mb-20">
              <div className="bg-gradient-to-br from-gtbank-bg-gray to-gtbank-soft-blue rounded-xl h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gtbank-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Interactive map view</p>
                  <p className="text-xs text-gray-500">Tap to see full map</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            {/* Trending Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Trending Now</h2>
              <p className="text-sm text-gray-600">Most popular services this week</p>
            </div>

            {/* Trending Services */}
            <div className="mb-6">
              <div className="space-y-3">
                {trendingLoading || !trendingServices ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-xl p-4">
                          <div className="h-12 w-12 bg-gray-300 rounded-lg mx-auto mb-3"></div>
                          <div className="h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {trendingServices && Array.isArray(trendingServices) && trendingServices.map((service, index) => {
                    const ServiceIcon = getIcon(service.icon);
                    return (
                      <motion.div
                        key={service.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-2 h-2 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">Trending</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{service.type}</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{service.distance}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{service.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gtbank-primary">{service.price}</p>
                          </div>
                        </div>
                        <button className="w-8 h-8 bg-gtbank-bg-gray rounded-lg flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-gtbank-primary" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Categories Trending */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Trending Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {trendingCategories && Array.isArray(trendingCategories) && trendingCategories.map((category, index) => {
                  const CategoryIcon = getIcon(category.icon);
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${category.color}`}>
                          {category.change}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-20">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Join the Trend</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/hotelbooking">
                  <button className="bg-gtbank-primary text-white rounded-xl p-4 font-medium flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Book Trending
                  </button>
                </Link>
                <button className="bg-gray-100 text-gray-700 rounded-xl p-4 font-medium flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  Save Trending
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile App Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-5 gap-1 py-2">
            {bottomNavItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  item.active
                    ? 'text-purple-600'
                    : 'text-gray-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

