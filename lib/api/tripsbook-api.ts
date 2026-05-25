// TripsBook API Service - Mobile First Public API Integration

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  features: string[];
}

export interface NearbyService extends Service {
  distance: string;
  open_now: boolean;
  available_now: boolean;
}

export interface TrendingService extends Service {
  icon: string;
  distance: string;
  trending: boolean;
  weekly_change: number;
  trending_badge: string;
}

export interface FeaturedService {
  title: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  image: string;
}

export interface PopularDestination {
  name: string;
  country: string;
  rating: number;
  distance: string;
  image: string;
  service_count: number;
}

// Service Provider Interfaces
export interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  banner_image?: string;
  rating: number;
  review_count: number;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: { lat: number; lng: number };
  };
  position?: number;
  is_featured: boolean;
  verified: boolean;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  business_info?: {
    established_year?: number;
    employee_count?: number;
    service_area?: string;
    operating_hours?: string;
  };
  rating_breakdown?: {
    quality: number;
    value: number;
    punctuality: number;
    professionalism: number;
  };
  services?: ProviderService[];
  admin_notes?: string;
  status?: 'active' | 'pending' | 'paused' | 'suspended';
}

export interface ProviderService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  status: 'active' | 'paused' | 'expired' | 'draft';
  features?: string[];
  availability?: {
    available: boolean;
    next_available?: string;
  };
}

export interface ProviderReview {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
  response?: string;
  rating_breakdown?: {
    quality: number;
    value: number;
    punctuality: number;
    professionalism: number;
  };
}

export interface TrendingCategory {
  name: string;
  change: string;
  color: string;
  icon: string;
}

export interface DistanceFilter {
  label: string;
  value: number;
  count: number;
}

export interface UserLocation {
  city: string;
  state: string;
  country: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
}

export interface SearchResult {
  services: Service[];
  suggestions: string[];
  categories: { name: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta: {
    timestamp: string;
    location?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

class TripsBookAPI {
  private baseURL: string;
  private useMockData: boolean;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || (
      process.env.NODE_ENV === 'production' 
        ? 'https://api.tripsbook.com/api/v1/public'
        : 'http://localhost:8081/api/v1/public'
    );
    // Use mock data if backend is not available (disabled by default to use real API)
    this.useMockData = false;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // If we're in development and backend is not available, use mock data
    if (this.useMockData) {
      console.log(`Using mock data for: ${endpoint}`);
      return this.getMockData(endpoint);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      // If fetch fails (network error, CORS, etc.), fallback to mock data
      if (!response.ok) {
        console.warn(`API not available for ${endpoint}, falling back to mock data`);
        return this.getMockData(endpoint);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        console.warn(`API error for ${endpoint}, falling back to mock data`);
        return this.getMockData(endpoint);
      }
    } catch (error) {
      console.warn(`API Error [${endpoint}]: ${error}, falling back to mock data`);
      return this.getMockData(endpoint);
    }
  }

  private getMockData<T>(endpoint: string): T {
    if (endpoint.startsWith('/services/nearby/filters')) {
      return this.getMockDistanceFilters() as T;
    }

    if (endpoint.startsWith('/services/nearby')) {
      return this.getMockNearbyServices() as T;
    }

    switch (endpoint) {
      case '/categories':
        return this.getMockCategories() as T;
      case '/categories/trending':
        return this.getMockTrendingCategories() as T;
      case '/explore/featured':
        return this.getMockFeaturedServices() as T;
      case '/explore/destinations':
        return this.getMockPopularDestinations() as T;
      case '/services/nearby':
        return this.getMockNearbyServices() as T;
      case '/services/nearby/filters':
        return this.getMockDistanceFilters() as T;
      case '/services/trending':
        return this.getMockTrendingServices() as T;
      case '/location/current':
        return this.getMockCurrentLocation() as T;
      case '/locations/popular':
        return this.getMockPopularLocations() as T;
      default:
        console.warn(`No mock data available for ${endpoint}`);
        return {} as T;
    }
  }

  private getMockCategories(): Category[] {
    return [
      { id: 'all', name: 'All', icon: 'home', color: 'bg-blue-500', count: 1250 },
      { id: 'hotels', name: 'Hotels', icon: 'building', color: 'bg-purple-500', count: 450 },
      { id: 'transport', name: 'Transport', icon: 'car', color: 'bg-green-500', count: 320 },
      { id: 'food', name: 'Food', icon: 'utensils', color: 'bg-orange-500', count: 280 },
      { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: 'bg-pink-500', count: 200 }
    ];
  }

  private getMockTrendingCategories(): TrendingCategory[] {
    return [
      { name: 'Hotels', change: '+23%', color: 'bg-purple-500', icon: 'building' },
      { name: 'Transport', change: '+18%', color: 'bg-green-500', icon: 'car' },
      { name: 'Food', change: '+12%', color: 'bg-orange-500', icon: 'utensils' },
      { name: 'Shopping', change: '+8%', color: 'bg-pink-500', icon: 'shopping-bag' }
    ];
  }

  private getMockFeaturedServices(): FeaturedService[] {
    return [
      { title: 'Hotels', description: '12 nearby', icon: 'building', color: 'bg-purple-500', count: 12, image: 'https://picsum.photos/seed/hotel/80/80.jpg' },
      { title: 'Restaurants', description: '28 nearby', icon: 'utensils', color: 'bg-orange-500', count: 28, image: 'https://picsum.photos/seed/restaurant/80/80.jpg' },
      { title: 'Transport', description: 'Available', icon: 'car', color: 'bg-green-500', count: null, image: 'https://picsum.photos/seed/transport/80/80.jpg' },
      { title: 'Shopping', description: '8 nearby', icon: 'shopping-bag', color: 'bg-pink-500', count: 8, image: 'https://picsum.photos/seed/shopping/80/80.jpg' }
    ];
  }

  private getMockPopularDestinations(): PopularDestination[] {
    return [
      { name: 'Lagos', country: 'Nigeria', rating: 4.8, distance: '0km', image: 'https://picsum.photos/seed/lagos/160/96.jpg', service_count: 1250 },
      { name: 'Abuja', country: 'Nigeria', rating: 4.7, distance: '500km', image: 'https://picsum.photos/seed/abuja/160/96.jpg', service_count: 850 },
      { name: 'Port Harcourt', country: 'Nigeria', rating: 4.6, distance: '650km', image: 'https://picsum.photos/seed/portharcourt/160/96.jpg', service_count: 420 },
      { name: 'Kano', country: 'Nigeria', rating: 4.5, distance: '800km', image: 'https://picsum.photos/seed/kano/160/96.jpg', service_count: 320 }
    ];
  }

  private getMockNearbyServices(): NearbyService[] {
    return [
      {
        id: 'svc_1',
        name: 'Eko Hotel & Suites',
        type: 'Hotel',
        description: 'Luxury 5-star hotel with ocean view and premium amenities',
        image: 'https://picsum.photos/seed/ekosuite/60/60.jpg',
        rating: 4.8,
        price: '₦75,000/night',
        location: {
          address: '1415 Adetokunbo Ademola Street, Victoria Island',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-1-2778000', email: 'reservations@ekohotel.com' },
        features: ['WiFi', 'Pool', 'Beach Access', 'Spa', 'Gym', 'Restaurant'],
        distance: '2.3km',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_2',
        name: 'Jevinik Restaurant',
        type: 'Restaurant',
        description: 'Authentic Nigerian cuisine with modern twist',
        image: 'https://picsum.photos/seed/jevinik/60/60.jpg',
        rating: 4.3,
        price: '₦8,000 - ₦15,000',
        location: {
          address: '14 Adeola Hopewell Street, Victoria Island',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-800-000-0001' },
        features: ['Local Cuisine', 'Delivery', 'Outdoor Seating', 'Bar'],
        distance: '0.8km',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_3',
        name: 'Radisson Blu Anchorage',
        type: 'Hotel',
        description: 'Upscale hotel with waterfront views and business facilities',
        image: 'https://picsum.photos/seed/radisson/60/60.jpg',
        rating: 4.6,
        price: '₦95,000/night',
        location: {
          address: '1a Ozumba Mbadiwe Avenue, Victoria Island',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-1-2776000', email: 'info.lagos@radissonblu.com' },
        features: ['WiFi', 'Pool', 'Conference Rooms', 'Bar', 'Gym', 'SPA'],
        distance: '1.5km',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_4',
        name: 'Uber Nigeria',
        type: 'Transport',
        description: 'On-demand ride service with multiple car options',
        image: 'https://picsum.photos/seed/uber/60/60.jpg',
        rating: 4.5,
        price: '₦2,000 - ₦15,000',
        location: {
          address: 'Available throughout Lagos',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-700-UBER-NG' },
        features: ['App Booking', 'Multiple car options', 'Cash/Card Payment', '24/7'],
        distance: 'Available now',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_5',
        name: 'Shiro Restaurant & Bar',
        type: 'Restaurant',
        description: 'Pan-Asian cuisine with stunning views and rooftop dining',
        image: 'https://picsum.photos/seed/shiro/60/60.jpg',
        rating: 4.7,
        price: '₦15,000 - ₦35,000',
        location: {
          address: 'Landmark Centre, Water Corporation Drive, Victoria Island',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-700-SHIRO-NG' },
        features: ['Sushi', 'Pan-Asian', 'Rooftop Dining', 'Bar', 'Seafood'],
        distance: '3.2km',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_6',
        name: 'Ikeja City Mall',
        type: 'Shopping',
        description: 'Premier shopping destination with international brands',
        image: 'https://picsum.photos/seed/ikejamall/60/60.jpg',
        rating: 4.5,
        price: '₦₦₦',
        location: {
          address: '194 Obafemi Awolowo Way, Ikeja',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.6018, lng: 3.3515 }
        },
        contact: { phone: '+234-1-2950000' },
        features: ['200+ Stores', 'Cinema', 'Food Court', 'Parking', 'ATM'],
        distance: '8.5km',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_7',
        name: 'Bolt (Taxify)',
        type: 'Transport',
        description: 'Fast and affordable rides across Lagos',
        image: 'https://picsum.photos/seed/bolt/60/60.jpg',
        rating: 4.4,
        price: '₦1,500 - ₦12,000',
        location: {
          address: 'Available throughout Lagos',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-700-BOLT-NG' },
        features: ['Low Prices', 'Quick Pickup', 'In-app Payment', '24/7'],
        distance: 'Available now',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_8',
        name: 'The Jazz Hole',
        type: 'Restaurant',
        description: 'Cozy cafe with live jazz music and book collection',
        image: 'https://picsum.photos/seed/jazzhole/60/60.jpg',
        rating: 4.4,
        price: '₦3,000 - ₦8,000',
        location: {
          address: '32 Awolowo Road, Ikoyi',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-1-2950000' },
        features: ['Live Jazz', 'Coffee', 'Books', 'Events', 'Wine'],
        distance: '2.8km',
        open_now: false,
        available_now: false
      },
      {
        id: 'svc_9',
        name: 'Palms Shopping Mall',
        type: 'Shopping',
        description: 'Popular shopping center in Lekki with diverse stores',
        image: 'https://picsum.photos/seed/palmsmall/60/60.jpg',
        rating: 4.4,
        price: '₦₦',
        location: {
          address: '1 Bisway Street, Maroko, Lekki',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.4903 }
        },
        contact: { phone: '+234-1-2778000' },
        features: ['Fashion', 'Supermarket', 'Restaurants', 'Entertainment', 'Parking'],
        distance: '12.5km',
        open_now: true,
        available_now: true
      },
      {
        id: 'svc_10',
        name: 'Ibis Lagos Airport',
        type: 'Hotel',
        description: 'Comfortable budget hotel near Murtala Muhammed Airport',
        image: 'https://picsum.photos/seed/ibis/60/60.jpg',
        rating: 4.2,
        price: '₦25,000/night',
        location: {
          address: 'Airport Road, Ikeja',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.5775, lng: 3.3212 }
        },
        contact: { phone: '+234-1-2778000', email: 'ibis.lagos@accor.com' },
        features: ['WiFi', 'Breakfast', 'Airport Shuttle', 'Restaurant', 'Bar'],
        distance: '15.8km',
        open_now: true,
        available_now: true
      }
    ];
  }

  private getMockDistanceFilters(): DistanceFilter[] {
    return [
      { label: '< 1 km', value: 1, count: 45 },
      { label: '< 5 km', value: 5, count: 128 },
      { label: '< 10 km', value: 10, count: 234 },
      { label: 'Any distance', value: 0, count: 1250 }
    ];
  }

  private getMockTrendingServices(): TrendingService[] {
    return [
      {
        id: 'svc_3',
        name: 'Transcorp Hilton',
        type: 'Hotel',
        description: 'Luxury hotel in Abuja',
        image: 'https://picsum.photos/seed/transcorp/60/60.jpg',
        rating: 4.7,
        price: '₦65,000',
        location: {
          address: '1 Constitution Avenue',
          city: 'Abuja',
          state: 'FCT',
          coordinates: { lat: 9.0579, lng: 7.4951 }
        },
        contact: { phone: '+234-800-000-0002' },
        features: ['WiFi', 'Pool', 'Gym', 'Spa'],
        icon: 'building',
        distance: 'Abuja',
        trending: true,
        weekly_change: 23.5,
        trending_badge: '🔥 Hot'
      },
      {
        id: 'svc_4',
        name: 'Terra Kulture',
        type: 'Restaurant',
        description: 'Contemporary Nigerian cuisine',
        image: 'https://picsum.photos/seed/terrakulture/60/60.jpg',
        rating: 4.8,
        price: '₦12,000',
        location: {
          address: 'Victoria Island',
          city: 'Lagos',
          state: 'Lagos State',
          coordinates: { lat: 6.4474, lng: 3.3903 }
        },
        contact: { phone: '+234-800-000-0003' },
        features: ['Cultural Experience', 'Art Gallery'],
        icon: 'utensils',
        distance: 'Lagos',
        trending: true,
        weekly_change: 18.2,
        trending_badge: '📈 Rising'
      }
    ];
  }

  private getMockCurrentLocation(): UserLocation {
    return {
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria',
      coordinates: { lat: 6.4474, lng: 3.3903 },
      timezone: 'Africa/Lagos'
    };
  }

  private getMockPopularLocations(): any[] {
    return [
      {
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria',
        service_count: 1250,
        image: 'https://picsum.photos/seed/lagoscity/200/120.jpg'
      },
      {
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria',
        service_count: 850,
        image: 'https://picsum.photos/seed/abujacity/200/120.jpg'
      }
    ];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getTrendingCategories(period: 'week' | 'month' = 'week'): Promise<TrendingCategory[]> {
    return this.request<TrendingCategory[]>(`/categories/trending?period=${period}`);
  }

  // Services
  async getServicesByCategory(
    category: string,
    location: string = 'Lagos',
    page: number = 1,
    limit: number = 20
  ): Promise<{ services: Service[]; pagination: any }> {
    const params = new URLSearchParams({
      location,
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.request<any>(`/services/category/${category}?${params}`);
  }

  async getNearbyServices(
    lat: number,
    lng: number,
    radius: number = 5,
    category?: string
  ): Promise<NearbyService[]> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString()
    });
    
    if (category) {
      params.append('category', category);
    }
    
    const response = await this.request<NearbyService[] | { services: NearbyService[] }>(`/services/nearby?${params}`);
    return Array.isArray(response) ? response : response.services || [];
  }

  async getDistanceFilters(
    lat: number,
    lng: number,
    category?: string
  ): Promise<DistanceFilter[]> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString()
    });
    
    if (category) {
      params.append('category', category);
    }
    
    const response = await this.request<DistanceFilter[] | { filters: DistanceFilter[] }>(`/services/nearby/filters?${params}`);
    return Array.isArray(response) ? response : response.filters || [];
  }

  async getTrendingServices(
    period: 'week' | 'month' = 'week',
    location: string = 'Lagos'
  ): Promise<TrendingService[]> {
    const params = new URLSearchParams({ period, location });
    return this.request<TrendingService[]>(`/services/trending?${params}`);
  }

  async getServiceDetails(serviceId: string): Promise<any> {
    return this.request<any>(`/services/${serviceId}`);
  }

  // Explore
  async getFeaturedServices(location: string = 'Lagos'): Promise<FeaturedService[]> {
    return this.request<FeaturedService[]>(`/explore/featured?location=${location}`);
  }

  async getPopularDestinations(): Promise<PopularDestination[]> {
    return this.request<PopularDestination[]>('/explore/destinations');
  }

  // Service Providers
  async getProvidersByCategory(category: string): Promise<ServiceProvider[]> {
    const response = await this.request<{ providers: ServiceProvider[] }>(`/providers/category/${category}`);
    return response.providers || [];
  }

  async getFeaturedProviders(category: string): Promise<ServiceProvider[]> {
    const response = await this.request<{ providers: ServiceProvider[] }>(`/providers/category/${category}/featured`);
    return response.providers || [];
  }

  async getProviderById(providerId: string): Promise<ServiceProvider> {
    const response = await this.request<{ provider: ServiceProvider }>(`/providers/${providerId}`);
    return response.provider || null;
  }

  async getAllProviders(): Promise<ServiceProvider[]> {
    const response = await this.request<{ providers: ServiceProvider[] }>('/providers');
    return response.providers || [];
  }

  // Search
  async search(
    query: string,
    location: string = 'Lagos',
    category?: string,
    lat?: number,
    lng?: number
  ): Promise<SearchResult> {
    const params = new URLSearchParams({ q: query, location });
    
    if (category && category !== 'all') {
      params.append('category', category);
    }
    
    if (lat && lng) {
      params.append('lat', lat.toString());
      params.append('lng', lng.toString());
    }
    
    return this.request<SearchResult>(`/search?${params}`);
  }

  async getSearchSuggestions(query: string, location: string = 'Lagos'): Promise<any[]> {
    return this.request<any[]>(`/search/suggestions?q=${query}&location=${location}`);
  }

  // Location
  async getCurrentLocation(): Promise<UserLocation> {
    return this.request<UserLocation>('/location/current');
  }

  async updateLocation(city: string, coordinates: { lat: number; lng: number }): Promise<void> {
    return this.request<void>('/location/update', {
      method: 'POST',
      body: JSON.stringify({ city, coordinates }),
    });
  }

  async getPopularLocations(): Promise<any[]> {
    return this.request<any[]>('/locations/popular');
  }

  // Map
  async getMapViewServices(
    bounds: {
      southwest: { lat: number; lng: number };
      northeast: { lat: number; lng: number };
    },
    category?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      sw_lat: bounds.southwest.lat.toString(),
      sw_lng: bounds.southwest.lng.toString(),
      ne_lat: bounds.northeast.lat.toString(),
      ne_lng: bounds.northeast.lng.toString()
    });

    if (category && category !== 'all') {
      params.append('category', category);
    }

    return this.request<any>(`/services/map?${params}`);
  }

  // Analytics
  async track(event: string, data: Record<string, any>): Promise<void> {
    try {
      await fetch(`${this.baseURL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          data,
          user_fingerprint: this.generateFingerprint(),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  }

  private generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('User fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas?.toDataURL() || ''
    ].join('|');
    
    return btoa(fingerprint).substring(0, 16);
  }

  // Utility methods for tracking
  trackServiceView(serviceId: string, category: string, source: string) {
    this.track('service_view', {
      service_id: serviceId,
      category,
      source
    });
  }

  trackSearch(query: string, resultsCount: number, category?: string) {
    this.track('search', {
      query,
      results_count: resultsCount,
      category
    });
  }

  trackCategorySelect(category: string) {
    this.track('category_select', { category });
  }

  trackLocationChange(location: string) {
    this.track('location_change', { location });
  }
}

// Create singleton instance
export const tripsBookAPI = new TripsBookAPI();

// Export class for custom instances
export { TripsBookAPI };

