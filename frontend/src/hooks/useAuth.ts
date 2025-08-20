import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Auth check response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User authenticated:', data.user?.username);
        setUser(data.user);
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('🚨 Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      console.log('🔐 Login response:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login successful:', data.user?.username);
        setUser(data.user);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Login failed:', errorData);
        return false;
      }
      
    } catch (error) {
      console.error('🚨 Login request failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out...');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('🚨 Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };
}

export { AuthContext };