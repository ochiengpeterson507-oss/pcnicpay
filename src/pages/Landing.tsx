import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { Wallet, ShieldCheck, Users, Activity } from 'lucide-react';

export default function Landing() {
  const [posters, setPosters] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch('/api/posters').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setPosters(data.filter((p: any) => p.isActive));
    }).catch(() => {});
  }, []);
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-emerald-500/30">
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">PicnicPay</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Log in</Link>
                <Link to="/register" className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors">
                  Join Till
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mt-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight"
            >
              Transparent Contributions.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Trusted Together.
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              A modern, transparent way to manage group finances for your next big picnic. 
              Track every payment, view live balances, and build trust effortlessly.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <Link to="/register" className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
                Start Contributing Now
              </Link>
            </motion.div>
          </div>

          <div className="mt-40 grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Activity className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Live Updates</h3>
              <p className="text-slate-400 leading-relaxed">Watch the till balance grow in real-time as members make their contributions.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">100% Transparent</h3>
              <p className="text-slate-400 leading-relaxed">Every expense is tracked and verified. Receipts are available for everyone to see.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Users className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-semibold mb-3">Member Dashboard</h3>
              <p className="text-slate-400 leading-relaxed">View your personal contribution history and see how you rank on the leaderboard.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
