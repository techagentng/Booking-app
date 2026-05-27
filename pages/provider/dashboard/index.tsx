import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  TrendingUp, DollarSign, Users, Star, Clock, Calendar,
  ChevronRight, Plus, Filter, Download, AlertCircle,
  CheckCircle, ArrowUpRight, ArrowDownRight, Minus, ArrowLeft, Loader2
} from 'lucide-react';
import { providerAPI } from '../../../lib/api/provider';

// Types
interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  activeServices: number;
  averageRating: number;
  ratingChange: number;
  responseTime: number;
  pendingRequests: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface RecentReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  responded: boolean;
}

// Mock data
const mockStats: DashboardStats = {
  totalRevenue: 1250000,
  revenueChange: 15.2,
  totalBookings: 342,
  bookingsChange: 8.5,
  activeServices: 5,
  averageRating: 4.8,
  ratingChange: 0.2,
  responseTime: 18,
  pendingRequests: 12,
};

const mockRecentBookings: RecentBooking[] = [
  {
    id: '1',
    customerName: 'John Doe',
    service: 'Luxury Room',
    date: '2024-01-15',
    amount: 45000,
    status: 'confirmed',
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    service: 'Executive Suite',
    date: '2024-01-14',
    amount: 85000,
    status: 'completed',
  },
  {
    id: '3',
    customerName: 'Mike Johnson',
    service: 'Conference Room',
    date: '2024-01-14',
    amount: 150000,
    status: 'pending',
  },
  {
    id: '4',
    customerName: 'Sarah Williams',
    service: 'Spa Treatment',
    date: '2024-01-13',
    amount: 25000,
    status: 'completed',
  },
  {
    id: '5',
    customerName: 'David Brown',
    service: 'Luxury Room',
    date: '2024-01-12',
    amount: 45000,
    status: 'cancelled',
  },
];

const mockRecentReviews: RecentReview[] = [
  {
    id: '1',
    customerName: 'John Doe',
    rating: 5,
    comment: 'Exceptional service! Will definitely return.',
    date: '2024-01-15',
    responded: true,
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    rating: 4,
    comment: 'Great experience, room was clean and comfortable.',
    date: '2024-01-14',
    responded: false,
  },
  {
    id: '3',
    customerName: 'Mike Johnson',
    rating: 5,
    comment: 'Conference facilities were top-notch.',
    date: '2024-01-13',
    responded: true,
  },
];

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>(mockRecentBookings);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>(mockRecentReviews);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const analytics = await providerAPI.getDashboardAnalytics();
        
        // Map analytics data to dashboard stats
        if (analytics) {
          setStats({
            totalRevenue: analytics.total_revenue || mockStats.totalRevenue,
            revenueChange: analytics.revenue_change || mockStats.revenueChange,
            totalBookings: analytics.total_bookings || mockStats.totalBookings,
            bookingsChange: analytics.bookings_change || mockStats.bookingsChange,
            activeServices: analytics.active_services || mockStats.activeServices,
            averageRating: analytics.average_rating || mockStats.averageRating,
            ratingChange: analytics.rating_change || mockStats.ratingChange,
            responseTime: analytics.response_time || mockStats.responseTime,
            pendingRequests: analytics.pending_requests || mockStats.pendingRequests,
          });
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        // Keep mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
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
                <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
              </div>
              <p className="text-gray-600 text-sm mt-1">Welcome back, Eko Hotels & Suites</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gtbank-primary" />
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1">
                {getChangeIcon(stats.revenueChange)}
                <span className={`text-sm font-medium ${getChangeColor(stats.revenueChange)}`}>
                  {Math.abs(stats.revenueChange)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₦{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1">
                {getChangeIcon(stats.bookingsChange)}
                <span className={`text-sm font-medium ${getChangeColor(stats.bookingsChange)}`}>
                  {Math.abs(stats.bookingsChange)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gtbank-bg-gray rounded-lg">
                <Star className="w-6 h-6 text-gtbank-primary" />
              </div>
              <div className="flex items-center gap-1">
                {getChangeIcon(stats.ratingChange)}
                <span className={`text-sm font-medium ${getChangeColor(stats.ratingChange)}`}>
                  {Math.abs(stats.ratingChange)}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-sm text-gray-500">
                {stats.responseTime}m avg
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.activeServices}</div>
            <div className="text-sm text-gray-600">Active Services</div>
          </motion.div>
        </div>

        {/* Pending Requests Alert */}
        {stats.pendingRequests > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-900">
                  {stats.pendingRequests} Pending Requests
                </div>
                <div className="text-sm text-yellow-800">
                  You have pending bookings that need your attention
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/provider/bookings')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              View Requests
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => router.push('/provider/bookings')}
                className="text-gtbank-primary hover:text-gtbank-secondary text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{booking.service}</div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {booking.date}
                    </div>
                    <div className="font-medium text-gray-900">
                      ₦{booking.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
              <button
                onClick={() => router.push('/provider/reviews')}
                className="text-gtbank-primary hover:text-gtbank-secondary text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{review.customerName}</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">{review.date}</div>
                    {!review.responded && (
                      <button className="text-gtbank-primary hover:text-gtbank-secondary font-medium">
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 mt-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">Revenue Trend</div>
              <div className="h-32 bg-gradient-to-t from-gtbank-bg-gray to-gtbank-soft-blue rounded-lg flex items-end justify-between p-4">
                <div className="w-8 bg-gtbank-primary rounded-t" style={{ height: '40%' }} />
                <div className="w-8 bg-gtbank-primary rounded-t" style={{ height: '60%' }} />
                <div className="w-8 bg-gtbank-primary rounded-t" style={{ height: '45%' }} />
                <div className="w-8 bg-gtbank-primary rounded-t" style={{ height: '80%' }} />
                <div className="w-8 bg-gtbank-primary rounded-t" style={{ height: '70%' }} />
                <div className="w-8 bg-gtbank-primary rounded-t" style={{ height: '90%' }} />
                <div className="w-8 bg-gtbank-primary rounded-t" style={{ height: '100%' }} />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Booking Trend</div>
              <div className="h-32 bg-gradient-to-t from-blue-100 to-blue-50 rounded-lg flex items-end justify-between p-4">
                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '30%' }} />
                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '50%' }} />
                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '40%' }} />
                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '70%' }} />
                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '60%' }} />
                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '85%' }} />
                <div className="w-8 bg-blue-600 rounded-t" style={{ height: '75%' }} />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Rating Trend</div>
              <div className="h-32 bg-gradient-to-t from-green-100 to-green-50 rounded-lg flex items-end justify-between p-4">
                <div className="w-8 bg-green-600 rounded-t" style={{ height: '80%' }} />
                <div className="w-8 bg-green-600 rounded-t" style={{ height: '85%' }} />
                <div className="w-8 bg-green-600 rounded-t" style={{ height: '82%' }} />
                <div className="w-8 bg-green-600 rounded-t" style={{ height: '88%' }} />
                <div className="w-8 bg-green-600 rounded-t" style={{ height: '90%' }} />
                <div className="w-8 bg-green-600 rounded-t" style={{ height: '92%' }} />
                <div className="w-8 bg-green-600 rounded-t" style={{ height: '95%' }} />
              </div>
            </div>
          </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
