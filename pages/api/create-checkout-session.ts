import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      organizerName,
      organizerEmail,
      eventType,
      bookingDate,
      startTime,
      endTime,
      totalPrice,
      depositRequired,
    } = req.body;

    // In a real application, you would initialize Stripe with your secret key
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // For demo purposes, we'll create a mock checkout session
    const mockSession = {
      id: `cs_test_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}`,
      customer_email: organizerEmail,
      metadata: {
        organizerName,
        eventType,
        bookingDate,
        startTime,
        endTime,
        totalPrice: totalPrice.toString(),
        depositRequired: depositRequired.toString(),
      },
    };

    /*
    // Real Stripe implementation would look like this:
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Hall Booking - ${eventType}`,
              description: `${bookingDate} from ${startTime} to ${endTime}`,
            },
            unit_amount: totalPrice * 100, // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/booking/cancel`,
      customer_email: organizerEmail,
      metadata: {
        organizerName,
        eventType,
        bookingDate,
        startTime,
        endTime,
        totalPrice: totalPrice.toString(),
        depositRequired: depositRequired.toString(),
      },
    });
    */

    res.status(200).json(mockSession);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
