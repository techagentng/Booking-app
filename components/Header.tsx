import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationBell } from './notifications';
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  HelpCircle, 
  Shield, 
  Palette,
  X,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  showUserMenu?: boolean;
}

export default function Header({ title = "Dashboard", showNotifications = true, showUserMenu = true }: HeaderProps) {
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    // Navigate to login page will be handled by AuthContext
  };

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        {showNotifications && <NotificationBell />}
        
        {/* User Profile */}
        {showUserMenu && (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <img
                src="https://i.pravatar.cc/50"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold text-sm">{user?.fullname || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role_name || 'User'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* Dropdown menu */}
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                {/* Notifications count indicator */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Notifications</span>
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {notifications.length}
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Settings</span>
                </button>

                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Profile</span>
                </button>

                <button
                  onClick={() => handleNavigate('/billing')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Billing</span>
                </button>

                <button
                  onClick={() => handleNavigate('/help')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Help & Support</span>
                </button>

                <div className="border-t border-gray-100 my-2"></div>

                <button
                  onClick={() => handleNavigate('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Admin Panel</span>
                </button>

                <button
                  onClick={() => handleNavigate('/preferences')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <Palette className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Preferences</span>
                </button>

                <div className="border-t border-gray-100 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
