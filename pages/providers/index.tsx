import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { useProviders } from '../../hooks/useTripsBookAPI';
import { ServiceProvider } from '../../lib/api/tripsbook-api';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const categories: Category[] = [
  { id: 'hotels', name: 'Hotels', icon: '🏨', count: 3 },
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️', count: 3 },
  { id: 'transport', name: 'Transport', icon: '🚗', count: 3 },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', count: 2 },
  { id: 'events', name: 'Events', icon: '🎪', count: 1 },
];

export default function ProvidersPage() {
  const router = useRouter();
  const { providers, loading, error } = useProviders();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = providers || [];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.type === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  }, [selectedCategory, searchQuery, providers]);

  const handleProviderClick = (providerId: string) => {
    router.push(`/providers/${providerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Service Providers</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Featured Section */}
        {selectedCategory === 'all' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Providers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(filteredProviders) && filteredProviders
                .filter(p => p.is_featured)
                .slice(0, 3)
                .map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleProviderClick(provider.id)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={provider.image}
                        alt={provider.name}
                        className="w-full h-48 object-cover"
                      />
                      {provider.position && (
                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          #{provider.position} Featured
                        </div>
                      )}
                      {provider.verified && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          ✓ Verified
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">{provider.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{provider.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium text-gray-900">{provider.rating}</span>
                          <span>({provider.review_count})</span>
                        </div>
                        {provider.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{provider.location.city}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {provider.services && provider.services.slice(0, 3).map((service) => (
                          <span key={service.id || service.name} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* All Providers */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedCategory === 'all' ? 'All Providers' : `${categories.find(c => c.id === selectedCategory)?.name}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(filteredProviders) && filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleProviderClick(provider.id)}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-48 object-cover"
                  />
                  {provider.is_featured && (
                    <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                  {provider.verified && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      ✓ Verified
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{provider.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{provider.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-900">{provider.rating}</span>
                      <span>({provider.review_count})</span>
                    </div>
                    {provider.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location.city}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {(!Array.isArray(filteredProviders) || filteredProviders.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">No providers found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
