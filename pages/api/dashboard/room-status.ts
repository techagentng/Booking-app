import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock room status summary
    const mockRoomStatus = {
      available: 8,
      occupied: 38,
      maintenance: 3,
      cleaning: 1
    };

    console.log('🏨 Room Status Summary:', mockRoomStatus);

    const response = {
      success: true,
      data: mockRoomStatus
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching room status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch room status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
