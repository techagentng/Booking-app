import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface HallBooking {
  id: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  event_type: string;
  guest_count: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  deposit_required: number;
  payment_method: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export default function HallBookingManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<HallBooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data - replace with actual API call
  const [bookings, setBookings] = useState<HallBooking[]>([
    {
      id: '1',
      organizer_name: 'John Smith',
      organizer_email: 'john@example.com',
      organizer_phone: '+1234567890',
      event_type: 'Wedding Reception',
      guest_count: 120,
      booking_date: '2026-02-15',
      start_time: '18:00',
      end_time: '23:00',
      total_price: 2500,
      deposit_required: 500,
      payment_method: 'onsite',
      status: 'confirmed',
      special_requests: 'Vegetarian meal options required',
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-01-15T10:30:00Z'
    },
    {
      id: '2',
      organizer_name: 'Sarah Johnson',
      organizer_email: 'sarah@example.com',
      organizer_phone: '+1234567891',
      event_type: 'Corporate Meeting',
      guest_count: 45,
      booking_date: '2026-02-20',
      start_time: '09:00',
      end_time: '17:00',
      total_price: 1200,
      deposit_required: 200,
      payment_method: 'online',
      status: 'pending',
      created_at: '2026-01-16T14:00:00Z',
      updated_at: '2026-01-16T14:00:00Z'
    },
    {
      id: '3',
      organizer_name: 'Michael Brown',
      organizer_email: 'michael@example.com',
      organizer_phone: '+1234567892',
      event_type: 'Birthday Party',
      guest_count: 30,
      booking_date: '2026-01-28',
      start_time: '19:00',
      end_time: '23:00',
      total_price: 800,
      deposit_required: 150,
      payment_method: 'cash',
      status: 'completed',
      created_at: '2026-01-10T09:00:00Z',
      updated_at: '2026-01-28T23:30:00Z'
    }
  ]);

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.organizer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.total_price, 0),
    totalDeposits: bookings.reduce((sum, b) => sum + b.deposit_required, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (booking: HallBooking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus as any } : booking
    ));
  };

  const handleDelete = (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <Header title="Hall Booking Management" />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gtbank-bg-gray rounded-lg">
                <Calendar className="w-6 h-6 text-gtbank-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Overview</h2>
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
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
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
                      return '£' + val.toLocaleString();
                    }
                  }
                }
              }}
              series={[{
                name: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000]
              }]}
              type="line"
              height="100%"
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.organizer_name}</p>
                        <p className="text-sm text-gray-500">{booking.organizer_email}</p>
                        <p className="text-sm text-gray-500">{booking.organizer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking.event_type}</p>
                      <p className="text-sm text-gray-500">{booking.payment_method}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{booking.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{booking.guest_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">£{booking.total_price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Deposit: £{booking.deposit_required}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="p-1 text-gray-400 hover:text-gtbank-primary transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
          </div>
        </div>

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-gtbank-secondary to-gtbank-navy px-6 py-4">
                <h2 className="text-xl font-bold text-white">Booking Details</h2>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Organizer Information</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Name:</span> {selectedBooking.organizer_name}</p>
                      <p><span className="text-gray-600">Email:</span> {selectedBooking.organizer_email}</p>
                      <p><span className="text-gray-600">Phone:</span> {selectedBooking.organizer_phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Type:</span> {selectedBooking.event_type}</p>
                      <p><span className="text-gray-600">Guests:</span> {selectedBooking.guest_count}</p>
                      <p><span className="text-gray-600">Payment:</span> {selectedBooking.payment_method}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Date:</span> {selectedBooking.booking_date}</p>
                      <p><span className="text-gray-600">Time:</span> {selectedBooking.start_time} - {selectedBooking.end_time}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Total:</span> £{selectedBooking.total_price.toLocaleString()}</p>
                      <p><span className="text-gray-600">Deposit:</span> £{selectedBooking.deposit_required}</p>
                    </div>
                  </div>
                </div>
                
                {selectedBooking.special_requests && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Special Requests</h3>
                    <p className="text-gray-600">{selectedBooking.special_requests}</p>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                <div className="flex gap-2">
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => {
                      handleStatusUpdate(selectedBooking.id, e.target.value);
                      setSelectedBooking({ ...selectedBooking, status: e.target.value as any });
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gtbank-primary focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gtbank-primary text-white rounded-lg hover:bg-gtbank-light-orange transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
