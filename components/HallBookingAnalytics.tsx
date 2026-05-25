import React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface HallBookingAnalyticsProps {
  bookings: any[];
}

export default function HallBookingAnalytics({ bookings }: HallBookingAnalyticsProps) {
  // Calculate analytics data
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_price, 0);
  const totalDeposits = bookings.reduce((sum, booking) => sum + booking.deposit_required, 0);
  const averageGuests = bookings.length > 0 ? bookings.reduce((sum, booking) => sum + booking.guest_count, 0) / bookings.length : 0;
  
  // Monthly data for chart
  const monthlyData = bookings.reduce((acc, booking) => {
    const month = new Date(booking.booking_date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { revenue: 0, bookings: 0 };
    }
    acc[month].revenue += booking.total_price;
    acc[month].bookings += 1;
    return acc;
  }, {} as Record<string, { revenue: number; bookings: number }>);

  const chartCategories = Object.keys(monthlyData);
  const revenueData = chartCategories.map(month => monthlyData[month].revenue);
  const bookingData: number[] = chartCategories.map(month => monthlyData[month].bookings);

  // Event type distribution
  const eventTypeData = bookings.reduce((acc, booking) => {
    acc[booking.event_type] = (acc[booking.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">+12% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">+8% from last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Guests</p>
              <p className="text-2xl font-bold text-gray-900">{averageGuests.toFixed(0)}</p>
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">${totalDeposits.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-600">collected</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Chart
              options={{
                chart: {
                  type: 'line',
                  height: 250,
                  toolbar: { show: false },
                },
                stroke: {
                  curve: 'smooth',
                  width: 2,
                },
                colors: ['#4F46E5'],
                xaxis: {
                  categories: chartCategories,
                  labels: {
                    style: {
                      colors: '#6B7280',
                      fontSize: '12px',
                    }
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      colors: '#6B7280',
                      fontSize: '12px',
                    }
                  }
                },
                grid: {
                  borderColor: '#F3F4F6',
                  strokeDashArray: 4,
                },
                tooltip: {
                  y: {
                    formatter: function (val) {
                      return '$' + val.toLocaleString();
                    }
                  }
                }
              }}
              series={[{
                name: 'Revenue',
                data: revenueData
              }]}
              type="line"
              height="100%"
            />
          </div>
        </div>

        {/* Booking Volume */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Volume</h3>
          <div className="h-64">
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  height: 250,
                  toolbar: { show: false },
                },
                plotOptions: {
                  bar: {
                    borderRadius: 4,
                    columnWidth: '60%',
                  }
                },
                colors: ['#10B981'],
                xaxis: {
                  categories: chartCategories,
                  labels: {
                    style: {
                      colors: '#6B7280',
                      fontSize: '12px',
                    }
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      colors: '#6B7280',
                      fontSize: '12px',
                    }
                  }
                },
                grid: {
                  borderColor: '#F3F4F6',
                  strokeDashArray: 4,
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
                data: bookingData
              }]}
              type="bar"
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* Event Type Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(eventTypeData).map(([eventType, count]: [string, number]) => (
            <div key={eventType} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{count}</div>
              <div className="text-sm text-gray-600 mt-1">{eventType}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
