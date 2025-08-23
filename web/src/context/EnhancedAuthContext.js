import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // OAuth Sign In
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  };

  // Email OTP
  const sendEmailOTP = async (email) => {
    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const verifyEmailOTP = async (email, code) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Phone OTP
  const sendPhoneOTP = async (phone) => {
    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const verifyPhoneOTP = async (phone, code) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Traditional login
  const signInWithEmail = async (email, password) => {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (user) setUser(user);
    return { user, error };
  };

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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const getUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return { data, error };
  };

  const updateUserProfile = async (updates) => {
    if (!user) return { error: { message: 'User not authenticated' } };
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);
    
    return { data, error };
  };

  const getAuthProviders = async () => {
    try {
      const response = await fetch('/api/auth/providers');
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
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
      sendEmailOTP,
      verifyEmailOTP,
      sendPhoneOTP,
      verifyPhoneOTP,
      signOut,
      getUserProfile,
      updateUserProfile,
      getAuthProviders,
      supabase
    }}>
      {children}
    </AuthContext.Provider>
  );
};