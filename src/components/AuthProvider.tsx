import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseProvider';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabase();

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setToken(session.access_token);
          // Get additional user profile data from public.User table
          const { data: profile } = await supabase
            .from('User')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUser({
            id: session.user.id,
            name: profile?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: profile?.role || 'MEMBER',
            avatarUrl: profile?.avatarUrl,
            phone: profile?.phone
          });
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          setToken(session.access_token);
          const { data: profile } = await supabase
            .from('User')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUser({
            id: session.user.id,
            name: profile?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: profile?.role || 'MEMBER',
            avatarUrl: profile?.avatarUrl,
            phone: profile?.phone
          });
        } else {
          setToken(null);
          setUser(null);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [supabase]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
