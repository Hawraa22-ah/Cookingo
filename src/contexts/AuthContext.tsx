
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

// ADDED: Add role to interface!
interface AuthContextType {
  user: User | null;
  role: string | undefined;     // <-- Added role
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role?: string,
    fullName?: string,
    username?: string
  ) => Promise<{ error?: Error }>;
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

const publicPaths = ['/', '/recipes', '/daily-dish', '/login', '/register', '/products', '/occasions', '/donation', '/learn'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | undefined>(undefined); // <-- Added role state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session && !loading && !publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
    });

    return () => authListener?.subscription?.unsubscribe();
  }, [navigate, loading, location.pathname]);

  useEffect(() => {
    if (!loading && !user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [loading, user, location.pathname, navigate]);

  // ADDED: Fetch user role whenever the user changes
  useEffect(() => {
    if (!user) {
      setRole(undefined);
      return;
    }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setRole(undefined);
        } else {
          setRole(data?.role);
        }
      });
  }, [user]);

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: string = 'user',
    fullName: string = '',
    username?: string
  ): Promise<{ error?: Error }> => {
    try {
      const autoUsername = username?.trim() || email.split('@')[0];

      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', autoUsername)
        .maybeSingle();

      if (usernameCheckError) {
        console.error('🔥 Username check error:', usernameCheckError);
        return { error: usernameCheckError };
      }

      if (existingUser) {
        return { error: new Error('This username is already taken.') };
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('🔥 Supabase Auth signup failed:', {
          code: signUpError.code,
          message: signUpError.message,
          status: signUpError.status,
        });
        toast.error(signUpError.message || 'Signup failed');
        return { error: signUpError };
      }

      const userId = signUpData.user?.id;
      const session = signUpData.session;

      if (!userId || !session) {
        toast.success('Account created! Please check your email to verify.');
        return {};
      }

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          full_name: fullName.trim(),
          username: autoUsername,
          role: role as 'user' | 'chef' | 'seller',
          avatar_url: '',
        },
      ]);

      if (profileError) {
        console.error('🔥 Supabase profile insert failed:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
        });
        await supabase.auth.signOut();
        toast.error(profileError.message || 'Error saving profile');
        return { error: new Error(`Database error saving profile: ${profileError.message}`) };
      }

      toast.success('Account created successfully!');
      return {};
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ signUp unexpected error:', error.message);
        toast.error(error.message);
        return { error };
      }
      toast.error('An unknown error occurred during signup.');
      return { error: new Error('An unknown error occurred') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setRole(undefined); // ADDED: clear role on sign out
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      throw error;
    }
  };

  // ADDED: Provide role in context!
  const value: AuthContextType & { role: string | undefined } = {
    user,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    handleAuthError,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
