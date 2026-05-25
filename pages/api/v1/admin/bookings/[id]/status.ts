import { NextApiRequest, NextApiResponse } from 'next';

// Mock booking data (same as in index.ts)
const mockBookings = [
  {
    id: 1,
    booking_id: 'HB-2024-001',
    organizer_name: 'John Doe',
    organizer_email: 'john@example.com',
    organizer_phone: '+1234567890',
    event_type: 'wedding',
    guest_count: 50,
    special_requests: 'Floral arrangements',
    booking_date: '2024-06-15',
    start_time: '14:00',
    end_time: '18:00',
    total_price: 2500.00,
    deposit_required: 500.00,
    payment_method: 'online',
    status: 'pending',
    confirmed_by: null,
    confirmed_at: null,
    cancelled_by: null,
    cancelled_at: null,
    updated_by: null,
    status_history: [],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    booking_id: 'HB-2024-002',
    organizer_name: 'Sarah Smith',
    organizer_email: 'sarah@example.com',
    organizer_phone: '+1234567891',
    event_type: 'corporate',
    guest_count: 80,
    special_requests: 'Projector and sound system',
    booking_date: '2024-07-20',
    start_time: '09:00',
    end_time: '17:00',
    total_price: 1800.00,
    deposit_required: 360.00,
    payment_method: 'online',
    status: 'confirmed',
    confirmed_by: 1,
    confirmed_at: '2024-01-16T09:15:00Z',
    cancelled_by: null,
    cancelled_at: null,
    updated_by: 1,
    status_history: [],
    created_at: '2024-01-16T08:00:00Z',
    updated_at: '2024-01-16T09:15:00Z'
  }
];

// Status transition validation rules
const validTransitions: Record<string, string[]> = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['completed', 'cancelled'],
  'completed': [],
  'cancelled': []
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

  if (req.method !== 'PUT') {
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

    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled'
      });
    }

    // Find the booking
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Booking not found'
      });
    }

    const booking = mockBookings[bookingIndex];
    const oldStatus = booking.status;

    // Validate status transition
    if (oldStatus === status) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Booking is already ${status}`
      });
    }

    const allowedTransitions = validTransitions[oldStatus];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Invalid status transition: cannot change from "${oldStatus}" to "${status}"`
      });
    }

    // Update booking
    const updatedBooking = {
      ...booking,
      status,
      updated_by: 1,
      updated_at: new Date().toISOString()
    };

    // Add status-specific fields
    if (status === 'confirmed') {
      updatedBooking.confirmed_by = 1;
      updatedBooking.confirmed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updatedBooking.cancelled_by = 1;
      updatedBooking.cancelled_at = new Date().toISOString();
    }

    // Add status history entry
    const historyEntry = {
      id: booking.status_history.length + 1,
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: status,
      changed_by: 1,
      changed_at: new Date().toISOString(),
      notes: notes || `Status changed from ${oldStatus} to ${status}`,
      changed_by_user: {
        id: 1,
        fullname: 'Admin User',
        email: 'admin@example.com'
      }
    };

    updatedBooking.status_history = [...booking.status_history, historyEntry];

    // Update the mock data
    mockBookings[bookingIndex] = updatedBooking;

    console.log(`🔄 Booking ${bookingId} status updated: ${oldStatus} → ${status}`);

    // 📡 Send SSE notification for status update
    try {
      const notification = {
        id: `status-update-${bookingId}-${Date.now()}`,
        type: 'booking_status_update',
        title: 'Booking Status Updated',
        message: `Booking ${updatedBooking.booking_id} status changed from ${oldStatus} to ${status}`,
        priority: 'normal',
        data: {
          booking_id: bookingId,
          booking_id_str: updatedBooking.booking_id,
          organizer_name: updatedBooking.organizer_name,
          organizer_email: updatedBooking.organizer_email,
          old_status: oldStatus,
          new_status: status,
          event_type: updatedBooking.event_type,
          guest_count: updatedBooking.guest_count,
          booking_date: updatedBooking.booking_date,
          start_time: updatedBooking.start_time,
          end_time: updatedBooking.end_time,
          total_price: updatedBooking.total_price,
          updated_by: 1,
          updated_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      // Send notification to all connected SSE clients
      // In a real implementation, you'd use a proper SSE broadcasting system
      console.log('📢 Status update notification created:', notification);
    } catch (sseError) {
      console.error('Failed to send SSE notification:', sseError);
    }

    const response = {
      status: 'OK',
      message: `Booking status updated to ${status}`,
      data: updatedBooking
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update booking status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
