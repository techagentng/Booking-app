import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { createPaymentIntent, confirmCardPayment } from '../lib/stripe';
import StripeElements from './StripeElements';
import DatePicker from './DatePicker';

interface PaymentFormProps {
  bookingId: string | number;
  totalAmount: number;
  eventType: string;
  bookingDate: string;
  guestCount: number;
  startTime: string;
  endTime: string;
  customerEmail?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function PaymentForm({
  bookingId,
  totalAmount,
  eventType,
  bookingDate,
  guestCount,
  startTime,
  endTime,
  customerEmail,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: customerEmail || '',
    phone: '',
    dateOfBirth: '',
    address: {
      line1: '',
      city: '',
      postal_code: '',
      country: 'GB',
    },
  });

  const totalInPounds = (totalAmount / 100).toFixed(2);

  const initializePayment = async () => {
    if (!bookingId) {
      setError('No booking ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const paymentIntent = await createPaymentIntent({
        items: [], // Backend will create items from booking data
        customerEmail: billingDetails.email,
        bookingId: bookingId.toString(),
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      });

      setClientSecret(paymentIntent.client_secret);
      setShowCardForm(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!clientSecret) {
      setError('Payment not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, you would use Stripe Elements here
      // For now, we'll simulate the payment
      console.log('Processing payment with client secret:', clientSecret);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      console.log('Payment successful!');
      onSuccess?.();
      
      // Debug: Check current URL before redirect
      console.log('Current URL before redirect:', window.location.href);
      console.log('About to redirect to /payment/success');
      
      // Redirect to success page
      window.location.href = '/payment/success';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (!showCardForm) {
    return (
      <div className="space-y-4">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-black">
                {eventType} - {bookingDate}
              </span>
              <span className="font-medium text-black">
                £{totalInPounds}
              </span>
            </div>
            <div className="flex justify-between text-sm text-black">
              <span>{guestCount} guests</span>
              <span>{startTime} - {endTime}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span className="text-black">Total</span>
              <span className="text-blue-600">£{totalInPounds}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Initialize Payment Button */}
        <button
          onClick={initializePayment}
          disabled={isLoading || !bookingId}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Pay £{totalInPounds}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle className="w-3 h-3" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      {/* Billing Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Billing Information</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              required
              value={billingDetails.name}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              required
              value={billingDetails.email}
              onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                required
                value={billingDetails.phone}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="+44 20 1234 5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date of Birth
              </label>
              <DatePicker
                value={billingDetails.dateOfBirth}
                onChange={(date) => setBillingDetails(prev => ({ ...prev, dateOfBirth: date }))}
                placeholder="DD/MM/YYYY"
                maxDate={new Date()}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Billing Address
            </label>
            <input
              type="text"
              required
              value={billingDetails.address.line1}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, line1: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="123 High Street"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={billingDetails.address.city}
                onChange={(e) => setBillingDetails(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="London"
              />
              <input
                type="text"
                required
                value={billingDetails.address.postal_code}
                onChange={(e) => setBillingDetails(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, postal_code: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="SW1A 1AA"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Card Information</h4>
        
        <StripeElements
          clientSecret={clientSecret}
          billingDetails={billingDetails}
          onPaymentSuccess={() => {
            console.log('PaymentForm: Payment success callback triggered!');
            onSuccess?.();
            console.log('PaymentForm: About to redirect to /payment/success');
            console.log('Current URL before redirect:', window.location.href);
            // Redirect to success page
            window.location.href = '/payment/success';
          }}
          onPaymentError={(error) => {
            console.log('PaymentForm: Payment error callback triggered:', error);
            setError(error);
            onError?.(new Error(error));
          }}
          isLoading={isLoading}
        />
      </div>
    </form>
  );
}
