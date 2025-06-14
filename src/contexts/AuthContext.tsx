
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TeamMember = Database['public']['Tables']['team_members']['Row'];

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<void>;
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
    // Check if user is logged in on app start
    const getUser = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          // Get user profile from team_members table
          const { data: profile } = await supabase
            .from('team_members')
            .select('*')
            .eq('email', supabaseUser.email)
            .single();
          
          if (profile) {
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email!,
              name: `${profile.first_name} ${profile.last_name}`,
              role: profile.role
            });
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('team_members')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: `${profile.first_name} ${profile.last_name}`,
              role: profile.role
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      // First check if user exists in team_members table with correct role
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('email', email)
        .eq('role', role)
        .single();

      if (!teamMember) {
        throw new Error('Invalid credentials or role');
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // User will be set through the auth state change listener
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
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
