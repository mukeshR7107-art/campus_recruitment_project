import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, UserRole } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: Error | null; emailConfirmationRequired: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    setProfile(data ?? null);
    return data ?? null;
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await fetchProfile(session.user.id);
        } catch {
          setProfile(null);
        }
      }
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Supabase advises against awaiting database calls in this callback:
        // it can hold the auth lock and leave sign-in in a loading state.
        window.setTimeout(() => {
          if (!mounted || !session.user) return;
          void fetchProfile(session.user.id).catch(() => setProfile(null));
        }, 0);
      } else {
        setProfile(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, role: UserRole) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });
    return {
      error: error as Error | null,
      emailConfirmationRequired: !data.session,
    };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      try {
        const loadedProfile = await fetchProfile(data.user.id);
        if (!loadedProfile) {
          return { error: new Error('Your account exists, but its profile is missing. Ask an administrator to run the auth setup migration.') };
        }
      } catch {
        return { error: new Error('Your account was authenticated, but its profile could not be read. Run the auth setup migration in Supabase.') };
      }
    }
    return { error: error as Error | null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
