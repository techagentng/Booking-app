import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Save, GripVertical, Star, TrendingUp, Award,
  ChevronUp, ChevronDown, CheckCircle, AlertCircle, Info
} from 'lucide-react';

// Types
interface ProviderPosition {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number;
  reviewCount: number;
  position: number;
  isFeatured: boolean;
  boostFactor: number;
  priorityScore: number;
  featuredExpiry?: string;
  adminReason: string;
  performance: {
    completedBookings: number;
    customerSatisfaction: number;
    responseTime: number;
  };
}

// Mock data by category
const categoryProviders: { [key: string]: ProviderPosition[] } = {
  hotels: [
    {
      id: '1',
      name: 'Eko Hotels & Suites',
      type: 'hotels',
      image: 'https://picsum.photos/seed/eko-hotel/80/80.jpg',
      rating: 4.8,
      reviewCount: 342,
      position: 1,
      isFeatured: true,
      boostFactor: 1.5,
      priorityScore: 95,
      featuredExpiry: '2024-12-31',
      adminReason: 'Premium positioning due to excellent service quality and customer satisfaction',
      performance: { completedBookings: 1250, customerSatisfaction: 98, responseTime: 15 },
    },
    {
      id: '2',
      name: 'Federal Palace Hotel',
      type: 'hotels',
      image: 'https://picsum.photos/seed/federal-palace/80/80.jpg',
      rating: 4.6,
      reviewCount: 287,
      position: 2,
      isFeatured: true,
      boostFactor: 1.3,
      priorityScore: 88,
      featuredExpiry: '2024-12-31',
      adminReason: 'Strong brand recognition and consistent performance',
      performance: { completedBookings: 980, customerSatisfaction: 95, responseTime: 20 },
    },
    {
      id: '3',
      name: 'Lagos Continental Hotel',
      type: 'hotels',
      image: 'https://picsum.photos/seed/lagos-continental/80/80.jpg',
      rating: 4.4,
      reviewCount: 156,
      position: 3,
      isFeatured: true,
      boostFactor: 1.2,
      priorityScore: 82,
      featuredExpiry: '2024-12-31',
      adminReason: 'Growing popularity and positive customer feedback',
      performance: { completedBookings: 650, customerSatisfaction: 92, responseTime: 25 },
    },
  ],
  restaurants: [
    {
      id: '4',
      name: 'Terra Kulture',
      type: 'restaurants',
      image: 'https://picsum.photos/seed/terra-kulture/80/80.jpg',
      rating: 4.7,
      reviewCount: 156,
      position: 1,
      isFeatured: true,
      boostFactor: 1.5,
      priorityScore: 92,
      featuredExpiry: '2024-12-31',
      adminReason: 'Cultural significance and unique dining experience',
      performance: { completedBookings: 890, customerSatisfaction: 96, responseTime: 18 },
    },
    {
      id: '5',
      name: 'Nigerian Kitchen',
      type: 'restaurants',
      image: 'https://picsum.photos/seed/nigerian-kitchen/80/80.jpg',
      rating: 4.5,
      reviewCount: 234,
      position: 2,
      isFeatured: true,
      boostFactor: 1.3,
      priorityScore: 85,
      featuredExpiry: '2024-12-31',
      adminReason: 'Authentic cuisine and strong local following',
      performance: { completedBookings: 720, customerSatisfaction: 94, responseTime: 22 },
    },
  ],
  transport: [
    {
      id: '6',
      name: 'Uber Premium',
      type: 'transport',
      image: 'https://picsum.photos/seed/uber-premium/80/80.jpg',
      rating: 4.5,
      reviewCount: 892,
      position: 1,
      isFeatured: true,
      boostFactor: 1.5,
      priorityScore: 90,
      featuredExpiry: '2024-12-31',
      adminReason: 'Market leader with excellent reliability',
      performance: { completedBookings: 5420, customerSatisfaction: 93, responseTime: 5 },
    },
    {
      id: '7',
      name: 'Bolt Professional',
      type: 'transport',
      image: 'https://picsum.photos/seed/bolt-pro/80/80.jpg',
      rating: 4.3,
      reviewCount: 654,
      position: 2,
      isFeatured: true,
      boostFactor: 1.3,
      priorityScore: 84,
      featuredExpiry: '2024-12-31',
      adminReason: 'Competitive pricing and good service quality',
      performance: { completedBookings: 3890, customerSatisfaction: 91, responseTime: 8 },
    },
  ],
};

const categories = [
  { id: 'hotels', name: 'Hotels', icon: '🏨' },
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'events', name: 'Events', icon: '🎪' },
];

export default function AdminPositioningPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('hotels');
  const [providers, setProviders] = useState<ProviderPosition[]>(categoryProviders.hotels);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    setProviders(categoryProviders[selectedCategory] || []);
  }, [selectedCategory]);

  const handleBack = () => {
    router.push('/admin/providers');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In production, save positioning to API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (draggedItem === targetId) return;

    const draggedIndex = providers.findIndex(p => p.id === draggedItem);
    const targetIndex = providers.findIndex(p => p.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newProviders = [...providers];
      const [draggedProvider] = newProviders.splice(draggedIndex, 1);
      newProviders.splice(targetIndex, 0, draggedProvider);

      // Update positions
      const updatedProviders = newProviders.map((p, index) => ({
        ...p,
        position: index + 1,
      }));

      setProviders(updatedProviders);
    }
    setDraggedItem(null);
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newProviders = [...providers];
      [newProviders[index], newProviders[index - 1]] = [newProviders[index - 1], newProviders[index]];
      const updatedProviders = newProviders.map((p, i) => ({ ...p, position: i + 1 }));
      setProviders(updatedProviders);
    }
  };

  const moveDown = (index: number) => {
    if (index < providers.length - 1) {
      const newProviders = [...providers];
      [newProviders[index], newProviders[index + 1]] = [newProviders[index + 1], newProviders[index]];
      const updatedProviders = newProviders.map((p, i) => ({ ...p, position: i + 1 }));
      setProviders(updatedProviders);
    }
  };

  const toggleFeatured = (id: string) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
    ));
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Admin Positioning Control</h1>
                <p className="text-gray-600 text-sm">Manage provider visibility and featured positions</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gtbank-primary text-white rounded-lg hover:bg-gtbank-light-orange disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gtbank-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Positioning Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Positions 1-5: Premium featured spots (admin selected)</li>
              <li>• Positions 6-20: High-performing organic providers</li>
              <li>• Boost factors and priority scores control visibility</li>
              <li>• Featured providers get priority in search results</li>
            </ul>
          </div>
        </div>

        {/* Providers List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {categories.find(c => c.id === selectedCategory)?.name} - Positioning
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                draggable
                onDragStart={() => handleDragStart(provider.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(provider.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 hover:bg-gray-50 transition-colors ${draggedItem === provider.id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Position Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index < 5 ? 'bg-gtbank-primary' : 'bg-gray-400'
                    }`}>
                      {provider.position}
                    </div>
                  </div>

                  {/* Provider Image */}
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      {provider.isFeatured && (
                        <span className="flex items-center gap-1 bg-gtbank-bg-gray text-gtbank-primary px-2 py-0.5 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{provider.rating}</span>
                        <span>({provider.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>Score: {provider.priorityScore}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{provider.adminReason}</p>
                  </div>

                  {/* Performance Metrics */}
                  <div className="hidden md:flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{provider.performance.completedBookings}</div>
                      <div className="text-gray-500 text-xs">Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{provider.performance.customerSatisfaction}%</div>
                      <div className="text-gray-500 text-xs">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{provider.performance.responseTime}m</div>
                      <div className="text-gray-500 text-xs">Response</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === providers.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(provider.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        provider.isFeatured
                          ? 'bg-gtbank-bg-gray text-gtbank-primary'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Boost Factor Slider */}
                <div className="mt-4 ml-14">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600">Boost Factor:</label>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.1"
                      value={provider.boostFactor}
                      onChange={(e) => {
                        setProviders(providers.map(p =>
                          p.id === provider.id ? { ...p, boostFactor: parseFloat(e.target.value) } : p
                        ));
                      }}
                      className="w-48"
                    />
                    <span className="text-sm font-medium text-gray-900">{provider.boostFactor}x</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {providers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No providers in this category yet.</p>
            </div>
          )}
        </div>

        {/* Positioning Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Positioning Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gtbank-bg-gray rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gtbank-primary flex items-center justify-center text-white font-bold text-sm">
                1-5
              </div>
              <div>
                <div className="font-medium text-gray-900">Premium Featured</div>
                <div className="text-sm text-gray-600">Admin-selected top positions</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                6-20
              </div>
              <div>
                <div className="font-medium text-gray-900">Organic Ranking</div>
                <div className="text-sm text-gray-600">Performance-based positioning</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="font-medium text-gray-900">Featured Badge</div>
                <div className="text-sm text-gray-600">Priority in search results</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
