import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock service requests summary
    const mockServiceRequests = {
      pending: 15,
      in_progress: 8,
      completed: 42,
      cancelled: 3
    };

    console.log('🔧 Service Requests Summary:', mockServiceRequests);

    const response = {
      success: true,
      data: mockServiceRequests
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch service requests',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
