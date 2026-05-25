# Frontend Implementation Documentation

## Overview
This document outlines the frontend categories, features, and implementation details for the TRIPSBOOK mobile-first web application. This will help the backend team understand what endpoints and data structures are needed.

## 📱 Application Structure

### Navigation & Layout
- **Mobile-first design** with native app feel
- **Max-width container**: `max-w-lg` (centered like mobile apps)
- **Fixed bottom navigation** with 5 main sections
- **Tab-based content** (Explore, Nearby, Trending)

---

## 🏷️ Categories & Services

### Primary Categories
```typescript
const categories = [
  { id: 'all', name: 'All', icon: Home, color: 'bg-blue-500' },
  { id: 'hotels', name: 'Hotels', icon: Building, color: 'bg-purple-500' },
  { id: 'transport', name: 'Transport', icon: Car, color: 'bg-green-500' },
  { id: 'food', name: 'Food', icon: Utensils, color: 'bg-orange-500' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'bg-pink-500' }
]
```

### Service Types
1. **Hotels** - Accommodation services
2. **Restaurants** - Food & dining
3. **Transport** - Ride services, car rentals
4. **Shopping** - Malls, stores, markets
5. **Event Spaces** - Halls, venues for events

---

## 🗺️ Tab-based Content

### 1. Explore Tab
**Purpose**: General browsing and discovery

**Components**:
- Quick category grid (4x grid)
- Featured services with counts
- Popular destinations carousel
- Quick actions

**Data Needed**:
```typescript
interface FeaturedService {
  title: string;
  description: string;
  icon: string;
  color: string;
  count: number; // nearby count
}

interface PopularDestination {
  name: string;
  country: string;
  rating: number;
  distance: string;
  image: string;
}
```

### 2. Nearby Tab
**Purpose**: Location-based services

**Components**:
- Nearby places list with images
- Distance filters (< 1km, < 5km, < 10km, Any)
- Interactive map view
- Map view toggle

**Data Needed**:
```typescript
interface NearbyService {
  name: string;
  type: 'Hotel' | 'Restaurant' | 'Shopping' | 'Transport';
  distance: string;
  rating: number;
  price: string;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
```

### 3. Trending Tab
**Purpose**: Popular and trending services

**Components**:
- Trending services list with badges
- Trending categories with percentages
- "Join the Trend" actions

**Data Needed**:
```typescript
interface TrendingService {
  name: string;
  type: string;
  distance: string;
  rating: number;
  price: string;
  trending: boolean;
  image: string;
  weeklyChange: number;
}

interface TrendingCategory {
  name: string;
  change: string; // "+12%"
  color: string;
}
```

---

## 🔍 Search Functionality

### Search Bar
- **Placeholder**: "Search hotels, food, transport..."
- **Location**: Top of main content
- **Action**: Should filter across all service types

**Expected API Endpoint**:
```
GET /api/search?q={query}&location={location}&category={category}
```

---

## 📍 Location Services

### Current Location Display
- **Default**: "Lagos, Nigeria"
- **Change button**: Opens location selector
- **Used for**: Nearby calculations, distance filters

**Expected API Endpoint**:
```
GET /api/location/current
POST /api/location/update
```

---

## 🎨 UI Components & States

### Category Selection
- **Selected state**: Purple border + background
- **Unselected**: White background with gray border
- **Icons**: Circular colored backgrounds

### Service Cards
- **Layout**: White cards with shadows
- **Elements**: Image, name, type, distance, rating, price
- **Actions**: Chevron right button

### Bottom Navigation
```typescript
const navItems = [
  { icon: Home, label: 'Home', active: true },
  { icon: Search, label: 'Search', active: false },
  { icon: Heart, label: 'Saved', active: false },
  { icon: Calendar, label: 'Bookings', active: false },
  { icon: User, label: 'Profile', active: false }
]
```

---

## 📊 Data Structures Needed

### Base Service Interface
```typescript
interface BaseService {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'transport' | 'shopping' | 'event';
  description?: string;
  image: string;
  rating: number;
  price: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  operatingHours?: {
    open: string;
    close: string;
    days: string[];
  };
  features?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Hotel Specific
```typescript
interface Hotel extends BaseService {
  type: 'hotel';
  rooms: Room[];
  amenities: string[];
  starRating: number;
  checkIn: string;
  checkOut: string;
}

interface Room {
  id: string;
  type: string;
  price: number;
  capacity: number;
  available: boolean;
  images: string[];
}
```

### Restaurant Specific
```typescript
interface Restaurant extends BaseService {
  type: 'restaurant';
  cuisine: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  menuItems?: MenuItem[];
  deliveryAvailable: boolean;
  dineInAvailable: boolean;
}
```

### Transport Specific
```typescript
interface Transport extends BaseService {
  type: 'transport';
  vehicleTypes: string[];
  pricingModel: 'per_km' | 'per_hour' | 'fixed';
  basePrice: number;
  availability: boolean;
  driverInfo?: {
    name: string;
    rating: number;
    trips: number;
  };
}
```

---

## 🔗 Required API Endpoints

### Core Endpoints
```
GET /api/services                    # All services
GET /api/services/category/{type}    # By category
GET /api/services/nearby             # Location-based
GET /api/services/trending           # Trending services
GET /api/services/search             # Search functionality

GET /api/locations                   # Popular destinations
GET /api/categories                  # Available categories
GET /api/locations/current           # User's location

POST /api/bookings                   # Create booking
GET /api/bookings/user/{userId}      # User bookings
PUT /api/bookings/{id}               # Update booking
DELETE /api/bookings/{id}            # Cancel booking
```

### Filter & Sort Endpoints
```
GET /api/services?category={type}&location={city}&radius={km}&sort={rating|price|distance}
GET /api/services/nearby?lat={lat}&lng={lng}&radius={km}
GET /api/services/trending?period={week|month}&category={type}
```

---

## 🎯 User Actions & Interactions

### Category Selection
- **Action**: User taps category
- **Expected**: Filter services by selected category
- **Visual**: Category becomes highlighted

### Service Card Tap
- **Action**: User taps service card
- **Expected**: Navigate to service details page
- **Data Needed**: Full service information

### Distance Filter
- **Action**: User selects distance range
- **Expected**: Refilter nearby services
- **Options**: < 1km, < 5km, < 10km, Any distance

### Map View Toggle
- **Action**: User taps "Map view"
- **Expected**: Show map with service pins
- **Integration**: Map service (Google Maps, etc.)

---

## 📱 Mobile-Specific Features

### Touch Interactions
- **Minimum tap target**: 44px
- **Gesture support**: Swipe for carousels
- **Feedback**: Visual and haptic where possible

### Performance Considerations
- **Lazy loading**: For image carousels
- **Infinite scroll**: For long lists
- **Caching**: Service data, user preferences
- **Offline support**: Basic functionality

### Responsive Behavior
- **Primary layout**: Mobile (max-w-lg container)
- **Tablet**: Wider layouts with more columns
- **Desktop**: Full-width with sidebar navigation

---

## 🔐 Authentication & User Data

### User Profile
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  preferences: {
    favoriteCategories: string[];
    savedServices: string[];
    notifications: boolean;
  };
  bookings: string[]; // Booking IDs
}
```

### Saved Items
- **Heart icon**: Save/unsave services
- **Saved tab**: View saved services
- **Persistence**: Server-side storage

---

## 🚀 Implementation Status

### ✅ Completed
- [x] Mobile-first layout structure
- [x] Tab navigation (Explore, Nearby, Trending)
- [x] Category grid with selection
- [x] Service cards layout
- [x] Bottom navigation
- [x] Search bar UI
- [x] Location indicator
- [x] Distance filters UI
- [x] Trending indicators
- [x] Quick action buttons

### 🔄 In Progress
- [ ] Service detail pages
- [ ] Map integration
- [ ] Booking flow
- [ ] User authentication
- [ ] Real data integration

### ⏳ Planned
- [ ] Push notifications
- [ ] Offline mode
- [ ] Advanced filters
- [ ] Reviews and ratings
- [ ] Payment integration

---

## 📝 Notes for Backend Team

1. **Location-based queries** are critical - all nearby features depend on accurate geolocation
2. **Trending algorithm** should consider bookings, searches, and user interactions
3. **Image optimization** needed for mobile performance
4. **Caching strategy** important for frequently accessed data
5. **API response times** should be optimized for mobile networks
6. **Error handling** should be user-friendly for mobile context

---

## 🤝 Next Steps

1. **Review data structures** and provide feedback
2. **Implement API endpoints** based on requirements
3. **Set up testing environment** with sample data
4. **Coordinate integration** between frontend and backend
5. **Performance testing** on mobile devices

---

*Last Updated: May 11, 2026*
*Frontend Version: 1.0.0*
*Contact: Frontend Development Team*
