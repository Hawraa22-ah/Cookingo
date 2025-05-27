import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  handleAuthError: (error: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// List of paths that don't require authentication
const publicPaths = ['/', '/recipes', '/daily-dish', '/login', '/register'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // If session expired and not on a public path, redirect to login
      if (!session && !loading && !publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loading, location.pathname]);

  // Check if the current path requires authentication
  useEffect(() => {
    if (!loading && !user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [loading, user, location.pathname, navigate]);

  const handleAuthError = async (error: any) => {
    if (
      error?.status === 403 &&
      (error?.message?.includes('JWT expired') ||
        error?.message?.includes('session_not_found'))
    ) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (!signOutError) {
        window.location.href = '/login';
      }
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Welcome back!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  // const signUp = async (email: string, password: string, role: string = 'user') => {
  //   try {
  //     // Sign up the user first
  //     const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         data: {
  //           role: role
  //         }
  //       }
  //     });

  //     if (signUpError) throw signUpError;
  //     if (!newUser) throw new Error('User creation failed');

  //     // Check if a profile already exists for this user
  //     const { data: existingProfile, error: profileCheckError } = await supabase
  //       .from('profiles')
  //       .select('id')
  //       .eq('id', newUser.id)
  //       .maybeSingle();

  //     if (profileCheckError) throw profileCheckError;

  //     // Only create profile if it doesn't exist
  //     // if (!existingProfile) {
  //     //   const { error: profileError } = await supabase
  //     //     .from('profiles')
  //     //     .insert([{
  //     //       id: newUser.id,
  //     //       full_name: email.split('@')[0],
  //     //       role: role
  //     //     }]);

  //       if (!existingProfile) {
  //         const { error: profileError } = await supabase
  //           .from('profiles')
  //           .insert([{
  //             id: newUser.id,
  //             full_name: email.split('@')[0],
  //             role: role
  //           }]);

  //         if (profileError) {
  //           await supabase.auth.signOut();
  //           throw new Error('Failed to create user profile. Please try again.');
  //         }
  //       } else {
  //         const { error: updateError } = await supabase
  //           .from('profiles')
  //           .update({ role: role })
  //           .eq('id', newUser.id);

  //         if (updateError) {
  //           await supabase.auth.signOut();
  //           throw new Error('Failed to update user role. Please try again.');
  //         }
  //       }


  //       if (profileError) {
  //         // If profile creation fails, clean up the auth user
  //         await supabase.auth.signOut();
  //         throw new Error('Failed to create user profile. Please try again.');
  //       }
  //     }
      
  //     toast.success('Account created successfully! Please check your email to verify your account.');
  //     return {};
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       return { error };
  //     }
  //     return { error: new Error('An unknown error occurred') };
  //   }
  // };

  const signUp = async (email: string, password: string, role: string = 'user') => {
    try {
      // Sign up the user first
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!newUser) throw new Error('User creation failed');

      // Check if a profile already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', newUser.id)
        .maybeSingle();

      if (profileCheckError) throw profileCheckError;

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: newUser.id,
            full_name: email.split('@')[0],
            role: role
          }]);

        if (profileError) {
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile. Please try again.');
        }
      } else {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', newUser.id);

        if (updateError) {
          await supabase.auth.signOut();
          throw new Error('Failed to update user role. Please try again.');
        }
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      return {};
    } catch (error) {
      if (error instanceof Error) {
        return { error };
      }
      return { error: new Error('An unknown error occurred') };
    }
  };


  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    handleAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};