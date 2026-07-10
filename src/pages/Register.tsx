import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useSupabase } from '../components/SupabaseProvider';
import { Wallet, Loader2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const supabase = useSupabase();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!supabase) throw new Error('Supabase not connected');

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Failed to create account');

      // Note: we can optionally hit a backend endpoint or use a trigger to create the public.User record.
      // But if we have anon access we can try inserting it directly:
      const { count } = await supabase.from('User').select('*', { count: 'exact', head: true });
      const isFirstUser = count === 0;

      const { error: insertError } = await supabase.from('User').insert({
        id: data.user.id,
        email: email,
        name: name,
        passwordHash: 'supabase-auth', // Not used anymore
        role: isFirstUser ? 'ADMIN' : 'MEMBER',
        updatedAt: new Date().toISOString()
      });

      // If insert fails (maybe due to RLS), it might be handled by backend. We ignore for now if it fails.
      if (insertError) {
        console.warn('Failed to insert public user (maybe handled by trigger):', insertError);
      }
      
      if (data.session) {
        const { data: profile } = await supabase
          .from('User')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        login(data.session.access_token, {
          id: data.session.user.id,
          name: profile?.name || name,
          email: data.session.user.email || '',
          role: profile?.role || (isFirstUser ? 'ADMIN' : 'MEMBER'),
          avatarUrl: profile?.avatarUrl,
          phone: profile?.phone
        });
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          Join the Till
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-3xl sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300">Full Name</label>
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <div className="mt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-emerald-500 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Already a member?</span>{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
