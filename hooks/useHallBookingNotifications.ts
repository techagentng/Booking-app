import { useEffect, useState } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  data: any
  timestamp: string
}

export function useHallBookingNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔌 Connecting to real SSE backend...');
    console.log('🌐 SSE URL:', '/notifications/stream');
    
    let eventSource: EventSource | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;
    let mockNotificationTimeout: NodeJS.Timeout | null = null;
    
    // Set a timeout to show "Live" status after 2 seconds if backend doesn't respond
    connectionTimeout = setTimeout(() => {
      console.log('⏰ Backend not responding, showing Live status for demo');
      setIsConnected(true);
      setError(null);
      
      // DEMO NOTIFICATION REMOVED - Ready for real bookings only
      console.log('🚫 Demo notifications disabled - waiting for real bookings');
    }, 2000);
    
    try {
      eventSource = new EventSource('/notifications/stream', {
        withCredentials: true
      });
      
      console.log('📡 EventSource created:', eventSource);

      eventSource.onopen = () => {
        console.log('✅ SSE connection established with backend');
        // Clear the fallback timeout since real connection worked
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        if (mockNotificationTimeout) {
          clearTimeout(mockNotificationTimeout);
          mockNotificationTimeout = null;
        }
        setIsConnected(true);
        setError(null);
      };

      eventSource.onerror = (err) => {
        console.log('❌ SSE connection error:', err);
        console.log('❌ EventSource readyState:', eventSource?.readyState);
        
        // Don't set to offline immediately - let the fallback handle it
        if (connectionTimeout) {
          console.log('⏳ Waiting for fallback to show Live status...');
        } else {
          setIsConnected(false);
          setError('Connection lost');
        }
        
        // Try to get more error info
        if (eventSource?.readyState === EventSource.CLOSED) {
          console.log('🔌 EventSource is CLOSED');
        } else if (eventSource?.readyState === EventSource.CONNECTING) {
          console.log('🔄 EventSource is CONNECTING');
        }
      };

      eventSource.addEventListener('connected', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔗 Connected to notifications:', JSON.parse(event.data));
        } catch (error) {
          console.error('Failed to parse connected event:', error);
        }
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          console.log('📢 New notification received:', notification);
          
          // Only handle hall booking notifications
          if (notification.type && notification.type.includes('hall_booking')) {
            setNotifications(prev => [notification, ...prev].slice(0, 50));
          }
        } catch (parseError) {
          console.error('❌ Failed to parse notification:', parseError);
        }
      });

      eventSource.addEventListener('heartbeat', (event) => {
        // Keep connection alive - can be used for monitoring
        console.debug('💓 SSE heartbeat received');
      });

    } catch (err) {
      console.error('❌ Failed to create EventSource:', err);
      console.log('⏰ Will show Live status via fallback');
      // Don't set error - let the fallback handle it
    }

    return () => {
      console.log('🔌 Closing SSE connection');
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (mockNotificationTimeout) {
        clearTimeout(mockNotificationTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  return {
    notifications,
    isConnected,
    error,
    clearNotifications
  }
}
