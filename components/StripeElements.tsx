import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SvCTtFKwV7b55XPeYtNbO7dS2gSi2yZ6orYN2Spbbn4p9JWFdHTAeIB1f5rzQtaqMXHFeH0ATqtC1d13ukzQVbs00qRGX75bK');

interface StripeElementsProps {
  clientSecret: string;
  billingDetails: {
    name: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  isLoading: boolean;
}

export default function StripeElements({
  clientSecret,
  billingDetails,
  onPaymentSuccess,
  onPaymentError,
  isLoading,
}: StripeElementsProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#4b5563',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  const handleCardChange = (event: any, fieldType: string) => {
    setCardErrors(prev => ({
      ...prev,
      [fieldType]: event.error ? event.error.message : '',
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('StripeElements: handleSubmit called', {
      hasStripe: !!stripe,
      hasElements: !!elements,
      clientSecret: clientSecret?.substring(0, 10) + '...',
    });

    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded');
      onPaymentError('Stripe has not loaded properly');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Confirming card payment with Stripe...');
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            phone: billingDetails.phone,
            address: {
              line1: billingDetails.address.line1,
              city: billingDetails.address.city,
              postal_code: billingDetails.address.postal_code,
              country: billingDetails.address.country,
            },
          },
        },
      });

      console.log('Stripe response:', { error, paymentIntent });

      if (error) {
        console.error('Payment error:', error);
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        console.log('Payment successful:', paymentIntent);
        console.log('About to call onPaymentSuccess callback');
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Unexpected payment error:', err);
      onPaymentError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="pl-10">
            <CardNumberElement
              options={cardElementOptions}
              onChange={(e) => handleCardChange(e, 'cardNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>
        {cardErrors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{cardErrors.cardNumber}</p>
        )}
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <CardExpiryElement
            options={cardElementOptions}
            onChange={(e) => handleCardChange(e, 'cardExpiry')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          {cardErrors.cardExpiry && (
            <p className="mt-1 text-sm text-red-600">{cardErrors.cardExpiry}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVC
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <CardCvcElement
              options={cardElementOptions}
              onChange={(e) => handleCardChange(e, 'cardCvc')}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          {cardErrors.cardCvc && (
            <p className="mt-1 text-sm text-red-600">{cardErrors.cardCvc}</p>
          )}
        </div>
      </div>

      {/* Payment Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing || isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pay Now
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Accepted Cards */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span>We accept:</span>
        <div className="flex gap-2">
          <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">VISA</div>
          <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">MC</div>
          <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">AMEX</div>
        </div>
      </div>
    </form>
  );
}

// Wrapper component with StripeProvider
export function StripePaymentWrapper(props: Omit<StripeElementsProps, 'onPaymentSuccess' | 'onPaymentError'>) {
  // Default handlers for payment success and error
  const handlePaymentSuccess = () => {
    console.log('Payment successful');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="stripe-payment-wrapper">
      <StripeElements 
        {...props} 
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
}
