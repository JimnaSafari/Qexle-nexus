
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
      console.log('Attempting login for:', email, 'with role:', role);
      
      // First try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.log('Sign in failed:', authError.message);
        
        // Handle email not confirmed error specifically
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in. If you haven\'t received the email, try signing up again.');
        }
        
        // If user doesn't exist, try to sign them up
        if (authError.message.includes('Invalid login credentials')) {
          console.log('User not found, attempting to create account...');
          
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

          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            throw new Error('Account created successfully! Please check your email and click the confirmation link to complete your registration, then try signing in again.');
          }

          if (signUpData.user) {
            console.log('User created successfully and confirmed');
            
            // Create team member record
            const { error: teamMemberError } = await supabase
              .from('team_members')
              .insert({
                user_id: signUpData.user.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                role: role
              });

            if (teamMemberError) {
              console.error('Error creating team member:', teamMemberError);
              throw new Error('Failed to create user profile');
            }

            // Set user immediately for new signups
            setUser({
              id: signUpData.user.id,
              email: email,
              name: `${firstName} ${lastName}`,
              role: role
            });
          }
          return;
        }
        throw authError;
      }

      if (authData.user) {
        console.log('User signed in successfully');
        
        // Check if team member exists, if not create one
        let { data: teamMember, error: fetchError } = await supabase
          .from('team_members')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching team member:', fetchError);
          throw new Error('Failed to fetch user profile');
        }

        if (!teamMember) {
          console.log('Creating team member record...');
          const { data: newTeamMember, error: insertError } = await supabase
            .from('team_members')
            .insert({
              user_id: authData.user.id,
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
        } else {
          // Update existing team member with new information
          const { data: updatedMember, error: updateError } = await supabase
            .from('team_members')
            .update({ 
              role: role,
              first_name: firstName,
              last_name: lastName
            })
            .eq('id', teamMember.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating team member:', updateError);
          } else {
            teamMember = updatedMember;
          }
        }

        setUser({
          id: authData.user.id,
          email: authData.user.email!,
          name: `${teamMember.first_name} ${teamMember.last_name}`,
          role: teamMember.role
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
