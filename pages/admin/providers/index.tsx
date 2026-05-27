import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  Search, Filter, Plus, Edit, Eye, MoreVertical, CheckCircle,
  XCircle, Clock, Star, MapPin, ChevronDown, Download, Loader2
} from 'lucide-react';
import { adminAPI } from '../../../lib/api/admin';

// Types
interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    city: string;
    state: string;
  };
  position?: number;
  isFeatured?: boolean;
  verified: boolean;
  status: 'active' | 'pending' | 'paused' | 'suspended';
  services: string[];
  businessInfo: {
    establishedYear: number;
    employeeCount: number;
  };
  createdAt: string;
}

// Mock data
const mockProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'Eko Hotels & Suites',
    type: 'hotels',
    description: 'Luxury hotel with world-class amenities',
    image: 'https://picsum.photos/seed/eko-hotel/100/100.jpg',
    rating: 4.8,
    reviewCount: 342,
    location: { address: '1415 Adetokunbo Ademola St', city: 'Victoria Island', state: 'Lagos' },
    position: 1,
    isFeatured: true,
    verified: true,
    status: 'active',
    services: ['Accommodation', 'Restaurant', 'Spa'],
    businessInfo: { establishedYear: 1977, employeeCount: 500 },
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Federal Palace Hotel',
    type: 'hotels',
    description: 'Historic hotel with modern elegance',
    image: 'https://picsum.photos/seed/federal-palace/100/100.jpg',
    rating: 4.6,
    reviewCount: 287,
    location: { address: 'Ahmadu Bello Way', city: 'Victoria Island', state: 'Lagos' },
    position: 2,
    isFeatured: true,
    verified: true,
    status: 'active',
    services: ['Accommodation', 'Casino', 'Pool'],
    businessInfo: { establishedYear: 1960, employeeCount: 350 },
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Terra Kulture',
    type: 'restaurants',
    description: 'Nigerian cuisine and cultural experience',
    image: 'https://picsum.photos/seed/terra-kulture/100/100.jpg',
    rating: 4.7,
    reviewCount: 156,
    location: { address: '1376 Tiamiyu Savage St', city: 'Victoria Island', state: 'Lagos' },
    position: 1,
    isFeatured: true,
    verified: true,
    status: 'active',
    services: ['Dining', 'Art Gallery'],
    businessInfo: { establishedYear: 2003, employeeCount: 80 },
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    name: 'New Restaurant Pending',
    type: 'restaurants',
    description: 'Awaiting verification',
    image: 'https://picsum.photos/seed/pending/100/100.jpg',
    rating: 0,
    reviewCount: 0,
    location: { address: 'Ikeja', city: 'Ikeja', state: 'Lagos' },
    verified: false,
    status: 'pending',
    services: ['Dining'],
    businessInfo: { establishedYear: 2023, employeeCount: 20 },
    createdAt: '2024-01-10',
  },
  {
    id: '5',
    name: 'Suspended Transport',
    type: 'transport',
    description: 'Currently suspended',
    image: 'https://picsum.photos/seed/suspended/100/100.jpg',
    rating: 3.5,
    reviewCount: 45,
    location: { address: 'Lagos Island', city: 'Lagos', state: 'Lagos' },
    verified: true,
    status: 'suspended',
    services: ['Ride'],
    businessInfo: { establishedYear: 2020, employeeCount: 50 },
    createdAt: '2024-01-05',
  },
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'hotels', name: 'Hotels' },
  { id: 'restaurants', name: 'Restaurants' },
  { id: 'transport', name: 'Transport' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'events', name: 'Events' },
];

const statusFilters = [
  { id: 'all', name: 'All Status' },
  { id: 'active', name: 'Active' },
  { id: 'pending', name: 'Pending' },
  { id: 'paused', name: 'Paused' },
  { id: 'suspended', name: 'Suspended' },
];

export default function AdminProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<ServiceProvider[]>(mockProviders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const verifications = await adminAPI.getPendingVerifications();
        
        // Map verification data to provider format
        if (verifications && verifications.length > 0) {
          const mappedProviders = verifications.map((v: any) => ({
            id: v.id,
            name: v.business_name || v.name,
            type: v.business_type || 'hotels',
            description: v.description || 'Pending verification',
            image: v.image_url || 'https://picsum.photos/seed/pending/100/100.jpg',
            rating: 0,
            reviewCount: 0,
            location: { 
              address: v.address || 'N/A', 
              city: v.city || 'N/A', 
              state: v.state || 'N/A' 
            },
            verified: false,
            status: 'pending' as const,
            services: [],
            businessInfo: { establishedYear: 0, employeeCount: 0 },
            createdAt: v.created_at || new Date().toISOString(),
          }));
          
          // Combine with mock active providers
          setProviders([...mappedProviders, ...mockProviders.filter(p => p.status !== 'pending')]);
        }
      } catch (err) {
        setError('Failed to load providers');
        // Keep mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    let filtered = providers;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.type === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProviders(filtered);
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleSelectAll = () => {
    if (selectedProviders.length === providers.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(providers.map(p => p.id));
    }
  };

  const handleSelectProvider = (id: string) => {
    if (selectedProviders.includes(id)) {
      setSelectedProviders(selectedProviders.filter(p => p !== id));
    } else {
      setSelectedProviders([...selectedProviders, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      paused: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock },
      suspended: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
              <p className="text-gray-600 text-sm mt-1">Manage all service providers on the platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => router.push('/admin/providers/positioning')}
                className="flex items-center gap-2 px-4 py-2 bg-gtbank-primary text-white rounded-lg hover:bg-gtbank-light-orange"
              >
                Manage Positioning
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="w-4 h-4" />
                Add Provider
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading providers...</span>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
              >
                {statusFilters.map(filter => (
                  <option key={filter.id} value={filter.id}>{filter.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">{mockProviders.length}</div>
            <div className="text-sm text-gray-600">Total Providers</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockProviders.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockProviders.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Verification</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gtbank-primary">
              {mockProviders.filter(p => p.isFeatured).length}
            </div>
            <div className="text-sm text-gray-600">Featured</div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedProviders.length === providers.length && providers.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                {selectedProviders.length > 0 ? `${selectedProviders.length} selected` : 'Select all'}
              </span>
            </div>
            {selectedProviders.length > 0 && (
              <div className="flex items-center gap-2">
                <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">
                  Verify
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">
                  Suspend
                </button>
                <button className="text-sm text-red-600 hover:text-red-700 px-3 py-1">
                  Delete
                </button>
              </div>
            )}
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider.id)}
                        onChange={() => handleSelectProvider(provider.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <img
                        src={provider.image}
                        alt={provider.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{provider.name}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                          <MapPin className="w-3 h-3" />
                          {provider.location.city}
                          {provider.verified && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 capitalize">{provider.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    {provider.position ? (
                      <span className="text-sm font-medium text-gtbank-primary">#{provider.position}</span>
                    ) : (
                      <span className="text-sm text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
                      <span className="text-xs text-gray-700">({provider.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(provider.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/providers/${provider.id}`)}
                        className="p-1 text-gray-600 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/providers/${provider.id}`)}
                        className="p-1 text-gray-600 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {providers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-700">No providers found matching your criteria.</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
