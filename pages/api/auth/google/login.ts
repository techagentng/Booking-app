import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, fullname, telephone } = req.body;
    console.log('📤 Forwarding Google login request to backend:', { email });
    
    // Forward the request to your backend
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/google/user/login`,
      { email, fullname, telephone },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Forward cookies if needed
        withCredentials: true,
      }
    );

    // Forward the response from your backend
    res.status(200).json(response.data);
  } catch (error) {
    console.error('🔴 Google login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    res.status(error.response?.status || 500).json({ 
      message: 'Failed to authenticate with Google',
      error: error.response?.data || error.message 
    });
  }
}
