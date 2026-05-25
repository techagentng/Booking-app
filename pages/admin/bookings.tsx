import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useAdminBookings, useUpdateBookingStatus, useDeleteBooking } from '../../hooks/useAdminBookings';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
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
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart
} from 'lucide-react';
import dynamic from 'next/dynamic';
import BookingDetailsModal from '@/components/admin/BookingDetailsModal';
import StatusUpdateModal from '@/components/admin/StatusUpdateModal';
import BookingListTable from '@/components/admin/BookingListTable';
import MultiSelectFilter from '@/components/admin/MultiSelectFilter';
import HallBookingCalendar from '@/components/HallBookingCalendar';
import HallBookingModal from '@/components/HallBookingModal';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AdminBookingManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // React Query hooks
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings
  } = useAdminBookings();

  const updateStatusMutation = useUpdateBookingStatus(() => {
    setShowStatusModal(false);
    setSelectedBookingId(null);
  });
  const deleteBookingMutation = useDeleteBooking();

  // Extract data from React Query results
  const bookings = bookingsData?.data || [];
  const pagination = bookingsData?.meta;
  const loading = bookingsLoading;
  const displayError = localError || bookingsError?.message;

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Handle search and filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter.length > 0) params.status = statusFilter;
      if (dateRange.from) params.dateFrom = dateRange.from;
      if (dateRange.to) params.dateTo = dateRange.to;
      
      // React Query will automatically refetch when the query key changes
      refetchBookings();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, dateRange, refetchBookings]);

  const handleViewDetails = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (status: string, notes?: string) => {
    if (!selectedBookingId) return;
    
    // Use mutate instead of mutateAsync to let React Query handle errors
    updateStatusMutation.mutate({
      id: selectedBookingId,
      status,
      notes
    });
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await deleteBookingMutation.mutateAsync(bookingId);
    } catch (error) {
      console.error('Failed to delete booking:', error);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  const handleRefresh = () => {
    refetchBookings();
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

  if (loading && bookings.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gtbank-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <Header title="Admin Booking Management" showNotifications={true} showUserMenu={true} />
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-gtbank-primary text-gtbank-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings List
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar'
                  ? 'border-gtbank-primary text-gtbank-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Calendar View
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Header for List Tab */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Booking Management</h1>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewBookingModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gtbank-primary text-white rounded-lg hover:bg-gtbank-light-orange transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Booking
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{displayError}</span>
                  </div>
                  <button
                    onClick={() => setLocalError(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent text-gray-900 placeholder-gray-700"
                  />
                </div>
                
                <div className="flex gap-3">
                  <MultiSelectFilter
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'confirmed', label: 'Confirmed' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ]}
                    selectedValues={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Filter by status"
                  />
                  
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent text-gray-900"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gtbank-primary focus:border-transparent text-gray-900"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filter Summary */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Active filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-gtbank-bg-gray text-gtbank-secondary rounded-full text-xs">
                      Search: {searchTerm}
                    </span>
                  )}
                  {statusFilter.length > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Status: {statusFilter.join(', ')}
                    </span>
                  )}
                  {dateRange.from && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      From: {dateRange.from}
                    </span>
                  )}
                  {dateRange.to && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      To: {dateRange.to}
                    </span>
                  )}
                  {!searchTerm && statusFilter.length === 0 && !dateRange.from && !dateRange.to && (
                    <span className="text-gray-400">No filters applied</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter([]);
                    setDateRange({ from: '', to: '' });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <BookingListTable
              bookings={bookings}
              loading={loading}
              onViewDetails={handleViewDetails}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteBooking}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Header for Calendar Tab */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
                <p className="text-gray-700 mt-2">Visual overview of hall bookings and availability</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Admin Calendar - Showing {bookings.length} bookings</p>
              </div>
              
              {/* Simple Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Generate calendar days for current month */}
                {Array.from({ length: 35 }, (_, i) => {
                  const now = new Date();
                  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  const startDay = startOfMonth.getDay();
                  
                  const date = new Date(startOfMonth);
                  date.setDate(startOfMonth.getDate() - startDay + i);
                  
                  const dateStr = date.toISOString().split('T')[0];
                  const isCurrentMonth = date.getMonth() === now.getMonth();
                  
                  // Find bookings for this date
                  const dayBookings = bookings.filter(booking => 
                    booking.booking_date === dateStr
                  );
                  
                  const hasBooking = dayBookings.length > 0;
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = date < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <div
                      key={i}
                      className={`
                        p-2 text-xs border rounded transition-colors relative
                        ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'text-gray-900'}
                        ${isToday ? 'bg-blue-100 border-blue-300 font-bold' : 'border-gray-200'}
                        ${hasBooking ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100' : 'hover:bg-gray-50'}
                        ${isPast && !isToday ? 'opacity-50' : ''}
                        cursor-pointer
                      `}
                      onClick={() => {
                        console.log('🗓️ Calendar clicked:', {
                          dateStr,
                          dayBookings,
                          hasBooking,
                          isToday,
                          isPast
                        });
                        setSelectedDate(date);
                      }}
                      title={`${dateStr} ${hasBooking ? `(${dayBookings.length} bookings)` : 'No bookings'}`}
                    >
                      <div className="font-medium">{date.getDate()}</div>
                      {hasBooking && (
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto"></div>
                          <div className="text-xs text-gray-600">{dayBookings.length}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span>Has Bookings</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showDetailsModal && selectedBookingId && (
          <BookingDetailsModal
            booking={bookings.find(b => b.id === selectedBookingId)!}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedBookingId(null);
            }}
            onStatusUpdate={() => handleStatusUpdate(selectedBookingId)}
          />
        )}

        {showStatusModal && selectedBookingId && (
          <StatusUpdateModal
            bookingId={selectedBookingId}
            isOpen={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedBookingId(null);
            }}
            onUpdate={handleStatusChange}
            currentStatus={bookings.find(b => b.id === selectedBookingId)?.status}
            isUpdating={updateStatusMutation.isPending}
            updateError={updateStatusMutation.error?.message}
          />
        )}

        {showNewBookingModal && (
          <HallBookingModal
            selectedDate={selectedDate || new Date()} // Use current date as fallback
            onClose={() => {
              setShowNewBookingModal(false);
            }}
            onSubmit={async (formData) => {
              try {
                console.log('📝 Admin new booking submission:', formData);
                
                // Call the unified booking endpoint
                const response = await fetch('/api/v1/bookings', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    // Admin auth token will be automatically included by the browser
                  },
                  body: JSON.stringify(formData),
                });

                if (response.ok) {
                  const result = await response.json();
                  console.log('✅ Booking created successfully:', result.data);
                  
                  // Show success message
                  alert('Booking created successfully!');
                  setShowNewBookingModal(false);
                  refetchBookings(); // Refresh the booking list
                } else {
                  const errorData = await response.json();
                  alert('Failed to create booking: ' + (errorData.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Error creating booking: ' + error.message);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
