
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
  login: (email: string, password: string, role: UserRole) => Promise<void>;
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
            .maybeSingle();
          
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
            .maybeSingle();
          
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

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      console.log('Attempting login for:', email, 'with role:', role);
      
      // First try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // If user doesn't exist, try to sign them up
        if (authError.message.includes('Invalid login credentials')) {
          console.log('User not found, attempting to create account...');
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: 'User',
                last_name: 'Name',
                role: role
              }
            }
          });

          if (signUpError) {
            throw new Error(signUpError.message);
          }

          if (signUpData.user) {
            // Create team member record
            const { error: teamMemberError } = await supabase
              .from('team_members')
              .insert({
                user_id: signUpData.user.id,
                email: email,
                first_name: 'User',
                last_name: 'Name',
                role: role
              });

            if (teamMemberError) {
              console.error('Error creating team member:', teamMemberError);
            }

            // Set user immediately
            setUser({
              id: signUpData.user.id,
              email: email,
              name: 'User Name',
              role: role
            });
          }
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // Check if team member exists, if not create one
        let { data: teamMember } = await supabase
          .from('team_members')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (!teamMember) {
          console.log('Creating team member record...');
          const { data: newTeamMember, error: insertError } = await supabase
            .from('team_members')
            .insert({
              user_id: authData.user.id,
              email: email,
              first_name: 'User',
              last_name: 'Name',
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

        // Update role if different
        if (teamMember.role !== role) {
          const { data: updatedMember, error: updateError } = await supabase
            .from('team_members')
            .update({ role: role })
            .eq('id', teamMember.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating role:', updateError);
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
