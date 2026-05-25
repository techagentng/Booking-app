import { NextApiRequest, NextApiResponse } from 'next';

// Mock booking data matching the guide's response format
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
    status_history: [
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
    status_history: [
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
    created_at: '2024-01-16T08:00:00Z',
    updated_at: '2024-01-16T09:15:00Z'
  },
  {
    id: 3,
    booking_id: 'HB-2024-003',
    organizer_name: 'Mike Johnson',
    organizer_email: 'mike@example.com',
    organizer_phone: '+1234567892',
    event_type: 'party',
    guest_count: 30,
    special_requests: 'Birthday cake arrangement',
    booking_date: '2024-05-10',
    start_time: '19:00',
    end_time: '23:00',
    total_price: 1200.00,
    deposit_required: 240.00,
    payment_method: 'cash',
    status: 'completed',
    confirmed_by: 1,
    confirmed_at: '2024-01-10T11:00:00Z',
    cancelled_by: null,
    cancelled_at: null,
    updated_by: 1,
    status_history: [
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
    ],
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-05-11T08:00:00Z'
  },
  {
    id: 4,
    booking_id: 'HB-2024-004',
    organizer_name: 'Emma Wilson',
    organizer_email: 'emma@example.com',
    organizer_phone: '+1234567893',
    event_type: 'conference',
    guest_count: 100,
    special_requests: 'Catering for 100 people',
    booking_date: '2024-08-05',
    start_time: '08:00',
    end_time: '18:00',
    total_price: 3500.00,
    deposit_required: 700.00,
    payment_method: 'online',
    status: 'cancelled',
    confirmed_by: null,
    confirmed_at: null,
    cancelled_by: 1,
    cancelled_at: '2024-01-20T14:30:00Z',
    updated_by: 1,
    status_history: [
      {
        id: 7,
        booking_id: 4,
        old_status: null,
        new_status: 'pending',
        changed_by: 1,
        changed_at: '2024-01-20T10:00:00Z',
        notes: 'Initial booking created',
        changed_by_user: {
          id: 1,
          fullname: 'Admin User',
          email: 'admin@example.com'
        }
      },
      {
        id: 8,
        booking_id: 4,
        old_status: 'pending',
        new_status: 'cancelled',
        changed_by: 1,
        changed_at: '2024-01-20T14:30:00Z',
        notes: 'Customer requested cancellation due to scheduling conflict',
        changed_by_user: {
          id: 1,
          fullname: 'Admin User',
          email: 'admin@example.com'
        }
      }
    ],
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple auth check (in production, use proper JWT validation)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'ERROR',
      message: 'Authentication required' 
    });
  }

  if (req.method === 'GET') {
    try {
      // Parse query parameters
      const {
        status,
        page = '1',
        limit = '20',
        date_from,
        date_to,
        search,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = req.query;

      let filteredBookings = [...mockBookings];

      // Filter by status (single or multiple)
      if (status) {
        const statusFilters = Array.isArray(status) ? status : [status];
        filteredBookings = filteredBookings.filter(booking => 
          statusFilters.includes(booking.status)
        );
      }

      // Filter by date range
      if (date_from) {
        filteredBookings = filteredBookings.filter(booking => 
          new Date(booking.booking_date) >= new Date(date_from as string)
        );
      }
      if (date_to) {
        filteredBookings = filteredBookings.filter(booking => 
          new Date(booking.booking_date) <= new Date(date_to as string)
        );
      }

      // Search by organizer name or email
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredBookings = filteredBookings.filter(booking =>
          booking.organizer_name.toLowerCase().includes(searchTerm) ||
          booking.organizer_email.toLowerCase().includes(searchTerm) ||
          booking.booking_id.toLowerCase().includes(searchTerm)
        );
      }

      // Sort bookings
      filteredBookings.sort((a, b) => {
        const aValue = a[sort_by as keyof typeof a];
        const bValue = b[sort_by as keyof typeof b];
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort_order === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        // Handle number/date comparison
        if (aValue < bValue) return sort_order === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort_order === 'asc' ? 1 : -1;
        return 0;
      });

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
      
      const meta = {
        total: filteredBookings.length,
        page: pageNum,
        page_size: limitNum,
        total_pages: Math.ceil(filteredBookings.length / limitNum)
      };

      console.log('📊 Admin Bookings Filtered:', {
        requestedStatus: status,
        filteredCount: filteredBookings.length,
        returnedCount: paginatedBookings.length,
        page: pageNum,
        totalPages: meta.total_pages
      });

      const response = {
        status: 'OK',
        message: 'Bookings retrieved successfully',
        data: paginatedBookings,
        meta
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to fetch bookings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      // Create new booking
      const newBooking = {
        id: mockBookings.length + 1,
        booking_id: `HB-2024-${String(mockBookings.length + 1).padStart(3, '0')}`,
        ...req.body,
        status: 'pending',
        confirmed_by: null,
        confirmed_at: null,
        cancelled_by: null,
        cancelled_at: null,
        updated_by: 1,
        status_history: [
          {
            id: mockBookings.length * 2 + 1,
            booking_id: mockBookings.length + 1,
            old_status: null,
            new_status: 'pending',
            changed_by: 1,
            changed_at: new Date().toISOString(),
            notes: 'Initial booking created',
            changed_by_user: {
              id: 1,
              fullname: 'Admin User',
              email: 'admin@example.com'
            }
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockBookings.push(newBooking);

      console.log('✅ New booking created:', newBooking.booking_id);

      res.status(201).json({
        status: 'OK',
        message: 'Booking created successfully',
        data: newBooking
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to create booking',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({
      status: 'ERROR',
      message: 'Method not allowed'
    });
  }
}
