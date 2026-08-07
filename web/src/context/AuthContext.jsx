import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { registerPushNotifications } from '../services/PushNotificationService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveAuth = useCallback((data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    registerPushNotifications();
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      saveAuth(res.data.data);
      return res.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('The server is waking up from sleep. Please try again in about 60 seconds.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      saveAuth(res.data.data);
      return res.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('The server is waking up from sleep. Please try again in about 60 seconds.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('The server is waking up from sleep. Please try again in about 60 seconds.');
      }
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async ({ email, otp, password }) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, password });
      return res.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('The server is waking up from sleep. Please try again in about 60 seconds.');
      }
      throw error;
    }
  }, []);

  // Check if token is still valid on mount
  useEffect(() => {
    if (localStorage.getItem('accessToken') && !user) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        registerPushNotifications();
      }
    } else if (user) {
      // If already initialized with user state
      registerPushNotifications();
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
