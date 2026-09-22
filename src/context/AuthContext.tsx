import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, db } from '../lib/supabase';
import { DEMO } from '../lib/demo';
import type { Profile } from '../types';

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo/preview mode: fake a signed-in user, no Supabase calls.
  if (DEMO) {
    const demoUser = { id: 'demo-user', email: 'demo@stocksell.app' } as User;
    const value: AuthCtx = {
      user: demoUser,
      profile: { id: 'demo-user', full_name: 'Demo Seller', created_at: new Date().toISOString() },
      session: null,
      loading: false,
      signUp: async () => null,
      signIn: async () => null,
      signOut: async () => {},
      refreshProfile: async () => {},
    };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data } = await db()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      setProfile(data as Profile | null);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      if (sess?.user) void loadProfile(sess.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp: AuthCtx['signUp'] = async (email, password, fullName) => {
    const { data, error } = await db().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return error.message;
    if (data.user) {
      // The DB trigger creates the profile row; stamp the display name on it.
      await db().from('profiles').upsert(
        { id: data.user.id, full_name: fullName },
        { onConflict: 'id' }
      );
    }
    return null;
  };

  const signIn: AuthCtx['signIn'] = async (email, password) => {
    const { error } = await db().auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signOut = async () => {
    await db().auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
