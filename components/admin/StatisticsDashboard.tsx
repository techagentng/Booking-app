import React from 'react';
import { BookingStats } from '../../services/adminBookingService';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  BarChart3
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StatisticsDashboardProps {
  statistics: BookingStats | null;
  loading: boolean;
}

export default function StatisticsDashboard({ statistics, loading }: StatisticsDashboardProps) {
  // Helper function to format month dates
  const formatMonthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading && !statistics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse h-64"></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse h-64"></div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No statistics available</p>
      </div>
    );
  }

  const chartCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = [12000, 19000, 15000, 25000, 22000, 30000];
  const bookingData = [30, 40, 45, 50, 49, 60];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total_bookings || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">Real-time data</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">£{statistics.total_revenue ? statistics.total_revenue.toLocaleString() : '0'}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">Real-time data</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Avg. Guests</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.average_guests ? Math.round(statistics.average_guests) : 'N/A'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-600">per event</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.occupancy_rate ? `${Math.round(statistics.occupancy_rate)}%` : 'N/A'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">Real-time data</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending_bookings}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{statistics.confirmed_bookings}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.completed_bookings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{statistics.cancelled_bookings}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-64">
            {statistics.monthly_revenue && statistics.monthly_revenue.length > 0 ? (
              <Chart
                options={{
                  chart: {
                    type: 'bar',
                    height: 250,
                    toolbar: { show: false }
                  },
                  plotOptions: {
                    bar: {
                      borderRadius: 8,
                      columnWidth: '60%',
                    }
                  },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: statistics.monthly_revenue.map(item => formatMonthDate(item.month)),
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                  },
                  yaxis: {
                    labels: {
                      formatter: function (val) {
                        return '£' + val.toLocaleString();
                      }
                    }
                  },
                  tooltip: {
                    y: {
                      formatter: function (val) {
                        return '£' + val.toLocaleString();
                      }
                    }
                  }
                }}
                series={[{
                  name: 'Revenue',
                  data: statistics.monthly_revenue.map(item => item.revenue)
                }]}
                type="bar"
                height="100%"
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Volume */}
        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Volume</h3>
          <div className="h-64">
            {statistics.monthly_bookings && statistics.monthly_bookings.length > 0 ? (
              <Chart
                options={{
                  chart: {
                    type: 'line',
                    height: 250,
                    toolbar: { show: false }
                  },
                  stroke: {
                    curve: 'smooth',
                    width: 3
                  },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: statistics.monthly_bookings.map(item => formatMonthDate(item.month)),
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                  },
                  yaxis: {
                    labels: {
                      formatter: function (val) {
                        return val.toString();
                      }
                    }
                  },
                  tooltip: {
                    y: {
                      formatter: function (val) {
                        return val + ' bookings';
                      }
                    }
                  }
                }}
                series={[{
                  name: 'Bookings',
                  data: statistics.monthly_bookings.map(item => item.bookings)
                }]}
                type="line"
                height="100%"
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No booking volume data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Event Types - COMMENTED OUT */}
      {/* <div className="p-6 rounded-xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Event Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistics?.popular_event_types?.map((eventType, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-gray-200/50">
              <div>
                <p className="font-medium text-gray-900">{eventType.event_type}</p>
                <p className="text-sm text-gray-500">{eventType.count} bookings</p>
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {eventType.count}
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
