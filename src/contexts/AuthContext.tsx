import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'admin_auth_token';
const USER_STORAGE_KEY = 'admin_user';

// Allowed emails for admin access
const ALLOWED_EMAILS = [
  'mr.shibolet@gmail.com',
  'natilevi46@gmail.com',
  's.benbasat@gmail.com'
];

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credential: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // In development mode, validate directly with Google's tokeninfo endpoint
      if (isDevelopment) {
        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        
        if (!googleResponse.ok) {
          setIsLoading(false);
          return { success: false, error: 'Invalid Google token' };
        }
        
        const payload = await googleResponse.json();
        
        if (!payload.email_verified || payload.email_verified === 'false') {
          setIsLoading(false);
          return { success: false, error: 'Email not verified' };
        }
        
        if (!ALLOWED_EMAILS.includes(payload.email.toLowerCase())) {
          setIsLoading(false);
          return { success: false, error: 'Unauthorized email address. Access restricted.' };
        }
        
        const user = {
          email: payload.email,
          name: payload.name || payload.email,
          picture: payload.picture || ''
        };
        
        setToken(credential);
        setUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, credential);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        
        setIsLoading(false);
        return { success: true };
      }
      
      // Production mode: use server-side validation
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credential }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Authentication failed' };
      }
      
      // Store the credential and user info
      setToken(credential);
      setUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, credential);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
