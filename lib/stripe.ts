import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SvCTtFKwV7b55XPeYtNbO7dS2gSi2yZ6orYN2Spbbn4p9JWFdHTAeIB1f5rzQtaqMXHFeH0ATqtC1d13ukzQVbs00qRGX75bK');

export interface PaymentItem {
  name: string;
  description?: string;
  amount: number; // in cents
  quantity: number;
}

export interface CheckoutSessionData {
  items: PaymentItem[];
  customerEmail?: string;
  bookingId?: string;
  successUrl: string;
  cancelUrl: string;
}

export const createPaymentIntent = async (data: CheckoutSessionData) => {
  try {
    // Try Go backend first
    try {
      const response = await fetch('http://localhost:8080/api/v1/payments/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add JWT token
        },
        body: JSON.stringify({
          booking_id: data.bookingId,
        }),
      });

      if (response.ok) {
        const session = await response.json();
        return session;
      }
    } catch (backendError) {
      console.log('Go backend not available, using Next.js API fallback:', backendError);
    }

    // Fallback to Next.js API
    console.log('Using Next.js API fallback for payment intent');
    const response = await fetch('/api/v1/payments/payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking_id: data.bookingId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create payment intent');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmCardPayment = async (clientSecret: string, cardElement: any, billingDetails: any) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error confirming card payment:', error);
    throw error;
  }
};

export default stripePromise;
