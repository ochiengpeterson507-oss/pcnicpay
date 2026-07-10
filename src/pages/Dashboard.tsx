import PaystackPaymentModal from "../components/PaystackPaymentModal";
import { useSupabase } from '../components/SupabaseProvider';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminDashboard from '../components/AdminDashboard';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ members: 0, collected: 0, expenses: 0, balance: 0 });
  const [payments, setPayments] = useState<any[]>([]);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  



  
  const supabase = useSupabase();
  useEffect(() => {
    fetchStats();
    fetchPayments();
    
    // Existing socket for push notifications from backend simulation
    // socket.on disabled
    
    
    // Supabase Realtime
    let channel: any;
    if (supabase) {
      channel = supabase.channel('member-dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, payload => {
          fetchStats();
          fetchPayments();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {
          fetchStats();
        })
        .subscribe();
    }

    return () => {
      // socket.off('new-payment');
      // socket.off('payment-failed');
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);


  


  const downloadReceipt = (payment: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Payment Receipt", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(payment.date || payment.createdAt).toLocaleString()}`, 20, 40);
    doc.text(`Receipt Number: ${payment.reference}`, 20, 50);
    doc.text(`Member: ${payment.user?.name || user?.name}`, 20, 60);
    
    doc.setFontSize(14);
    doc.text(`Amount Paid: KES ${payment.amount.toLocaleString()}`, 20, 80);
    
    doc.setFontSize(12);
    doc.text(`Status: ${payment.status || 'COMPLETED'}`, 20, 90);
    doc.text(`Payment Method: ${payment.phoneNumber || 'Online'}`, 20, 100);
    
    doc.setFontSize(10);
    doc.text("Thank you for your contribution!", 105, 130, { align: 'center' });
    
    doc.save(`receipt-${payment.reference}.pdf`);
  };

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchPayments() {
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        setPayments(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200">P</div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-800">PicnicPay</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">Finance Portal</span>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a href="#" className="text-sm font-semibold text-emerald-600">Dashboard</a>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Contributions</a>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Expenses</a>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Reports</a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{user?.name}</p>
            <p className="text-[10px] text-emerald-500 font-medium">{user?.role === 'ADMIN' ? 'Group Admin' : 'Member'}</p>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-b from-white to-[#f1f5f9] overflow-y-auto">
        
        {/* Top Metric Row */}
        {user?.role === 'ADMIN' ? (
          <AdminDashboard stats={stats} onPayClick={openPaymentModal} />
        ) : (
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Till Balance</p>
                <h2 className="text-3xl font-black text-slate-800">KES {stats.balance.toLocaleString()}</h2>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-md">Available</span>
                </div>
                <button 
                  onClick={openPaymentModal}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-md transition-colors shadow-sm"
                >
                  Pay with M-Pesa
                </button>
              </div>
            </div>

            <div className="bg-emerald-600 p-5 rounded-2xl shadow-lg shadow-emerald-100 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Total Contributions</p>
                <h2 className="text-3xl font-black text-white">KES {stats.collected.toLocaleString()}</h2>
              </div>
              <div className="relative z-10 flex items-center gap-2 mt-4">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span className="text-[10px] text-emerald-50 font-medium uppercase">{stats.members} active members</span>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Upcoming Picnic</p>
                <h2 className="text-xl font-black text-slate-800">Karura Forest</h2>
                <p className="text-xs text-slate-500 font-medium">August 28, 2026</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-md uppercase">14 Days Left</span>
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Group Expenses</p>
                <h2 className="text-3xl font-black text-white">KES {stats.expenses.toLocaleString()}</h2>
              </div>
              <div className="flex items-center gap-2 mt-4 text-slate-400 text-[10px] font-medium">
                <p>Verified expenditures</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Data Section */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
          
          {/* Chart Area Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Contribution Trends
                <span className="text-[10px] font-normal text-slate-400 px-2 py-0.5 border border-slate-200 rounded-full">Last 7 Days</span>
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                  <span className="text-[10px] font-semibold text-slate-500">Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                  <span className="text-[10px] font-semibold text-slate-500">Expenses</span>
                </div>
              </div>
            </div>
            
            <div className="h-32 flex items-end justify-between gap-2">
              <div className="flex-1 bg-emerald-100 rounded-t-lg h-[40%] hover:bg-emerald-200 transition-all"></div>
              <div className="flex-1 bg-emerald-100 rounded-t-lg h-[60%] hover:bg-emerald-200 transition-all"></div>
              <div className="flex-1 bg-emerald-500 rounded-t-lg h-[90%] hover:bg-emerald-600 transition-all"></div>
              <div className="flex-1 bg-emerald-200 rounded-t-lg h-[50%] hover:bg-emerald-300 transition-all"></div>
              <div className="flex-1 bg-emerald-100 rounded-t-lg h-[75%] hover:bg-emerald-200 transition-all"></div>
              <div className="flex-1 bg-emerald-400 rounded-t-lg h-[95%] hover:bg-emerald-500 transition-all"></div>
              <div className="flex-1 bg-emerald-100 rounded-t-lg h-[30%] hover:bg-emerald-200 transition-all"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          {/* Live Transaction Feed */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800">Live Transaction Feed</h3>
              <span className="text-[10px] font-bold text-emerald-500 animate-pulse bg-emerald-50 px-2 py-1 rounded">● LIVE UPDATES</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full">
                <thead className="text-left text-[10px] text-slate-400 uppercase sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-50">
                    <th className="p-3">Member</th>
                    <th className="p-3 hidden sm:table-cell">Reference</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Time</th>
                    <th className="p-3 text-center hidden sm:table-cell">Receipt / Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">No transactions yet.</td>
                    </tr>
                  ) : (
                    payments.slice(0, 15).map((payment: any, i) => (
                      <motion.tr 
                        initial={i === 0 ? { backgroundColor: '#d1fae5' } : false}
                        animate={{ backgroundColor: 'transparent' }}
                        transition={{ duration: 1.5 }}
                        key={payment.id}
                        className="hover:bg-slate-50 transition-colors border-b border-slate-50/50 last:border-0"
                      >
                        <td className="p-3 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold uppercase">
                            {payment.user?.name?.substring(0, 2) || 'UK'}
                          </div>
                          <span className="truncate max-w-[100px] sm:max-w-none">{payment.user?.name}</span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono hidden sm:table-cell">{payment.reference}</td>
                        <td className="p-3 text-right font-bold text-slate-700">KES {payment.amount.toLocaleString()}</td>
                        <td className="p-3 text-right text-slate-400">
                          {new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        
                        <td className="p-3 text-center hidden sm:table-cell">
                          {payment.userId === user?.id ? (
                            <button 
                              onClick={() => downloadReceipt(payment)}
                              className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded"
                            >
                              Download Receipt
                            </button>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[9px]">Verified</span>
                          )}
                        </td>

                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Panel */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          
          {/* Group Stats Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Member Engagement</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500 uppercase">Total Members Paid</span>
                  <span className="text-emerald-600">{stats.members} Active</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]"></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500 uppercase">Contribution Goal</span>
                  <span className="text-blue-600">KES 300,000</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.min((stats.collected / 300000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Top Category</p>
                <p className="text-sm font-bold text-slate-800">Food & Bev</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Till Number</p>
                <p className="text-sm font-bold text-emerald-600 font-mono tracking-tighter">5412210</p>
              </div>
            </div>
          </div>

          {/* Announcements & Notifications */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4">Recent Announcements</h3>
            <div className="space-y-4 flex-1">
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.167H3.382a.75.75 0 01-.736-.624l-.105-.521a2.01 2.01 0 011.96-2.404h1.411l2.147-6.167a1.76 1.76 0 013.417.592zm3.67 1.326a7.5 7.5 0 010 10.584M19.33 3.33a12.02 12.02 0 010 17.34"></path></svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Menu Finalized!</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">The BBQ and vegan options have been added to the list.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Payment Deadline</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Please ensure all payments are made by Friday night.</p>
                </div>
              </div>
            </div>

            {user?.role === 'ADMIN' && (
              <button className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2">
                Post New Announcement
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-white border-t border-slate-100 px-8 flex items-center justify-between shrink-0">
        <div className="flex gap-4">
          <span className="text-[10px] font-medium text-slate-400 tracking-tight uppercase hidden sm:inline-block">
            System Status: <span className="text-emerald-500 font-bold">Operational</span>
          </span>
          <span className="text-[10px] font-medium text-slate-400 tracking-tight uppercase sm:px-2 sm:border-l border-slate-200">
            DB: <span className="text-slate-600 font-bold tracking-normal">Prisma/SQLite</span>
          </span>
        </div>
        <div className="text-[10px] font-bold text-slate-300 tracking-widest italic hidden md:block">Transparent Contributions. Trusted Together.</div>
      </footer>

      {/* Paystack Payment Modal */}
      <PaystackPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccessCallback={() => { fetchStats(); fetchPayments(); }} 
      />
    </div>
  );
}
