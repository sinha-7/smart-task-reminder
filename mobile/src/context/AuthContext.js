import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await storage.getUser();
        const token = await storage.getToken();
        if (storedUser && token) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await api.post('/auth/signup', { name, email, password });
    const { user: userData, accessToken, refreshToken } = res.data.data;
    await storage.setToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    await storage.setUser(userData);
    setUser(userData);
    return res.data;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken, refreshToken } = res.data.data;
    await storage.setToken(accessToken);
    await storage.setRefreshToken(refreshToken);
    await storage.setUser(userData);
    setUser(userData);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await storage.clearAll();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
