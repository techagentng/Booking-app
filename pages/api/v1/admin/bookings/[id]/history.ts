import { NextApiRequest, NextApiResponse } from 'next';

// Mock booking history data
const mockBookingHistory: Record<number, any[]> = {
  1: [
    {
      id: 1,
      booking_id: 1,
      old_status: null,
      new_status: 'pending',
      changed_by: 1,
      changed_at: '2024-01-15T10:30:00Z',
      notes: 'Initial booking created',
      changed_by_user: {
        id: 1,
        fullname: 'Admin User',
        email: 'admin@example.com'
      }
    }
  ],
  2: [
    {
      id: 2,
      booking_id: 2,
      old_status: null,
      new_status: 'pending',
      changed_by: 1,
      changed_at: '2024-01-16T08:00:00Z',
      notes: 'Initial booking created',
      changed_by_user: {
        id: 1,
        fullname: 'Admin User',
        email: 'admin@example.com'
      }
    },
    {
      id: 3,
      booking_id: 2,
      old_status: 'pending',
      new_status: 'confirmed',
      changed_by: 1,
      changed_at: '2024-01-16T09:15:00Z',
      notes: 'Deposit received, booking confirmed',
      changed_by_user: {
        id: 1,
        fullname: 'Admin User',
        email: 'admin@example.com'
      }
    }
  ],
  3: [
    {
      id: 4,
      booking_id: 3,
      old_status: null,
      new_status: 'pending',
      changed_by: 1,
      changed_at: '2024-01-10T10:00:00Z',
      notes: 'Initial booking created',
      changed_by_user: {
        id: 1,
        fullname: 'Admin User',
        email: 'admin@example.com'
      }
    },
    {
      id: 5,
      booking_id: 3,
      old_status: 'pending',
      new_status: 'confirmed',
      changed_by: 1,
      changed_at: '2024-01-10T11:00:00Z',
      notes: 'Payment confirmed',
      changed_by_user: {
        id: 1,
        fullname: 'Admin User',
        email: 'admin@example.com'
      }
    },
    {
      id: 6,
      booking_id: 3,
      old_status: 'confirmed',
      new_status: 'completed',
      changed_by: 1,
      changed_at: '2024-05-11T08:00:00Z',
      notes: 'Event successfully completed',
      changed_by_user: {
        id: 1,
        fullname: 'Admin User',
        email: 'admin@example.com'
      }
    }
  ]
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'ERROR',
      message: 'Authentication required' 
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'ERROR',
      message: 'Method not allowed'
    });
  }

  try {
    const { id } = req.query;
    const bookingId = parseInt(id as string);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid booking ID'
      });
    }

    // Get booking history
    const history = mockBookingHistory[bookingId] || [];

    console.log(`📜 Retrieved history for booking ${bookingId}: ${history.length} entries`);

    const response = {
      status: 'OK',
      message: 'Booking history retrieved successfully',
      data: history
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch booking history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
