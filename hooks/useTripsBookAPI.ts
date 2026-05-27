import { useState, useEffect, useCallback } from 'react';
import { 
  tripsBookAPI, 
  Category, 
  Service, 
  NearbyService, 
  TrendingService, 
  FeaturedService, 
  PopularDestination, 
  TrendingCategory, 
  DistanceFilter, 
  UserLocation, 
  SearchResult,
  ServiceProvider,
  ProviderService,
  ProviderReview
} from '../lib/api/tripsbook-api';
import { servicesAPI } from '../lib/api/services';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Main API hook
export function useTripsBookAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);

  // Initialize location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setLoading(true);
        const location = await tripsBookAPI.getCurrentLocation();
        setCurrentLocation(location);
      } catch (err) {
        console.error('Failed to get current location:', err);
        // Set default location
        setCurrentLocation({
          city: 'Lagos',
          state: 'Lagos State',
          country: 'Nigeria',
          coordinates: { lat: 6.4474, lng: 3.3903 },
          timezone: 'Africa/Lagos'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);

  const updateLocation = useCallback(async (city: string, coordinates: { lat: number; lng: number }) => {
    try {
      setLoading(true);
      await tripsBookAPI.updateLocation(city, coordinates);
      const updatedLocation = await tripsBookAPI.getCurrentLocation();
      setCurrentLocation(updatedLocation);
      tripsBookAPI.trackLocationChange(city);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    currentLocation,
    updateLocation,
    api: tripsBookAPI
  };
}

// Categories hook
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesAPI.getCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

// Explore data hook
export function useExploreData(location?: string) {
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExploreData = useCallback(async (loc?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [featured, destinations] = await Promise.all([
        tripsBookAPI.getFeaturedServices(loc || 'Lagos'),
        tripsBookAPI.getPopularDestinations()
      ]);

      setFeaturedServices(featured || []);
      setPopularDestinations(destinations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch explore data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreData(location);
  }, [fetchExploreData, location]);

  return { featuredServices, popularDestinations, loading, error, refetch: () => fetchExploreData(location) };
}

// Nearby services hook
export function useNearbyServices(lat?: number, lng?: number, radius?: number, category?: string) {
  const [services, setServices] = useState<NearbyService[]>([]);
  const [distanceFilters, setDistanceFilters] = useState<DistanceFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyServices = useCallback(async (
    latitude?: number, 
    longitude?: number, 
    rad?: number, 
    cat?: string
  ) => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      setError(null);
      
      const [servicesData, filtersData] = await Promise.all([
        tripsBookAPI.getNearbyServices(latitude, longitude, rad || 5, cat),
        tripsBookAPI.getDistanceFilters(latitude, longitude, cat)
      ]);

      setServices(servicesData || []);
      setDistanceFilters(filtersData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNearbyServices(lat, lng, radius, category);
  }, [fetchNearbyServices, lat, lng, radius, category]);

  return { 
    services, 
    distanceFilters, 
    loading, 
    error, 
    refetch: () => fetchNearbyServices(lat, lng, radius, category) 
  };
}

// Trending services hook
export function useTrendingServices(period?: 'week' | 'month', location?: string) {
  const [services, setServices] = useState<TrendingService[]>([]);
  const [categories, setCategories] = useState<TrendingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingData = useCallback(async (loc?: string, per?: 'week' | 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const [servicesData, categoriesData] = await Promise.all([
        tripsBookAPI.getTrendingServices(per || 'week', loc || 'Lagos'),
        tripsBookAPI.getTrendingCategories(per || 'week')
      ]);

      setServices(servicesData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingData(location, period);
  }, [fetchTrendingData, location, period]);

  return { 
    services, 
    categories, 
    loading, 
    error, 
    refetch: () => fetchTrendingData(location, period) 
  };
}

// Search hook with debouncing
export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchServices = useCallback(
    debounce(async (query: string, location: string, category?: string) => {
      if (!query.trim()) {
        setResults(null);
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await tripsBookAPI.search(query, location, category);
        setResults(data);
        tripsBookAPI.trackSearch(query, data.services.length, category);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const getSuggestions = useCallback(
    debounce(async (query: string, location: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const data = await tripsBookAPI.getSearchSuggestions(query, location);
        setSuggestions(data);
      } catch (err) {
        console.error('Failed to get suggestions:', err);
      }
    }, 200),
    []
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setSuggestions([]);
    setError(null);
  }, []);

  return { 
    searchServices, 
    getSuggestions, 
    loading, 
    results, 
    suggestions, 
    error,
    clearResults
  };
}

// Services by category hook
export function useServicesByCategory(category: string, location?: string, page?: number) {
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (cat: string, loc?: string, pg?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tripsBookAPI.getServicesByCategory(cat, loc || 'Lagos', pg || 1, 20);
      setServices(data.services);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (category) {
      fetchServices(category, location, page);
    }
  }, [fetchServices, category, location, page]);

  const loadMore = useCallback(() => {
    if (pagination && pagination.has_next) {
      fetchServices(category, location, (page || 1) + 1);
    }
  }, [fetchServices, category, location, page, pagination]);

  return { 
    services, 
    pagination, 
    loading, 
    error, 
    loadMore, 
    refetch: () => fetchServices(category, location, page) 
  };
}

// Service details hook
export function useServiceDetails(serviceId?: string) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceDetails = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tripsBookAPI.getServiceDetails(id);
      setService(data);
      tripsBookAPI.trackServiceView(id, data.type, 'direct');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails(serviceId);
    }
  }, [fetchServiceDetails, serviceId]);

  return { service, loading, error, refetch: () => serviceId && fetchServiceDetails(serviceId) };
}

// Geolocation hook
export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = useCallback(() => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude };
          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          const errorMessage = 
            err.code === 1 ? 'Location access denied' :
            err.code === 2 ? 'Position unavailable' :
            err.code === 3 ? 'Request timeout' :
            'Unknown error';
          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  return { 
    location, 
    loading, 
    error, 
    getCurrentPosition 
  };
}

// Popular locations hook
export function usePopularLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tripsBookAPI.getPopularLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular locations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularLocations();
  }, [fetchPopularLocations]);

  return { locations, loading, error, refetch: fetchPopularLocations };
}

// Service Providers hooks
export function useProviders(category?: string) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (category && category !== 'all') {
        data = await tripsBookAPI.getProvidersByCategory(category);
      } else {
        data = await tripsBookAPI.getAllProviders();
      }
      
      setProviders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return { providers, loading, error, refetch: fetchProviders };
}

export function useFeaturedProviders(category: string) {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tripsBookAPI.getFeaturedProviders(category);
      setProviders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured providers');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchFeaturedProviders();
  }, [fetchFeaturedProviders]);

  return { providers, loading, error, refetch: fetchFeaturedProviders };
}

export function useProvider(providerId: string) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProvider = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await tripsBookAPI.getProviderById(providerId);
      if (data) {
        setProvider(data);
      } else {
        setProvider(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch provider');
      setProvider(null);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  return { provider, loading, error, refetch: fetchProvider };
}
