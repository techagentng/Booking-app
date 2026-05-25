import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  Star, Clock, Calendar, Users, CheckCircle, ArrowLeft,
  CreditCard, Shield, MapPin, Info, ChevronRight
} from 'lucide-react';

// Types
interface ProviderService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  status: 'active' | 'paused' | 'expired';
  features: string[];
  availability: {
    available: boolean;
    nextAvailable?: string;
  };
  provider: {
    id: string;
    name: string;
    image: string;
    rating: number;
    location: string;
  };
}

interface BookingFormData {
  date: string;
  time: string;
  guests: number;
  notes: string;
}

// Mock data
const mockService: ProviderService = {
  id: '1',
  name: 'Luxury Room',
  description: 'Experience ultimate comfort in our spacious luxury room featuring a king-size bed, panoramic city views, premium amenities, and 24/7 room service. Perfect for business travelers and couples seeking relaxation.',
  price: 45000,
  duration: 'Per night',
  category: 'Accommodation',
  status: 'active',
  features: [
    'King-size bed with premium linens',
    'Panoramic city view',
    '24/7 room service',
    'High-speed WiFi',
    'Smart TV with streaming',
    'Work desk with ergonomic chair',
    'Mini bar',
    'Coffee maker',
    'Luxury toiletries',
    'Climate control',
  ],
  availability: {
    available: true,
    nextAvailable: '2024-01-20',
  },
  provider: {
    id: '1',
    name: 'Eko Hotels & Suites',
    image: 'https://picsum.photos/seed/eko-hotel/100/100.jpg',
    rating: 4.8,
    location: 'Victoria Island, Lagos',
  },
};

export default function ServiceDetailPage() {
  const router = useRouter();
  const { id, serviceId } = router.query;
  const [service, setService] = useState<ProviderService | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    date: '',
    time: '',
    guests: 1,
    notes: '',
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In production, fetch service data by ID
    setService(mockService);
  }, [id, serviceId]);

  const handleBack = () => {
    router.push(`/providers/${id}`);
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In production, submit booking to API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    router.push(`/bookings/confirm?service=${serviceId}`);
  };

  if (!service) {
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
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Provider</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  <p className="text-gray-600">{service.description}</p>
                </div>
                {service.status === 'active' && (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-gray-900">{service.provider.rating}</span>
                  <span>Provider Rating</span>
                </div>
              </div>
            </motion.div>

            {/* Provider Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Provided By</h2>
              <div className="flex items-center gap-4">
                <img
                  src={service.provider.image}
                  alt={service.provider.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{service.provider.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{service.provider.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/providers/${service.provider.id}`)}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View Profile
                </button>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
              {service.availability.available ? (
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Available for booking</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Next available: {service.availability.nextAvailable}</span>
                </div>
              )}
            </motion.div>

            {/* Booking Form */}
            {showBookingForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Book This Service</h2>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Time
                      </label>
                      <input
                        type="time"
                        required
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({ ...bookingForm, guests: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Info className="w-4 h-4 inline mr-2" />
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-md p-6 sticky top-24"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ₦{service.price.toLocaleString()}
              </div>
              <div className="text-gray-600 mb-6">{service.duration}</div>
              
              {!showBookingForm && (
                <button
                  onClick={handleBookNow}
                  disabled={!service.availability.available}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Book Now
                </button>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Secure payment guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <span>Multiple payment options</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Free cancellation up to 24h</span>
                </div>
              </div>
            </motion.div>

            {/* Service Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium text-gray-900">{service.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium text-gray-900">{service.duration}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium text-gray-900 capitalize">{service.status}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
