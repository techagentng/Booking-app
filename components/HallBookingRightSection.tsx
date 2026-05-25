import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock, MapPin, Phone, Building, Settings, AlertTriangle, Wifi, WifiOff, X, Eye } from 'lucide-react';
import { useGetHallBookingActivity } from '../hooks/useHallBookingsActivity';
import { useHallBookingNotifications } from '../hooks/useHallBookingNotifications';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentButton from './PaymentButton';
import Link from 'next/link';

export default function HallBookingRightSection() {
  const { data: hallActivity, isLoading, refetch } = useGetHallBookingActivity();
  const { notifications: contextNotifications } = useNotifications();
  const { notifications: realtimeNotifications, isConnected, error } = useHallBookingNotifications();
  const { user } = useAuth();
  const [realtimeBookings, setRealtimeBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Update activity feed when new booking notification arrives - RE-ENABLED for real-time updates
  useEffect(() => {
    const newBookingNotifications = realtimeNotifications.filter(n => n.type === 'new_hall_booking');
    
    if (newBookingNotifications.length > 0) {
      // Add new booking to the top of the list
      const latestNotification = newBookingNotifications[0];
      const newBooking = {
        id: latestNotification.data.booking_id,
        booking_id: latestNotification.data.booking_id_str,
        organizer_name: latestNotification.data.organizer_name,
        organizer_email: latestNotification.data.organizer_email || '',
        organizer_phone: latestNotification.data.organizer_phone || '',
        event_type: latestNotification.data.event_type,
        guest_count: latestNotification.data.guest_count,
        booking_date: latestNotification.data.booking_date,
        start_time: latestNotification.data.start_time || '14:00',
        end_time: latestNotification.data.end_time || '18:00',
        special_requests: '',
        total_price: latestNotification.data.total_price,
        deposit_required: 0,
        status: 'pending',
        created_by_type: latestNotification.data.created_by_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setRealtimeBookings(prev => [newBooking, ...prev].slice(0, 10));
      
      // Re-enabled refetch for fresh data
      refetch();
    }
  }, [realtimeNotifications, refetch]);

  // Auto-refresh when context notification arrives - RE-ENABLED
  useEffect(() => {
    const latestNotification = contextNotifications[0];
    if (
      latestNotification?.type === 'new_hall_booking' ||
      latestNotification?.type === 'booking_status_update' ||
      latestNotification?.type === 'check_in' ||
      latestNotification?.type === 'check_out'
    ) {
      refetch();
    }
  }, [contextNotifications, refetch]);

  // Combine API data with real-time updates
  const apiBookings = hallActivity?.recent_bookings || [];
  const allBookings = [...realtimeBookings, ...apiBookings];
  const uniqueBookings = allBookings.filter((booking, index, self) => 
    index === self.findIndex(b => b.id === booking.id)
  ).slice(0, 5);

  const recentBookings = uniqueBookings;

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Newest Hall Bookings */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold">🔴 Newest Hall Bookings</h2>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Offline
              </>
            )}
          </div>
        </div>
        {recentBookings.length > 0 ? (
          recentBookings.slice(0, 5).map((booking) => (
            <HallBookingCard 
              key={booking.id} 
              booking={booking} 
              onClick={() => {
                setSelectedBooking(booking);
                setShowDetailsModal(true);
              }}
            />
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent hall bookings</p>
          </div>
        )}
      </section>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getEventTypeIcon(selectedBooking.event_type)}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Booking Details</h2>
                  <p className="text-indigo-100 text-sm">{selectedBooking.event_type}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-indigo-500 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Organizer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedBooking.organizer_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedBooking.organizer_email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedBooking.organizer_phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium">{selectedBooking.booking_id}</span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Event Type:</span>
                    <span className="font-medium">{selectedBooking.event_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(selectedBooking.booking_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTime(selectedBooking.start_time)} → {formatTime(selectedBooking.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Guest Count:</span>
                    <span className="font-medium">{selectedBooking.guest_count} guests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created By:</span>
                    <span className="font-medium capitalize">{selectedBooking.created_by_type || 'system'}</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Price:</span>
                    <span className="font-bold text-lg text-green-600">
                      £{selectedBooking.total_price?.toLocaleString() || '0'}
                    </span>
                  </div>
                  {selectedBooking.deposit_required && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Deposit Required:</span>
                      <span className="font-medium">
                        £{selectedBooking.deposit_required?.toLocaleString() || '0'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedBooking.special_requests}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(selectedBooking.created_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedBooking.updated_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 space-y-3">
              {/* Payment Section - Only show for pending bookings */}
              {selectedBooking.status === 'pending' && selectedBooking.total_price && (
                <div className="border-t pt-4">
                  <PaymentButton
                    bookingId={selectedBooking.id}
                    totalAmount={selectedBooking.total_price * 100} // Convert to pence
                    eventType={selectedBooking.event_type}
                    bookingDate={selectedBooking.booking_date}
                    guestCount={selectedBooking.guest_count}
                    startTime={selectedBooking.start_time}
                    endTime={selectedBooking.end_time}
                    customerEmail={user?.email || selectedBooking.organizer_email}
                    onSuccess={() => {
                      console.log('Payment initiated successfully');
                    }}
                    onError={(error) => {
                      console.error('Payment error:', error);
                    }}
                  />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Navigate to admin booking details
                    window.open(`/admin/bookings?booking=${selectedBooking.id}`, '_blank');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for the modal
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getEventTypeIcon(eventType: string) {
  switch (eventType.toLowerCase()) {
    case 'wedding':
      return '💒';
    case 'party':
      return '🎉';
    case 'corporate':
      return '💼';
    case 'funeral':
      return '🕊️';
    case 'conference':
      return '📊';
    default:
      return '📅';
  }
}

function HallBookingCard({ booking, onClick }: { booking: any; onClick?: () => void }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'wedding':
        return '💒';
      case 'party':
        return '🎉';
      case 'corporate':
        return '💼';
      case 'funeral':
        return '🕊️';
      case 'conference':
        return '📊';
      default:
        return '📅';
    }
  };

  // Check if this is a real-time booking (created in last 30 seconds)
  const isRealtime = (Date.now() - new Date(booking.created_at).getTime()) < 30000;
  const isNewBooking = (Date.now() - new Date(booking.created_at).getTime()) < 60000;

  return (
    <div 
      className={`p-3 rounded-lg mb-3 border-l-4 cursor-pointer transition-all hover:shadow-md ${
        isRealtime 
          ? 'bg-green-50 border-green-500 animate-pulse' 
          : 'bg-gray-50 border-indigo-500 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getEventTypeIcon(booking.event_type)}</span>
            <p className="font-semibold text-gray-900 text-sm">{booking.event_type}</p>
            {isRealtime && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                NEW
              </span>
            )}
            <Eye className="w-3 h-3 text-gray-400 ml-auto" />
          </div>
          <p className="font-medium text-gray-900">{booking.organizer_name}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(booking.booking_date)}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(booking.start_time)} → {formatTime(booking.end_time)}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {booking.guest_count} guests
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {booking.organizer_phone}
          </p>
          {booking.special_requests && (
            <p className="text-xs text-gray-500 mt-1 italic">
              "{booking.special_requests.substring(0, 50)}{booking.special_requests.length > 50 ? '...' : ''}"
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
          <p className="text-sm font-semibold text-green-600 mt-2">
            £{booking.total_price?.toLocaleString() || '0'}
          </p>
          {booking.created_by_type && (
            <p className="text-xs text-gray-500 mt-1">
              {booking.created_by_type === 'admin' ? 'Admin' : 'Public'}
            </p>
          )}
          {isNewBooking && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              Just now
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
