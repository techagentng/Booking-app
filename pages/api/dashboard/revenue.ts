import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock revenue statistics
    const mockRevenue = {
      today_revenue: 3450.00,
      today_orders: 23,
      week_revenue: 15600.00,
      month_revenue: 45600.00,
      average_daily_revenue: 1520.00,
      top_service: 'Room Service',
      top_service_revenue: 2340.00
    };

    console.log('💰 Revenue Stats:', mockRevenue);

    const response = {
      success: true,
      data: mockRevenue
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch revenue stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
