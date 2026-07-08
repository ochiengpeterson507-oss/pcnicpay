import React from 'react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  stats: {
    members: number;
    collected: number;
    expenses: number;
    balance: number;
  };
  onPayClick: () => void;
}

export default function AdminDashboard({ stats, onPayClick }: AdminDashboardProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Balance Card */}
      <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Till Balance</p>
          <h2 className="text-3xl font-black text-slate-800">KES {stats.balance.toLocaleString()}</h2>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-md uppercase">Available</span>
          </div>
          <button 
            onClick={onPayClick}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-md transition-colors shadow-sm"
          >
            Pay with M-Pesa
          </button>
        </div>
      </motion.div>

      {/* Contributions Card */}
      <motion.div variants={itemVariants} className="bg-emerald-600 p-5 rounded-2xl shadow-lg shadow-emerald-100 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Total Contributions</p>
          <h2 className="text-3xl font-black text-white">KES {stats.collected.toLocaleString()}</h2>
        </div>
        <div className="relative z-10 flex items-center gap-2 mt-4">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span className="text-[10px] text-emerald-50 font-medium uppercase">Live Tracking Active</span>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </motion.div>

      {/* Expenses Card */}
      <motion.div variants={itemVariants} className="bg-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Group Expenses</p>
          <h2 className="text-3xl font-black text-white">KES {stats.expenses.toLocaleString()}</h2>
        </div>
        <div className="flex items-center gap-2 mt-4 relative z-10 text-slate-400 text-[10px] font-medium uppercase">
          <p>Verified expenditures</p>
        </div>
      </motion.div>

      {/* Member Status Card */}
      <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Members</p>
          <h2 className="text-3xl font-black text-slate-800">{stats.members}</h2>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-md uppercase">Group Size</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
