import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  Plus, Edit, Eye, Trash2, Search, Filter, Clock,
  CheckCircle, XCircle, PauseCircle, MoreVertical, ChevronDown, ArrowLeft
} from 'lucide-react';

// Types
interface ProviderService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  status: 'active' | 'paused' | 'expired' | 'draft';
  bookings: number;
  rating: number;
  createdAt: string;
  expiresAt?: string;
}

// Mock data
const mockServices: ProviderService[] = [
  {
    id: '1',
    name: 'Luxury Room',
    description: 'Spacious room with king-size bed, city view, and premium amenities',
    price: 45000,
    duration: 'Per night',
    category: 'Accommodation',
    status: 'active',
    bookings: 125,
    rating: 4.8,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Executive Suite',
    description: 'Executive suite with living area, workspace, and ocean view',
    price: 85000,
    duration: 'Per night',
    category: 'Accommodation',
    status: 'active',
    bookings: 89,
    rating: 4.9,
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Presidential Suite',
    description: 'Ultimate luxury with private butler, panoramic views, and VIP amenities',
    price: 250000,
    duration: 'Per night',
    category: 'Accommodation',
    status: 'active',
    bookings: 45,
    rating: 5.0,
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    name: 'Conference Room',
    description: 'Modern conference room with AV equipment and catering options',
    price: 150000,
    duration: 'Per day',
    category: 'Events',
    status: 'active',
    bookings: 67,
    rating: 4.7,
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    name: 'Spa Treatment',
    description: 'Full body massage and spa treatment package',
    price: 25000,
    duration: '2 hours',
    category: 'Wellness',
    status: 'paused',
    bookings: 234,
    rating: 4.6,
    createdAt: '2024-01-06',
  },
  {
    id: '6',
    name: 'Room Service',
    description: '24/7 in-room dining service',
    price: 15000,
    duration: 'Per order',
    category: 'Dining',
    status: 'draft',
    bookings: 0,
    rating: 0,
    createdAt: '2024-01-10',
  },
];

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'accommodation', name: 'Accommodation' },
  { id: 'events', name: 'Events' },
  { id: 'wellness', name: 'Wellness' },
  { id: 'dining', name: 'Dining' },
];

const statusFilters = [
  { id: 'all', name: 'All Status' },
  { id: 'active', name: 'Active' },
  { id: 'paused', name: 'Paused' },
  { id: 'expired', name: 'Expired' },
  { id: 'draft', name: 'Draft' },
];

export default function ProviderServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<ProviderService[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = mockServices;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category.toLowerCase() === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setServices(filtered);
  }, [selectedCategory, selectedStatus, searchQuery]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      paused: { bg: 'bg-orange-100', text: 'text-orange-700', icon: PauseCircle },
      expired: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const handleEdit = (serviceId: string) => {
    router.push(`/provider/services/${serviceId}/edit`);
  };

  const handleView = (serviceId: string) => {
    router.push(`/providers/1/services/${serviceId}`);
  };

  const handleDelete = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleToggleStatus = (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setServices(services.map(s =>
      s.id === serviceId ? { ...s, status: newStatus as any } : s
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-1">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
              </div>
              <p className="text-gray-600 text-sm mt-1">Manage your service offerings</p>
            </div>
            <button
              onClick={() => router.push('/provider/services/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gtbank-primary text-white rounded-lg hover:bg-gtbank-light-orange"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
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
            <div className="text-2xl font-bold text-gray-900">{mockServices.length}</div>
            <div className="text-sm text-gray-600">Total Services</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockServices.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-orange-600">
              {mockServices.filter(s => s.status === 'paused').length}
            </div>
            <div className="text-sm text-gray-600">Paused</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gtbank-primary">
              {mockServices.reduce((sum, s) => sum + s.bookings, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Bookings
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
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-700 truncate max-w-xs">{service.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 capitalize">{service.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">₦{service.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-700">{service.duration}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{service.bookings}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">{service.rating > 0 ? service.rating : '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(service.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(service.id)}
                        className="p-1 text-gray-600 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(service.id)}
                        className="p-1 text-gray-600 hover:text-gray-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(service.id, service.status)}
                        className="p-1 text-gray-600 hover:text-gray-600"
                        title={service.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {service.status === 'active' ? (
                          <PauseCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-1 text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-700">No services found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
