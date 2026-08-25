import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, UserRole } from '../lib/supabase';
import { RateLimiter } from '../lib/security/rateLimiter';
import { validateEmail, validatePassword, validateRole } from '../lib/security/validation';
import { sanitizeError } from '../lib/security/errorHandler';
import { logger } from '../lib/security/logger';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: Error | null; emailConfirmationRequired: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; retryAfterSeconds?: number }>;
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

    if (error) {
      logger.error('AuthContext', 'Failed to fetch user profile', error);
      throw error;
    }
    setProfile(data ?? null);
    return data ?? null;
  }

  async function refreshProfile() {
    if (user) {
      try {
        await fetchProfile(user.id);
      } catch (err) {
        logger.error('AuthContext', 'Profile refresh error', err);
      }
    }
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
    // 1. Strict Input Schema Validation
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) {
      return { error: new Error(emailRes.error!), emailConfirmationRequired: false };
    }

    const passwordRes = validatePassword(password);
    if (!passwordRes.isValid) {
      return { error: new Error(passwordRes.error!), emailConfirmationRequired: false };
    }

    const roleRes = validateRole(role);
    if (!roleRes.isValid) {
      return { error: new Error(roleRes.error!), emailConfirmationRequired: false };
    }

    // 2. Rate Limiting Check
    const rl = RateLimiter.checkAuthLimit(emailRes.sanitizedValue!);
    if (!rl.allowed) {
      return { error: new Error(rl.message), emailConfirmationRequired: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailRes.sanitizedValue!,
        password: passwordRes.sanitizedValue!,
        options: { data: { role: roleRes.sanitizedValue! } },
      });

      if (error) {
        RateLimiter.recordAuthFailure(emailRes.sanitizedValue!);
        const sanitized = sanitizeError(error);
        return { error: new Error(sanitized.message), emailConfirmationRequired: false };
      }

      RateLimiter.recordAuthSuccess(emailRes.sanitizedValue!);
      return {
        error: null,
        emailConfirmationRequired: !data.session,
      };
    } catch (err) {
      RateLimiter.recordAuthFailure(emailRes.sanitizedValue!);
      const sanitized = sanitizeError(err);
      return { error: new Error(sanitized.message), emailConfirmationRequired: false };
    }
  }

  async function signIn(email: string, password: string) {
    // 1. Strict Input Validation
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) {
      return { error: new Error(emailRes.error!) };
    }

    if (!password || typeof password !== 'string') {
      return { error: new Error('Please enter your password.') };
    }

    // 2. Exponential Backoff Rate Limiting Check
    const rl = RateLimiter.checkAuthLimit(emailRes.sanitizedValue!);
    if (!rl.allowed) {
      return { error: new Error(rl.message), retryAfterSeconds: rl.retryAfterSeconds };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailRes.sanitizedValue!,
        password,
      });

      if (error) {
        const failure = RateLimiter.recordAuthFailure(emailRes.sanitizedValue!);
        const sanitized = sanitizeError(error);
        let errorMsg = sanitized.message;
        if (failure.backoffSeconds > 0) {
          errorMsg = `Invalid credentials. Please wait ${failure.backoffSeconds}s before retrying.`;
        }
        return { error: new Error(errorMsg), retryAfterSeconds: failure.backoffSeconds };
      }

      if (data.user) {
        try {
          const loadedProfile = await fetchProfile(data.user.id);
          if (!loadedProfile) {
            return { error: new Error('Your account exists, but its profile is missing. Please contact an administrator.') };
          }
        } catch {
          return { error: new Error('Your account was authenticated, but its profile could not be loaded. Please try again.') };
        }
      }

      RateLimiter.recordAuthSuccess(emailRes.sanitizedValue!);
      return { error: null };
    } catch (err) {
      const failure = RateLimiter.recordAuthFailure(emailRes.sanitizedValue!);
      const sanitized = sanitizeError(err);
      return { error: new Error(sanitized.message), retryAfterSeconds: failure.backoffSeconds };
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      logger.error('AuthContext', 'Sign out error', err);
    }
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
