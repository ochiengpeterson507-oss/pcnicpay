import { useSupabase } from '../../components/SupabaseProvider';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, CreditCard, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState({ members: 0, collected: 0, expenses: 0, balance: 0 });
  const [payments, setPayments] = useState<any[]>([]);

  
  const supabase = useSupabase();

  useEffect(() => {
    fetchStats();
    fetchPayments();
    
    if (supabase) {
      const channel = supabase.channel('dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, payload => {
          fetchStats();
          fetchPayments();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {
          fetchStats();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase]);


  async function fetchStats() {
    try {
      const res = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchPayments() {
    try {
      const res = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setPayments(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const chartData = [
    { name: 'Jan', amount: 0 },
    { name: 'Feb', amount: 0 },
    { name: 'Mar', amount: 0 },
    { name: 'Apr', amount: 0 },
    { name: 'May', amount: 0 },
    { name: 'Jun', amount: 0 },
    { name: 'Jul', amount: stats.collected }, // Simplified for preview
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-sm text-slate-500">Live metrics and recent activities</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Balance</p>
              <h2 className="text-2xl font-black text-slate-800">KES {stats.balance.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            <span>Available for use</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Collections</p>
              <h2 className="text-2xl font-black text-slate-800">KES {stats.collected.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600 font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            <span>From {stats.members} members</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Expenses</p>
              <h2 className="text-2xl font-black text-slate-800">KES {stats.expenses.toLocaleString()}</h2>
            </div>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
            <span>Verified expenditures</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Members</p>
              <h2 className="text-2xl font-black text-slate-800">{stats.members}</h2>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
            <span>Registered in system</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Collections Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(value) => `Ksh ${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Amount']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Recent Activity</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {payments.slice(0, 6).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                    {payment.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{payment.user?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">+KES {payment.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{payment.reference}</p>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
