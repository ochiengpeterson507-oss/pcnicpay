import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import SupabaseDiagnostic from './SupabaseDiagnostic';

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
    
    // Safety fallback
    const timer = setTimeout(() => { setLoading(false); }, 4000);

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
        clearTimeout(timer);
      });
      
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-emerald-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p>Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (!supabase) {
    return <SupabaseDiagnostic />;
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => useContext(SupabaseContext);
