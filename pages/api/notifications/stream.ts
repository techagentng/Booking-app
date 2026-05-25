import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  console.log('🔌 SSE connection established for notifications');

  // Send initial connection message
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // DEMO NOTIFICATION REMOVED - Ready for real bookings only
  console.log('� SSE demo notifications disabled - waiting for real bookings');

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write('event: heartbeat\n');
    res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    console.log('🔌 SSE connection closed by client');
    clearInterval(heartbeatInterval);
  });

  req.on('aborted', () => {
    console.log('🔌 SSE connection aborted');
    clearInterval(heartbeatInterval);
  });
}
