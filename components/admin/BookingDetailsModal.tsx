import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, DollarSign, Mail, Phone, Edit, History } from 'lucide-react';
import { AdminBookingResponse, BookingStatusHistory } from '../../services/adminBookingService';
import { useAdminBookingStore } from '../../store/adminBookingStore';

interface BookingDetailsModalProps {
  booking: AdminBookingResponse;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusUpdate
}: BookingDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const { bookingHistory, fetchBookingHistory } = useAdminBookingStore();

  useEffect(() => {
    if (isOpen && booking) {
      fetchBookingHistory(booking.id);
    }
  }, [isOpen, booking?.id, fetchBookingHistory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Booking Details</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-indigo-500 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Booking Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Status History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Booking ID: #{booking.id}</p>
                </div>
                <button
                  onClick={onStatusUpdate}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Update Status
                </button>
              </div>

              {/* Organizer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Organizer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Email:</span>
                      <span className="text-sm text-gray-900">{booking.organizer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Phone:</span>
                      <span className="text-sm text-gray-900">{booking.organizer_phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Event Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-700">Event Type:</span>
                      <p className="text-sm text-gray-900 font-medium">{booking.event_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-700">Guest Count:</span>
                      <p className="text-sm text-gray-900 font-medium">{booking.guest_count} guests</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-700">Payment Method:</span>
                      <p className="text-sm text-gray-900 font-medium capitalize">{booking.payment_method}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-700">Date:</span>
                    <p className="text-sm text-gray-900 font-medium">{formatDate(booking.booking_date)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Time:</span>
                    <p className="text-sm text-gray-900 font-medium">{booking.start_time} - {booking.end_time}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-700">Total Price:</span>
                    <p className="text-lg font-bold text-gray-900">${booking.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Deposit Required:</span>
                    <p className="text-lg font-bold text-orange-600">${booking.deposit_required.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Payment Method:</span>
                    <p className="text-sm text-gray-900 font-medium capitalize">{booking.payment_method}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.special_requests && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Special Requests</h3>
                  <p className="text-gray-700">{booking.special_requests}</p>
                </div>
              )}

              {/* Admin Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Admin Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="text-gray-900">{formatDateTime(booking.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <p className="text-gray-900">{formatDateTime(booking.updated_at)}</p>
                  </div>
                  {booking.confirmed_by && (
                    <div>
                      <span className="text-gray-600">Confirmed By:</span>
                      <p className="text-gray-900">{booking.confirmed_by}</p>
                    </div>
                  )}
                  {booking.cancelled_by && (
                    <div>
                      <span className="text-gray-600">Cancelled By:</span>
                      <p className="text-gray-900">{booking.cancelled_by}</p>
                    </div>
                  )}
                  {booking.updated_by && (
                    <div>
                      <span className="text-gray-600">Updated By:</span>
                      <p className="text-gray-900">{booking.updated_by}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Status Change History
              </h3>
              
              {bookingHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No status changes recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingHistory.map((history, index) => (
                    <div key={history.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(history.new_status)}`}>
                            {history.new_status}
                          </span>
                          <span className="text-sm text-gray-500">
                            from {history.old_status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(history.changed_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Changed by: <span className="font-medium">{history.changed_by_user.fullname}</span></p>
                        {history.notes && (
                          <p className="mt-1">Notes: {history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
