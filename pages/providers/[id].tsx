import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  Star, MapPin, Phone, Mail, Globe, Clock, CheckCircle,
  ChevronRight, Calendar, Users, Award, Share2, Heart, ArrowLeft, Loader2
} from 'lucide-react';
import { reviewsAPI } from '../../lib/api/reviews';

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
  services: ProviderService[];
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
}

interface ProviderService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  status: 'active' | 'paused' | 'expired';
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
  response?: string;
  ratingBreakdown: {
    quality: number;
    value: number;
    punctuality: number;
    professionalism: number;
  };
}

// Mock data
const mockProvider: ServiceProvider = {
  id: '1',
  name: 'Eko Hotels & Suites',
  type: 'hotels',
  description: 'Eko Hotels & Suites is a luxury hotel located in the heart of Victoria Island, Lagos. We offer world-class accommodation, dining, and event facilities for both business and leisure travelers.',
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
  services: [
    {
      id: '1',
      name: 'Luxury Room',
      description: 'Spacious room with king-size bed, city view, and premium amenities',
      price: 45000,
      duration: 'Per night',
      category: 'Accommodation',
      status: 'active',
    },
    {
      id: '2',
      name: 'Executive Suite',
      description: 'Executive suite with living area, workspace, and ocean view',
      price: 85000,
      duration: 'Per night',
      category: 'Accommodation',
      status: 'active',
    },
    {
      id: '3',
      name: 'Presidential Suite',
      description: 'Ultimate luxury with private butler, panoramic views, and VIP amenities',
      price: 250000,
      duration: 'Per night',
      category: 'Accommodation',
      status: 'active',
    },
    {
      id: '4',
      name: 'Conference Room',
      description: 'Modern conference room with AV equipment and catering options',
      price: 150000,
      duration: 'Per day',
      category: 'Events',
      status: 'active',
    },
    {
      id: '5',
      name: 'Spa Treatment',
      description: 'Full body massage and spa treatment package',
      price: 25000,
      duration: '2 hours',
      category: 'Wellness',
      status: 'active',
    },
  ],
};

const mockReviews: Review[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    userAvatar: 'https://picsum.photos/seed/user1/50/50.jpg',
    rating: 5,
    comment: 'Exceptional service! The staff was very professional and the room was immaculate. Will definitely return.',
    verified: true,
    date: '2024-01-15',
    response: 'Thank you for your kind words, John! We look forward to welcoming you back.',
    ratingBreakdown: { quality: 5, value: 5, punctuality: 5, professionalism: 5 },
  },
  {
    id: '2',
    userId: '2',
    userName: 'Jane Smith',
    userAvatar: 'https://picsum.photos/seed/user2/50/50.jpg',
    rating: 4,
    comment: 'Great location and beautiful hotel. The breakfast could use more variety.',
    verified: true,
    date: '2024-01-10',
    ratingBreakdown: { quality: 4, value: 4, punctuality: 5, professionalism: 4 },
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Johnson',
    userAvatar: 'https://picsum.photos/seed/user3/50/50.jpg',
    rating: 5,
    comment: 'The conference facilities are top-notch. Our corporate event went smoothly.',
    verified: true,
    date: '2024-01-05',
    ratingBreakdown: { quality: 5, value: 5, punctuality: 5, professionalism: 5 },
  },
];

export default function ProviderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    // In production, fetch provider data by ID
    setProvider(mockProvider);
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id || typeof id !== 'string') return;

      try {
        setIsLoadingReviews(true);
        const apiReviews = await reviewsAPI.getProviderReviews(id);
        
        // Map API reviews to local Review format
        if (apiReviews && apiReviews.length > 0) {
          const mappedReviews = apiReviews.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            userName: r.user_name,
            userAvatar: r.user_avatar || 'https://picsum.photos/seed/default/50/50.jpg',
            rating: r.rating,
            comment: r.comment,
            verified: true,
            date: r.created_at,
            response: undefined,
            ratingBreakdown: { quality: r.rating, value: r.rating, punctuality: r.rating, professionalism: r.rating },
          }));
          setReviews(mappedReviews);
        }
      } catch (err) {
        setReviewsError('Failed to load reviews');
        // Keep mock data as fallback
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleServiceClick = (serviceId: string) => {
    router.push(`/providers/${id}/services/${serviceId}`);
  };

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 md:h-80">
        <img
          src={provider.bannerImage}
          alt={provider.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-32 h-32 rounded-xl object-cover shadow-md"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                    {provider.verified && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600">{provider.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Share2 className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-gray-900">{provider.rating}</span>
                  <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{provider.location.city}, {provider.location.state}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{provider.businessInfo.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>Est. {provider.businessInfo.establishedYear}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{provider.contact.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{provider.contact.email}</span>
            </div>
            {provider.contact.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <a href={provider.contact.website} className="text-purple-600 hover:underline">
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h2>
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'services'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Services ({provider.services.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {activeTab === 'services' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.services.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleServiceClick(service.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <span className="text-purple-600 font-bold">₦{service.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex items-center text-purple-600 text-sm font-medium">
                        Book Now
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="p-6">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gray-200 pb-6 last:border-b-0"
                  >
                    <div className="flex gap-4">
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{review.userName}</h3>
                          {review.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        {review.response && (
                          <div className="bg-purple-50 rounded-lg p-4 mt-3">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Response: </span>
                              {review.response}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
