import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

// ====================
// Context Type
// ====================
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: string, fullName?: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  handleAuthError: (error: any) => Promise<void>;
}

// ====================
// Create Context
// ====================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ====================
// Hook
// ====================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ====================
// Public Routes
// ====================
const publicPaths = ['/', '/recipes', '/daily-dish', '/login', '/register', '/products'];

// ====================
// Provider
// ====================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ====================
  // Auth State Sync
  // ====================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session && !loading && !publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loading, location.pathname]);

  // ====================
  // Route Guard
  // ====================
  useEffect(() => {
    if (!loading && !user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [loading, user, location.pathname, navigate]);

  // ====================
  // Auth Handlers
  // ====================

  const handleAuthError = async (error: any) => {
    if (
      error?.status === 403 &&
      (error?.message?.includes('JWT expired') || error?.message?.includes('session_not_found'))
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

  const signUp = async (
    email: string,
    password: string,
    role: string = 'user',
    fullName: string = ''
  ): Promise<{ error?: Error }> => {
    try {
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!newUser) throw new Error('User creation failed');

      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', newUser.id)
        .maybeSingle();

      if (profileCheckError) throw profileCheckError;

      const displayName = fullName || email.split('@')[0];

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: newUser.id,
            full_name: displayName,
            role: role
          }]);

        if (profileError) {
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile. Please try again.');
        }
      } else {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role })
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

  // ====================
  // Provide Context
  // ====================
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
