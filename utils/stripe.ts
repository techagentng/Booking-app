import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// In production, you should get this from environment variables
const stripePromise = loadStripe('pk_test_51234567890abcdef'); // Replace with your actual Stripe publishable key

export interface CheckoutSessionData {
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  eventType: string;
  guestCount: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  specialRequests: string;
  totalPrice: number;
  depositRequired: number;
}

export const createCheckoutSession = async (data: CheckoutSessionData): Promise<string> => {
  try {
    // In a real application, this would call your backend API
    // For now, we'll simulate the checkout session creation
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        // Convert to pence/cents for Stripe
        amount: data.totalPrice * 100,
        currency: 'gbp',
        payment_method_types: ['card'],
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    return session.id;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToStripeCheckout = async (sessionId: string) => {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  try {
    // Use type assertion to access the redirectToCheckout method
    const stripeWithCheckout = stripe as any;
    await stripeWithCheckout.redirectToCheckout({
      sessionId,
    });
  } catch (error) {
    throw error;
  }
};

export const simulateStripeCheckout = async (data: CheckoutSessionData) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a mock session ID
  return 'cs_test_mock_session_id_' + Date.now();
};

export default stripePromise;
