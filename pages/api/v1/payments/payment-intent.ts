import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { booking_id } = req.body;

    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // For demo purposes, create a mock payment intent
    // In production, this would call your Go backend
    const mockPaymentIntent = {
      id: `pi_test_${Date.now()}`,
      client_secret: `pi_test_${Date.now()}_secret_${Date.now()}`,
      amount: 17700, // £177 in pence
      currency: 'gbp',
      status: 'requires_payment_method',
      metadata: {
        booking_id: booking_id.toString(),
      },
    };

    console.log('Mock payment intent created:', mockPaymentIntent);

    res.status(200).json(mockPaymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
