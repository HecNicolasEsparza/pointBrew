'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role_name: string;
  role_id: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (full_name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
const API_BASE_URL = 'http://localhost:3001'; // Backend URL
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = Cookies.get('auth_token');
        const savedUser = Cookies.get('auth_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          // Verify token is still valid
          try {
            const response = await axios.get('/api/auth/profile');
            if (response.data.success) {
              setUser(response.data.data);
              Cookies.set('auth_user', JSON.stringify(response.data.data), { expires: 1 }); // 1 day
            }
          } catch (error) {
            // Token is invalid, clear auth
            logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        
        setUser(userData);
        setToken(userToken);
        
        // Save to cookies
        Cookies.set('auth_token', userToken, { expires: 1 }); // 1 day
        Cookies.set('auth_user', JSON.stringify(userData), { expires: 1 }); // 1 day
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error en el servidor' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (full_name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', {
        full_name,
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        
        setUser(userData);
        setToken(userToken);
        
        // Save to cookies
        Cookies.set('auth_token', userToken, { expires: 1 }); // 1 day
        Cookies.set('auth_user', JSON.stringify(userData), { expires: 1 }); // 1 day
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error en el servidor' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Remove cookies
    Cookies.remove('auth_token');
    Cookies.remove('auth_user');
    
    // Remove axios default authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
