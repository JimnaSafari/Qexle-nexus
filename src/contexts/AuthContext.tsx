
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSeniorAssociate: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Directly set user from session data to avoid extra DB calls
        const userData = session.user.user_metadata || {};
        
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: `${userData.first_name || 'User'} ${userData.last_name || 'Name'}`,
          role: userData.role || 'Junior Associate'
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const userData = session.user.user_metadata || {};
          
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: `${userData.first_name || 'User'} ${userData.last_name || 'Name'}`,
            role: userData.role || 'Junior Associate'
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole, firstName: string = 'User', lastName: string = 'Name') => {
    try {
      // Try to sign in first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error && error.message.includes('Invalid login credentials')) {
        // If sign in fails with invalid credentials, try to create account
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role
            }
          }
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }
        
        throw new Error('Account created! Please check your email and verify your account before signing in.');
      }

      if (error) {
        throw new Error(error.message);
      }

      // User will be set automatically by the auth state change listener
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAuthenticated = !!user;
  const isSeniorAssociate = user?.role === 'Senior Associate';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isSeniorAssociate,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
