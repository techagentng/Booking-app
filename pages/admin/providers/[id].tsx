import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Edit, Save, X, CheckCircle, Clock, Star,
  MapPin, Phone, Mail, Globe, Calendar, Users, Award,
  Shield, AlertCircle, Upload, Image as ImageIcon
} from 'lucide-react';

// Types
interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  bannerImage: string;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  position?: number;
  isFeatured?: boolean;
  verified: boolean;
  status: 'active' | 'pending' | 'paused' | 'suspended';
  services: string[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  businessInfo: {
    establishedYear: number;
    employeeCount: number;
    serviceArea: string;
    operatingHours: string;
  };
  ratingBreakdown: {
    quality: number;
    value: number;
    punctuality: number;
    professionalism: number;
  };
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockProvider: ServiceProvider = {
  id: '1',
  name: 'Eko Hotels & Suites',
  type: 'hotels',
  description: 'Eko Hotels & Suites is a luxury hotel located in the heart of Victoria Island, Lagos.',
  image: 'https://picsum.photos/seed/eko-hotel/400/300.jpg',
  bannerImage: 'https://picsum.photos/seed/eko-banner/1200/400.jpg',
  rating: 4.8,
  reviewCount: 342,
  location: {
    address: '1415 Adetokunbo Ademola St, Victoria Island',
    city: 'Victoria Island',
    state: 'Lagos',
    coordinates: { lat: 6.4281, lng: 3.4219 },
  },
  position: 1,
  isFeatured: true,
  verified: true,
  status: 'active',
  services: ['Accommodation', 'Restaurant', 'Spa', 'Conference'],
  contact: {
    phone: '+234 1 271 2000',
    email: 'reservations@ekohotels.com',
    website: 'https://ekohotels.com',
  },
  businessInfo: {
    establishedYear: 1977,
    employeeCount: 500,
    serviceArea: 'Lagos State',
    operatingHours: '24/7',
  },
  ratingBreakdown: {
    quality: 4.9,
    value: 4.7,
    punctuality: 4.8,
    professionalism: 4.9,
  },
  adminNotes: 'Premium positioning due to excellent service quality and customer satisfaction.',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
};

export default function AdminProviderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProvider, setEditedProvider] = useState<ServiceProvider | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews' | 'positioning'>('overview');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // In production, fetch provider data by ID
    setProvider(mockProvider);
    setEditedProvider(mockProvider);
  }, [id]);

  const handleBack = () => {
    router.push('/admin/providers');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProvider({ ...provider });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProvider(provider);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In production, save to API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProvider(editedProvider);
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleStatusChange = (status: string) => {
    if (editedProvider) {
      setEditedProvider({ ...editedProvider, status: status as any });
    }
  };

  if (!provider || !editedProvider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                <p className="text-gray-600 text-sm">Provider Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit Provider
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-32 h-32 rounded-xl object-cover"
                />
                {provider.verified && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{provider.name}</h2>
                  <p className="text-gray-600 text-sm capitalize">{provider.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {provider.position && (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      #{provider.position} Featured
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{provider.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{provider.rating}</span>
                  <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.location.city}, {provider.location.state}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            {['overview', 'services', 'reviews', 'positioning'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-6 py-4 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Status Management */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
                {isEditing ? (
                  <div className="flex gap-3">
                    {['active', 'pending', 'paused', 'suspended'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                          editedProvider.status === status
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {provider.status === 'active' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {provider.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                    {provider.status === 'suspended' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <span className="capitalize font-medium">{provider.status}</span>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{provider.contact.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{provider.contact.email}</div>
                    </div>
                  </div>
                  {provider.contact.website && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-gray-500">Website</div>
                        <a href={provider.contact.website} className="font-medium text-purple-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="text-sm text-gray-500">Established</div>
                    <div className="font-medium">{provider.businessInfo.establishedYear}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="text-sm text-gray-500">Employees</div>
                    <div className="font-medium">{provider.businessInfo.employeeCount}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="text-sm text-gray-500">Service Area</div>
                    <div className="font-medium">{provider.businessInfo.serviceArea}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="text-sm text-gray-500">Hours</div>
                    <div className="font-medium">{provider.businessInfo.operatingHours}</div>
                  </div>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{provider.ratingBreakdown.quality}</div>
                    <div className="text-sm text-gray-600">Quality</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{provider.ratingBreakdown.value}</div>
                    <div className="text-sm text-gray-600">Value</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{provider.ratingBreakdown.punctuality}</div>
                    <div className="text-sm text-gray-600">Punctuality</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{provider.ratingBreakdown.professionalism}</div>
                    <div className="text-sm text-gray-600">Professionalism</div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                {isEditing ? (
                  <textarea
                    value={editedProvider.adminNotes || ''}
                    onChange={(e) => setEditedProvider({ ...editedProvider, adminNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add admin notes about this provider..."
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{provider.adminNotes || 'No admin notes added.'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.services.map((service, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{service}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="text-center py-12 text-gray-500">
                Review management will be implemented here
              </div>
            </div>
          )}

          {/* Positioning Tab */}
          {activeTab === 'positioning' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Position Management</h3>
                <button
                  onClick={() => router.push('/admin/providers/positioning')}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Manage All Positions
                </button>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {provider.position || 'Not Positioned'}
                    </div>
                    <div className="text-sm text-gray-600">Current Position</div>
                  </div>
                  {provider.isFeatured && (
                    <div className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg">
                      <Award className="w-5 h-5" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
