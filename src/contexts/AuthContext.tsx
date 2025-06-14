
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
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
    // Check if user is logged in on app start
    const getUser = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          console.log('Found authenticated user:', supabaseUser.email);
          
          // Get user profile from team_members table
          const { data: profile, error: profileError } = await supabase
            .from('team_members')
            .select('*')
            .eq('email', supabaseUser.email)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }
          
          if (profile) {
            console.log('Found user profile:', profile);
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email!,
              name: `${profile.first_name} ${profile.last_name}`,
              role: profile.role
            });
          } else {
            console.log('No profile found for user');
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
      console.log('Auth state changed:', event, session?.user?.email);
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('team_members')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile after sign in:', profileError);
          }
          
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

  const login = async (email: string, password: string, role: UserRole, firstName: string = 'User', lastName: string = 'Name') => {
    try {
      console.log('Attempting to sign in user:', email);
      
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.log('Sign in failed:', signInError.message);
        
        // If it's an email not confirmed error, throw a helpful message
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link to verify your account before signing in.');
        }
        
        // If invalid credentials, try to create a new account
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('User not found, creating new account...');
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
            console.error('Sign up error:', signUpError);
            throw new Error(signUpError.message);
          }

          // Check if email confirmation is required
          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            throw new Error('Account created! Please check your email and click the confirmation link to verify your account, then try signing in again.');
          }

          console.log('Account created and confirmed, user signed in');
          return;
        }
        
        // For any other error, throw it
        throw signInError;
      }

      // If sign in was successful
      if (signInData.user) {
        console.log('User signed in successfully');
        
        // Check if team member profile exists
        let { data: teamMember, error: fetchError } = await supabase
          .from('team_members')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching team member:', fetchError);
          throw new Error('Failed to fetch user profile');
        }

        // If no team member profile exists, create one
        if (!teamMember) {
          console.log('Creating team member profile...');
          const { data: newTeamMember, error: insertError } = await supabase
            .from('team_members')
            .insert({
              user_id: signInData.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              role: role
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating team member:', insertError);
            throw new Error('Failed to create user profile');
          }
          
          teamMember = newTeamMember;
        }

        // Set user in state
        setUser({
          id: signInData.user.id,
          email: signInData.user.email!,
          name: `${teamMember.first_name} ${teamMember.last_name}`,
          role: teamMember.role
        });

        console.log('Login completed successfully');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
