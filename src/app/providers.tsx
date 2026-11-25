'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { disableDemoMode, getDemoSession, isDemoMode } from '@/lib/demo';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  user: Session['user'] | null;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  user: null,
  isDemo: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Local demo session takes priority until a real Supabase session appears.
    if (isDemoMode()) {
      setSession(getDemoSession());
      setIsDemo(true);
      setLoading(false);
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (isDemoMode()) disableDemoMode();
        setIsDemo(false);
        setSession(session);
      } else if (!isDemoMode()) {
        setSession(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (isDemoMode()) disableDemoMode();
        setIsDemo(false);
        setSession(session);
        setLoading(false);
      } else if (!isDemoMode()) {
        // Signed out of Supabase. Keep the demo session if demo mode is on.
        setSession(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, user: session?.user ?? null, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
