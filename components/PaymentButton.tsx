import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import PaymentForm from './PaymentForm';

interface PaymentButtonProps {
  bookingId: string | number;
  totalAmount: number;
  eventType: string;
  bookingDate: string;
  guestCount: number;
  startTime: string;
  endTime: string;
  customerEmail?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function PaymentButton({
  bookingId,
  totalAmount,
  eventType,
  bookingDate,
  guestCount,
  startTime,
  endTime,
  customerEmail,
  className = '',
  disabled = false,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const totalInPounds = (totalAmount / 100).toFixed(2);

  if (showPaymentForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <button
            onClick={() => setShowPaymentForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <PaymentForm
          bookingId={bookingId}
          totalAmount={totalAmount}
          eventType={eventType}
          bookingDate={bookingDate}
          guestCount={guestCount}
          startTime={startTime}
          endTime={endTime}
          customerEmail={customerEmail}
          onSuccess={onSuccess}
          onError={onError}
        />
      </div>
    );
  }

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

      {/* Payment Button */}
      <button
        onClick={() => setShowPaymentForm(true)}
        disabled={disabled || !bookingId}
        className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <CreditCard className="w-4 h-4" />
        Pay £{totalInPounds}
      </button>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <CheckCircle className="w-3 h-3" />
        <span>Secure payment powered by Stripe</span>
      </div>
    </div>
  );
}
