import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock dashboard statistics
    const mockStats = {
      total_guests: 156,
      total_rooms: 50,
      occupied_rooms: 38,
      available_rooms: 8,
      maintenance_rooms: 3,
      cleaning_rooms: 1,
      pending_check_ins: 12,
      pending_check_outs: 8,
      pending_service_requests: 15,
      today_revenue: 3450.00,
      month_revenue: 45600.00,
      occupancy_rate: 76.0,
      fraud_score: 2.3,
      user_count: 1247
    };

    console.log('📊 Dashboard Stats:', mockStats);

    const response = {
      success: true,
      data: mockStats
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
