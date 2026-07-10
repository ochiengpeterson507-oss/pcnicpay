import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if env vars are directly available in Vite
    const envUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (envUrl && envKey) {
      setSupabase(createClient(envUrl, envKey));
      setLoading(false);
      return;
    }

    // Fallback to fetching config from backend
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Config fetch failed');
        return res.json();
      })
      .then(config => {
        if (config.supabaseUrl && config.supabaseAnonKey) {
          const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
          setSupabase(client);
        }
      })
      .catch(e => {
        console.error('Failed to init Supabase:', e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Supabase Config...</div>;
  if (!supabase) return <div className="h-screen flex flex-col items-center justify-center text-red-500">Failed to connect to Supabase. Please check your environment variables.</div>;

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);
