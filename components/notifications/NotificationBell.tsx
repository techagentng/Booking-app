import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Volume2, VolumeX, Trash2, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications, Notification, NotificationPriority } from '@/contexts/NotificationContext';

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Get icon for notification type
const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'sign_in': return '👋';
    case 'sign_up': return '🎉';
    case 'new_guest': return '👤';
    case 'new_booking': return '📅';
    case 'service_request': return '🔔';
    case 'service_completed': return '✅';
    case 'room_service_order': return '🍽️';
    case 'check_in': return '🏨';
    case 'check_out': return '👋';
    default: return '📬';
  }
};

// Get priority color
const getPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent': return '#EF4444';
    case 'high': return '#F59E0B';
    case 'normal': return '#3B82F6';
    case 'low': return '#6B7280';
    default: return '#6B7280';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 rounded-lg cursor-pointer transition-all group ${
        notification.read ? 'opacity-60' : ''
      }`}
      style={{
        backgroundColor: notification.read ? 'transparent' : 'var(--bg-tertiary)',
        borderLeft: `3px solid ${getPriorityColor(notification.priority)}`,
      }}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className="font-medium text-sm truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="p-1 rounded hover:bg-green-500/20 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3 text-green-500" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(notification.id);
                }}
                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          </div>
          <p
            className="text-xs mt-1 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {notification.message}
          </p>
          <span
            className="text-xs mt-1 block"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    soundEnabled,
    setSoundEnabled,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell
          className={`w-5 h-5 transition-colors ${
            isConnected ? 'text-current' : 'text-gray-400'
          }`}
          style={{ color: isConnected ? 'var(--text-primary)' : undefined }}
        />
        
        {/* Connection indicator */}
        <span
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        
        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'white',
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Sound toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  ) : (
                    <VolumeX className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </button>
                
                {/* Mark all as read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                )}
                
                {/* Clear all */}
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div
              className="max-h-96 overflow-y-auto"
              style={{ scrollbarWidth: 'thin' }}
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell
                    className="w-12 h-12 mx-auto mb-3 opacity-30"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    No notifications yet
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {isConnected
                      ? "You'll see updates here"
                      : 'Connecting to server...'}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onRemove={removeNotification}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2 text-center"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <span
                className="text-xs flex items-center justify-center gap-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
