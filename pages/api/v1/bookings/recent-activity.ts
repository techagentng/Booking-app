import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock data for different booking statuses
    const mockBookings = [
      // Pending bookings
      {
        id: 1,
        booking_id: 'HB001',
        organizer_name: 'John Smith',
        organizer_email: 'john@example.com',
        organizer_phone: '+44 20 1234 5678',
        event_type: 'Wedding',
        guest_count: 150,
        booking_date: '2024-02-14',
        start_time: '14:00',
        end_time: '18:00',
        special_requests: 'Flower arrangements needed',
        total_price: 2500,
        deposit_required: 750,
        status: 'pending',
        created_by_type: 'public',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        booking_id: 'HB002',
        organizer_name: 'Sarah Johnson',
        organizer_email: 'sarah@example.com',
        organizer_phone: '+44 20 2345 6789',
        event_type: 'Corporate',
        guest_count: 80,
        booking_date: '2024-02-20',
        start_time: '09:00',
        end_time: '17:00',
        special_requests: 'Projector and sound system',
        total_price: 1800,
        deposit_required: 540,
        status: 'pending',
        created_by_type: 'public',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      
      // Confirmed bookings
      {
        id: 3,
        booking_id: 'HB003',
        organizer_name: 'Michael Brown',
        organizer_email: 'michael@example.com',
        organizer_phone: '+44 20 3456 7890',
        event_type: 'Party',
        guest_count: 60,
        booking_date: '2024-02-10',
        start_time: '19:00',
        end_time: '23:00',
        special_requests: 'DJ setup required',
        total_price: 1200,
        deposit_required: 360,
        status: 'confirmed',
        created_by_type: 'admin',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      },
      {
        id: 4,
        booking_id: 'HB004',
        organizer_name: 'Emma Davis',
        organizer_email: 'emma@example.com',
        organizer_phone: '+44 20 4567 8901',
        event_type: 'Conference',
        guest_count: 200,
        booking_date: '2024-02-25',
        start_time: '08:00',
        end_time: '18:00',
        special_requests: 'Catering for 200 people',
        total_price: 3500,
        deposit_required: 1050,
        status: 'confirmed',
        created_by_type: 'public',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      
      // Completed bookings
      {
        id: 5,
        booking_id: 'HB005',
        organizer_name: 'Robert Wilson',
        organizer_email: 'robert@example.com',
        organizer_phone: '+44 20 5678 9012',
        event_type: 'Funeral',
        guest_count: 100,
        booking_date: '2024-01-28',
        start_time: '10:00',
        end_time: '14:00',
        special_requests: 'Quiet atmosphere required',
        total_price: 800,
        deposit_required: 240,
        status: 'completed',
        created_by_type: 'admin',
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: 6,
        booking_id: 'HB006',
        organizer_name: 'Lisa Anderson',
        organizer_email: 'lisa@example.com',
        organizer_phone: '+44 20 6789 0123',
        event_type: 'Wedding',
        guest_count: 120,
        booking_date: '2024-01-20',
        start_time: '15:00',
        end_time: '20:00',
        special_requests: 'Photography package',
        total_price: 2200,
        deposit_required: 660,
        status: 'completed',
        created_by_type: 'public',
        created_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updated_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
      },
      
      // Cancelled bookings
      {
        id: 7,
        booking_id: 'HB007',
        organizer_name: 'James Taylor',
        organizer_email: 'james@example.com',
        organizer_phone: '+44 20 7890 1234',
        event_type: 'Corporate',
        guest_count: 50,
        booking_date: '2024-02-15',
        start_time: '13:00',
        end_time: '17:00',
        special_requests: 'Team building activities',
        total_price: 1000,
        deposit_required: 300,
        status: 'cancelled',
        created_by_type: 'public',
        created_at: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updated_at: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(), // 6 days ago
      },
      {
        id: 8,
        booking_id: 'HB008',
        organizer_name: 'Patricia Martinez',
        organizer_email: 'patricia@example.com',
        organizer_phone: '+44 20 8901 2345',
        event_type: 'Party',
        guest_count: 40,
        booking_date: '2024-02-08',
        start_time: '20:00',
        end_time: '01:00',
        special_requests: 'Birthday cake arrangement',
        total_price: 600,
        deposit_required: 180,
        status: 'cancelled',
        created_by_type: 'admin',
        created_at: new Date(Date.now() - 192 * 60 * 60 * 1000).toISOString(), // 8 days ago
        updated_at: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
    ];

    // Sort by created_at date (newest first)
    const sortedBookings = mockBookings.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const response = {
      success: true,
      data: {
        recent_bookings: sortedBookings,
        total_count: sortedBookings.length,
      },
    };

    console.log('📊 Recent Hall Booking Activity:', {
      total: sortedBookings.length,
      pending: sortedBookings.filter(b => b.status === 'pending').length,
      confirmed: sortedBookings.filter(b => b.status === 'confirmed').length,
      completed: sortedBookings.filter(b => b.status === 'completed').length,
      cancelled: sortedBookings.filter(b => b.status === 'cancelled').length,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching recent hall booking activity:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent hall booking activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
