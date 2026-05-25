import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Home, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccess() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('PaymentSuccess page loaded');
    console.log('Current query params:', router.query);
    console.log('Current URL:', window.location.href);
    
    // Extract booking ID from URL parameters or session storage
    const { session_id } = router.query;
    
    if (session_id) {
      // In a real app, you'd verify the session with your backend
      // and retrieve the booking details
      console.log('Payment successful for session:', session_id);
      
      // You could also get booking ID from session storage if you stored it before payment
      const storedBookingId = sessionStorage.getItem('pendingBookingId');
      if (storedBookingId) {
        setBookingId(storedBookingId);
        sessionStorage.removeItem('pendingBookingId');
      }
    }
    
    setLoading(false);
  }, [router.query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your booking has been confirmed and payment processed successfully.
          </p>
        </div>

        {/* Booking Details */}
        {bookingId && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="font-semibold text-blue-900">{bookingId}</p>
              </div>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You'll receive a confirmation email shortly</li>
            <li>• Your booking details are available in your dashboard</li>
            <li>• You can manage your booking anytime</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <Link
            href="/admin/bookings"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            View Bookings
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
