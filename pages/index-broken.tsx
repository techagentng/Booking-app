import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, Home, Building, Car, Utensils, ShoppingBag, Heart, ChevronRight, Menu, User, Globe, Navigation, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
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
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('explore');
  
  // API hooks
  const { currentLocation, loading: locationLoading } = useTripsBookAPI();
  const { categories, loading: categoriesLoading } = useCategories();
  const { featuredServices, popularDestinations, loading: exploreLoading } = useExploreData(currentLocation?.city);
  const { services: nearbyServices, loading: nearbyLoading } = useNearbyServices(
    currentLocation?.coordinates?.lat,
    currentLocation?.coordinates?.lng
  );
  const { services: trendingServices, categories: trendingCategories, loading: trendingLoading } = useTrendingServices('week', currentLocation?.city);
  const { searchServices, loading: searchLoading, results } = useSearch();
  const { location: userLocation, getCurrentPosition } = useGeolocation();

  // Icon mapping for categories
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home': return Home;
      case 'building': return Building;
      case 'car': return Car;
      case 'utensils': return Utensils;
      case 'shopping-bag': return ShoppingBag;
      default: return Home;
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Track category selection
    if (categories.find(c => c.id === categoryId)) {
      tripsBookAPI.trackCategorySelect(categoryId);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && currentLocation) {
      searchServices(query, currentLocation.city, selectedCategory === 'all' ? undefined : selectedCategory);
    }
  };

  // Get user's current location
  const handleGetLocation = async () => {
    try {
      const position = await getCurrentPosition();
      // Update location if we have coordinates
      if (position && currentLocation) {
        // You could reverse geocode here to get the city name
        console.log('User location:', position);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  // Loading state
  const isLoading = locationLoading || categoriesLoading || exploreLoading || nearbyLoading || trendingLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search hotels, food, transport..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Location Indicator */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Lagos, Nigeria</span>
          </div>
          <button className="text-xs bg-white/20 px-2 py-1 rounded-full">
            Change
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex gap-6">
            {['explore', 'nearby', 'trending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600 font-medium'
                    : 'border-transparent text-gray-500'
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
                  {categories && categories.map((category) => {
                    const Icon = getIcon(category.icon);
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                          selectedCategory === category.id
                            ? 'bg-purple-50 border-2 border-purple-600'
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

            {/* Featured Services Grid */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Services Near You</h2>
              {nearbyLoading || !nearbyServices ? (
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
                  {nearbyServices && nearbyServices.map((place, index) => (
                    <motion.div
                      key={place.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 ${place.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-2 h-2 text-white" />
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {service.count && (
                            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                              {service.count}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                        <p className="text-sm text-gray-500">{service.description}</p>
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
                <button className="text-sm text-purple-600 font-medium">View all</button>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 w-40"
                    >
                      <div className="relative">
                        <img 
                          src={destination.image} 
                          alt={destination.name}
                          className="h-24 w-full object-cover rounded-xl mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder/160/96';
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
                  <button className="bg-purple-600 text-white rounded-xl p-4 font-medium flex items-center justify-center gap-2">
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
            {/* Nearby Places */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Places Near You</h2>
                <button className="text-sm text-purple-600 font-medium">Map view</button>
              </div>
              <div className="space-y-3">
                {nearbyServices && nearbyServices.map((place, index) => {
                  const PlaceIcon = place.type === 'Hotel' ? Building : 
                                   place.type === 'Restaurant' ? Utensils :
                                   place.type === 'Transport' ? Car : ShoppingBag;
                  return (
                    <motion.div
                      key={place.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
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
                          <p className="text-sm font-medium text-purple-600">{place.price}</p>
                        </div>
                        <button className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-purple-600" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Distance Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by distance</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['< 1km', '< 5km', '< 10km', 'Any distance'].map((distance) => (
                  <button
                    key={distance}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  >
                    {distance}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Preview */}
            <div className="mb-20">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
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
                {trendingServices.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
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
                        <p className="text-sm font-medium text-purple-600">{service.price}</p>
                      </div>
                      <button className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ChevronRight className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Categories Trending */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Trending Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Luxury Hotels', change: '+12%', color: 'bg-green-100 text-green-700' },
                  { name: 'Local Restaurants', change: '+8%', color: 'bg-green-100 text-green-700' },
                  { name: 'Car Rentals', change: '+15%', color: 'bg-green-100 text-green-700' },
                  { name: 'Event Spaces', change: '+5%', color: 'bg-green-100 text-green-700' },
                ].map((category, index) => (
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
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-20">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Join the Trend</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/hotelbooking">
                  <button className="bg-purple-600 text-white rounded-xl p-4 font-medium flex items-center justify-center gap-2">
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
        )}
      </div>

      {/* Bottom Navigation - Mobile App Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-5 gap-1 py-2">
            {[
              { icon: Home, label: 'Home', active: true },
              { icon: Search, label: 'Search', active: false },
              { icon: Heart, label: 'Saved', active: false },
              { icon: Calendar, label: 'Bookings', active: false },
              { icon: User, label: 'Profile', active: false },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                    item.active ? 'text-purple-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
