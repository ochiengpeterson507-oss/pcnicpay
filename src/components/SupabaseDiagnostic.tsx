import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, CheckCircle2, AlertCircle, Server, RefreshCw } from 'lucide-react';

export default function SupabaseDiagnostic() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const checkConnection = async () => {
    setStatus('testing');
    setErrorDetails(null);
    setSessionInfo(null);
    
    try {
      let envUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
      let envKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!envUrl || !envKey) {
        // Fallback to API config
        const res = await fetch('/api/config');
        if (!res.ok) throw new Error('Failed to fetch config from backend.');
        const config = await res.json();
        envUrl = config.supabaseUrl;
        envKey = config.supabaseAnonKey;
      }

      if (!envUrl || !envKey) {
         throw new Error("Supabase URL or Anon Key is missing from both environment variables and backend config.");
      }

      const tempClient = createClient(envUrl, envKey);
      const { data, error } = await tempClient.auth.getSession();
      
      if (error) {
        throw new Error(error.message || "Failed to fetch session.");
      }

      setSessionInfo(data.session ? 'Active session found' : 'No active session (Guest)');
      setStatus('success');
      
    } catch (err: any) {
      console.error("Diagnostic error:", err);
      setStatus('error');
      setErrorDetails(err.message || 'Unknown connection error occurred.');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-6">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Supabase Diagnostic</h1>
            <p className="text-slate-400 text-sm mt-1">Connection & Configuration Utility</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-300">Connection Status</h3>
              {status === 'testing' && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
              {status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            </div>
            
            {status === 'testing' && (
              <p className="text-slate-400 text-sm">Testing connection to Supabase...</p>
            )}

            {status === 'success' && (
              <div className="space-y-2">
                <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Successfully connected to Supabase
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Session State</span>
                  <p className="text-sm font-mono text-slate-300 mt-2">{sessionInfo}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <p className="text-red-400 text-sm font-medium">Connection Failed</p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-300 text-sm font-mono break-all whitespace-pre-wrap">{errorDetails}</p>
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-800">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Troubleshooting Steps:</h4>
                  <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                    <li>Verify <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> is set correctly.</li>
                    <li>Verify <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> is set correctly.</li>
                    <li>Ensure your Supabase project is active and not paused.</li>
                    <li>Check if CORS is properly configured in your Supabase project settings.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={checkConnection}
              disabled={status === 'testing'}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'testing' ? 'animate-spin' : ''}`} />
              Run Diagnostics Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
