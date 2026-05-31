import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('smartcattle_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('smartcattle_token');
    localStorage.removeItem('smartcattle_user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('smartcattle_token', newToken);
    localStorage.setItem('smartcattle_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smartcattle_token');
      const savedUser = localStorage.getItem('smartcattle_user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          const { data } = await api.get('/auth/profile');
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('smartcattle_user', JSON.stringify(data.user));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
