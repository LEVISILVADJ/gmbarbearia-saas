import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService, type AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: 'admin' | 'barber') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check active session
    const getSession = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 10000);
        });
        
        const authPromise = authService.getCurrentUser();
        
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        
        if (!mounted) return;
        
        setUser(currentUser);
      } catch (error) {
        if (mounted) {
          console.error('Error getting session:', error);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Error setting user from session:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'barber'): Promise<boolean> => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 15000);
      });
      
      const loginPromise = authService.signIn(email, password);
      await authService.signIn(email, password);
      
      await Promise.race([loginPromise, timeoutPromise]);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Logout timeout')), 10000);
      });
      
      const logoutPromise = authService.signOut();
      await authService.signOut();
      
      await Promise.race([logoutPromise, timeoutPromise]);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};