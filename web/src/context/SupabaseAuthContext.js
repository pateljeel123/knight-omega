import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    const currentSession = supabase.auth.session();
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);

    // Listen for changes on auth state
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      listener?.unsubscribe();
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  // Sign in with email
  const signInWithEmail = async (email, password) => {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (user) setUser(user);
    return { user, error };
  };

  // Sign up with email
  const signUpWithEmail = async (email, password, username) => {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username,
        }
      }
    });
    if (user) setUser(user);
    return { user, error };
  };

  // Sign in with magic link
  const signInWithMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  // Get user profile
  const getUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return { data, error };
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) return { error: { message: 'User not authenticated' } };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);
    
    return { data, error };
  };

  // Reset password
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  // Update password
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signInWithGitHub,
      signInWithEmail,
      signUpWithEmail,
      signInWithMagicLink,
      signOut,
      getUserProfile,
      updateUserProfile,
      resetPassword,
      updatePassword,
      supabase
    }}>
      {children}
    </AuthContext.Provider>
  );
};