import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { AuthContextType, AuthState, User, GoogleLoginResponse } from '../types/auth';
import { setSession, clearSession, getSession, getUserRole, getUserData } from '../utils/auth';
import { setDevAuthToken, clearDevAuthToken } from '../src/utils/auth-utils';
import { authAPI } from '../lib/api/auth';

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    role_name: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getSession();
        const role = getUserRole();
        const userData = getUserData();

        if (token && userData) {
          setState({
            isLoggedIn: true,
            isInitialized: true,
            user: userData,
            role_name: role,
          });
        } else {
          setState({
            isLoggedIn: false,
            isInitialized: true,
            user: null,
            role_name: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          isLoggedIn: false,
          isInitialized: true,
          user: null,
          role_name: null,
        });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function with email and password
   */
  const login = async (email: string, password: string, redirectTo?: string): Promise<void> => {
    try {
      console.log('📤 Sending login request to backend API');
      
      const responseData = await authAPI.login({ email, password });
      
      console.log('🔑 Login response:', responseData);

      const access_token = responseData.access_token;
      const role_name = responseData.user.role_name || 'User';
      
      // Construct user object
      const user: User = {
        id: responseData.user.id?.toString() || email,
        email: responseData.user.email || email,
        fullname: responseData.user.full_name || email,
        username: responseData.user.email?.split('@')[0] || email.split('@')[0],
        telephone: '',
        role_name: role_name,
      };

      console.log('👤 Constructed user object:', user);

      // Set the session with the received token and user data
      setSession(access_token, role_name, user);

      // Update the auth state
      setState({
        isLoggedIn: true,
        isInitialized: true,
        user: user,
        role_name: role_name,
      });

      // Store the auth state in localStorage
      if (typeof window !== 'undefined') {
        try {
          const authState = {
            token: access_token,
            user: user,
            role: role_name,
            timestamp: Date.now()
          };
          localStorage.setItem('auth_state', JSON.stringify(authState));
          
          if (process.env.NODE_ENV === 'development') {
            setDevAuthToken(access_token);
          }
        } catch (error) {
          console.error('Error storing auth state:', error);
        }
      }

      // Role-based redirect
      const normalizedRole = role_name.toLowerCase();
      if (normalizedRole === 'provider') {
        router.push(redirectTo || '/provider/dashboard');
      } else if (normalizedRole === 'admin') {
        router.push(redirectTo || '/admin/dashboard');
      } else {
        router.push(redirectTo || '/');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      clearSession();
      
      setState({
        isLoggedIn: false,
        isInitialized: true,
        user: null,
        role_name: null,
      });
      
      throw error;
    }
  };

  /**
   * Signup function
   */
  const signup = async (data: { email: string; password: string; full_name: string; phone?: string }): Promise<void> => {
    try {
      console.log('📤 Sending signup request to backend API');
      
      const responseData = await authAPI.signup(data);
      
      console.log('🔑 Signup response:', responseData);

      const access_token = responseData.access_token;
      const role_name = responseData.user.role_name || 'User';
      
      // Construct user object
      const user: User = {
        id: responseData.user.id?.toString() || data.email,
        email: responseData.user.email || data.email,
        fullname: responseData.user.full_name || data.full_name,
        username: responseData.user.email?.split('@')[0] || data.email.split('@')[0],
        telephone: data.phone || '',
        role_name: role_name,
      };

      console.log('👤 Constructed user object:', user);

      // Set the session with the received token and user data
      setSession(access_token, role_name, user);

      // Update the auth state
      setState({
        isLoggedIn: true,
        isInitialized: true,
        user: user,
        role_name: role_name,
      });

      // Store the auth state in localStorage
      if (typeof window !== 'undefined') {
        try {
          const authState = {
            token: access_token,
            user: user,
            role: role_name,
            timestamp: Date.now()
          };
          localStorage.setItem('auth_state', JSON.stringify(authState));
          
          if (process.env.NODE_ENV === 'development') {
            setDevAuthToken(access_token);
          }
        } catch (error) {
          console.error('Error storing auth state:', error);
        }
      }

      // Redirect to home page after signup
      router.push('/');
    } catch (error) {
      console.error('Signup error:', error);
      
      clearSession();
      
      setState({
        isLoggedIn: false,
        isInitialized: true,
        user: null,
        role_name: null,
      });
      
      throw error;
    }
  };

  /**
   * Google login function
   * Sends user data to backend and handles authentication
   */
  const googleLogin = async (
    email: string,
    fullname: string,
    telephone: string,
    redirectTo?: string
  ): Promise<void> => {
    try {
      console.log('📤 Sending login request to backend API');
      console.log('📦 Payload:', { email, fullname: fullname || 'Guest User' });

      // Send email, fullname, and telephone to backend
      const responseData = await authAPI.googleLogin({
        code: email, // Using email as code for now - adjust based on actual OAuth flow
        state: redirectTo ? JSON.stringify({ redirectTo }) : undefined,
      });
      
      console.log('🔑 Login response:', responseData);

      const access_token = responseData.access_token;
      const role_name = responseData.user.role_name || 'User';
      
      // Construct user object with safe fallbacks
      const user: User = {
        id: responseData.user.id?.toString() || email,
        email: responseData.user.email || email,
        fullname: responseData.user.full_name || fullname,
        username: responseData.user.email?.split('@')[0] || email.split('@')[0],
        telephone: telephone,
        role_name: role_name,
      };

      console.log('👤 Constructed user object:', user);

      // Set the session with the received token and user data
      setSession(access_token, role_name, user);

      // Update the auth state
      setState({
        isLoggedIn: true,
        isInitialized: true,
        user: user,
        role_name: role_name,
      });

      // Store the auth state in localStorage for WebSocket access
      if (typeof window !== 'undefined') {
        try {
          const authState = {
            token: access_token,
            user: user,
            role: role_name,
            timestamp: Date.now()
          };
          localStorage.setItem('auth_state', JSON.stringify(authState));
          
          // Also set the dev auth token for development
          if (process.env.NODE_ENV === 'development') {
            setDevAuthToken(access_token);
          }
        } catch (error) {
          console.error('Error storing auth state:', error);
        }
      }

      const normalizedRole = role_name.toLowerCase();
      router.push(normalizedRole === 'provider' ? '/provider/dashboard' : redirectTo || '/');
    } catch (error) {
      console.error('Google Login error:', error);
      
      // Clear any partial session data
      clearSession();
      
      setState({
        isLoggedIn: false,
        isInitialized: true,
        user: null,
        role_name: null,
      });
      
      throw error;
    }
  };

  /**
   * Logout function
   * Clears session and redirects to login
   */
  const logout = () => {
    // Clear session data
    clearSession();
    
    // Clear WebSocket auth state
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_state');
        console.log('🔒 Removed WebSocket auth state');
      } catch (e) {
        console.warn('Failed to clear WebSocket auth state', e);
      }
    }
    
    // Clear development WebSocket token
    if (process.env.NODE_ENV !== 'production') {
      clearDevAuthToken();
    }
    
    // Reset auth state
    setState({
      isLoggedIn: false,
      isInitialized: true,
      user: null,
      role_name: null,
    });
    
    // Redirect to login page
    router.push('/login');
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
