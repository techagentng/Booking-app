import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';

// Notification types from the backend
export type NotificationType = 
  | 'sign_in'
  | 'sign_up'
  | 'new_guest'
  | 'new_booking'
  | 'new_hall_booking'
  | 'booking_status_update'
  | 'service_request'
  | 'service_completed'
  | 'room_service_order'
  | 'hall_booking'
  | 'room_service'
  | 'check_in'
  | 'check_out'
  | 'payment'
  | 'maintenance'
  | 'housekeeping'
  | 'security'
  | 'general';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data: Record<string, unknown>;
  created_at: string;
  read?: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

// Get the base URL for SSE (without /api/v1)
const getSSEBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  // Remove /api/v1 suffix to get base URL for SSE endpoint
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

// LocalStorage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'hotel_notifications';
const MAX_NOTIFICATION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Load notifications from localStorage
const loadNotificationsFromStorage = (): Notification[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored) as Notification[];
    const now = Date.now();
    
    // Filter out notifications older than 24 hours
    return parsed.filter((n) => {
      const createdAt = new Date(n.created_at).getTime();
      return now - createdAt < MAX_NOTIFICATION_AGE_MS;
    });
  } catch (error) {
    console.error('Failed to load notifications from storage:', error);
    return [];
  }
};

// Save notifications to localStorage
const saveNotificationsToStorage = (notifications: Notification[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications to storage:', error);
  }
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 50,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => loadNotificationsFromStorage());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Play notification sound
  const playNotificationSound = useCallback((priority: NotificationPriority) => {
    if (!soundEnabled || typeof window === 'undefined') return;

    try {
      // Use Web Audio API for better control
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds for different priorities
      switch (priority) {
        case 'urgent':
          oscillator.frequency.value = 880; // A5
          gainNode.gain.value = 0.3;
          break;
        case 'high':
          oscillator.frequency.value = 659; // E5
          gainNode.gain.value = 0.2;
          break;
        default:
          oscillator.frequency.value = 523; // C5
          gainNode.gain.value = 0.15;
      }

      oscillator.type = 'sine';
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      // Silently fail if audio is not available
      console.debug('Audio notification not available:', error);
    }
  }, [soundEnabled]);

  // Invalidate relevant queries based on notification type
  const invalidateQueries = useCallback((type: NotificationType) => {
    switch (type) {
      case 'new_guest':
        queryClient.invalidateQueries({ queryKey: ['guests'] });
        break;
      case 'new_booking':
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        break;
      case 'new_hall_booking':
        queryClient.invalidateQueries({ queryKey: ['hall-booking-activity'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        break;
      case 'booking_status_update':
        queryClient.invalidateQueries({ queryKey: ['hall-booking-activity'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        break;
      case 'service_request':
      case 'service_completed':
        queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
        break;
      case 'room_service_order':
        queryClient.invalidateQueries({ queryKey: ['roomService'] });
        break;
      case 'check_in':
      case 'check_out':
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        break;
    }
  }, []);

  const handleNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => {
        const newNotifications = [{ ...notification, read: false }, ...prev];
        return newNotifications.slice(0, maxNotifications);
      });

      if (notification.priority === 'high' || notification.priority === 'urgent') {
        playNotificationSound(notification.priority);
      }

      const toastDuration = notification.priority === 'urgent' ? 10000 : notification.priority === 'high' ? 7000 : 5000;

      switch (notification.type) {
        case 'sign_in':
          toast(notification.message, {
            duration: toastDuration,
            icon: '👋',
          });
          break;
        case 'sign_up':
          toast.success(notification.message, { duration: toastDuration });
          break;
        case 'new_guest':
          toast.success(notification.message, {
            duration: toastDuration,
            icon: '👤',
          });
          break;
        case 'new_booking':
          toast.success(notification.message, {
            duration: toastDuration,
            icon: '📅',
          });
          playNotificationSound('high');
          break;
        case 'booking_status_update':
          toast.success(notification.message, {
            duration: toastDuration,
            icon: '🔄',
          });
          playNotificationSound('normal');
          break;
        case 'new_hall_booking':
          toast.success(notification.message, {
            duration: toastDuration,
            icon: '🏛️',
          });
          playNotificationSound('high');
          break;
        case 'service_request':
          toast(notification.message, {
            duration: toastDuration,
            icon: '🔔',
            style: {
              background: '#FEF3C7',
              color: '#92400E',
            },
          });
          playNotificationSound('normal');
          break;
        case 'service_completed':
          toast.success(notification.message, {
            duration: toastDuration,
            icon: '✅',
          });
          break;
        case 'room_service_order':
          toast(notification.message, {
            duration: toastDuration,
            icon: '🍽️',
          });
          playNotificationSound('high');
          break;
        case 'check_in':
          toast.success(notification.message, {
            duration: toastDuration,
            icon: '🏨',
          });
          break;
        case 'check_out':
          toast(notification.message, {
            duration: toastDuration,
            icon: '👋',
          });
          break;
        default:
          toast(notification.message, { duration: toastDuration });
      }

      // Invalidate relevant queries to refresh data
      invalidateQueries(notification.type);
    },
    [maxNotifications, playNotificationSound, invalidateQueries]
  );

  // Connect to SSE - DISABLED in development until backend is ready
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Skip SSE connection in development if backend is not available
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔔 SSE disabled in development - backend not ready');
      setIsConnected(false);
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const baseUrl = getSSEBaseUrl();
    const sseUrl = `${baseUrl}/notifications/stream`;

    console.log('🔔 Connecting to notification stream:', sseUrl);

    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connected', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('✅ Connected to notifications:', data.client_id);
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to parse connected event:', error);
          setIsConnected(true);
        }
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          console.log('📬 Received notification:', notification);
          handleNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      });

      eventSource.addEventListener('heartbeat', () => {
        // Connection is alive - no action needed
        console.debug('💓 Heartbeat received');
      });

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);

        // EventSource will auto-reconnect, but we can add custom logic
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('🔄 SSE connection closed, will attempt reconnect...');
          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          // Attempt reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      eventSource.onopen = () => {
        console.log('🔔 SSE connection opened');
        setIsConnected(true);
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      setIsConnected(false);
    }
  }, [handleNotification]);

  // Initialize connection on mount - DISABLED in development until backend is ready
  useEffect(() => {
    // Only connect in production
    if (process.env.NODE_ENV === 'production') {
      connect();
    } else {
      console.log('🔔 SSE notifications disabled in development mode');
      setIsConnected(false);
    }

    // Load sound preference from localStorage
    if (typeof window !== 'undefined') {
      const savedSoundPref = localStorage.getItem('notification_sound_enabled');
      if (savedSoundPref !== null) {
        setSoundEnabled(savedSoundPref === 'true');
      }
      
      // Load notifications from localStorage (for SSR hydration)
      const storedNotifications = loadNotificationsFromStorage();
      if (storedNotifications.length > 0) {
        setNotifications(storedNotifications);
      }
      setIsInitialized(true);
    }
  }, []); // Disabled connect in development

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      saveNotificationsToStorage(notifications);
    }
  }, [notifications, isInitialized]);

  // Save sound preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification_sound_enabled', String(soundEnabled));
    }
  }, [soundEnabled]);

  // Context methods
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    saveNotificationsToStorage([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    soundEnabled,
    setSoundEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
