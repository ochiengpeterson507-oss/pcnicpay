const fs = require('fs');

const code = `import PaystackPaymentModal from "../components/PaystackPaymentModal";
import { useSupabase } from '../components/SupabaseProvider';
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../components/AuthProvider';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, Trees, Tent, SunMedium, Users, Music, Utensils, 
  MapPin, Calendar, Camera, Heart, CheckCircle2, ArrowRight,
  LayoutDashboard, CreditCard, Receipt, FileText, Settings, Image as ImageIcon,
  CloudSun, Upload, Leaf
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ members: 0, collected: 0, expenses: 0, balance: 0 });
  const [payments, setPayments] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [posters, setPosters] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  
  const supabase = useSupabase();

  useEffect(() => {
    fetchStats();
    fetchPayments();
    fetchPosters();
    fetchAnnouncements();
    fetchGallery();

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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Announcement' }, payload => {
          fetchAnnouncements();
          fetchGallery();
        })
        .subscribe();
    }
    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [supabase]);

  const downloadReceipt = (payment: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Picnic Contribution Receipt", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(\`Date: \${new Date(payment.date || payment.createdAt).toLocaleString()}\`, 20, 40);
    doc.text(\`Receipt Number: \${payment.reference}\`, 20, 50);
    doc.text(\`Member: \${payment.user?.name || user?.name}\`, 20, 60);
    
    doc.setFontSize(14);
    doc.text(\`Amount Paid: KES \${payment.amount.toLocaleString()}\`, 20, 80);
    
    doc.setFontSize(12);
    doc.text(\`Status: \${payment.status || 'COMPLETED'}\`, 20, 90);
    doc.text(\`Payment Method: \${payment.phoneNumber || 'Online'}\`, 20, 100);
    
    doc.setFontSize(10);
    doc.text("Thank you for helping make this picnic unforgettable!", 105, 130, { align: 'center' });
    
    doc.save(\`receipt-\${payment.reference}.pdf\`);
  };

  async function fetchGallery() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('Gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && data) {
        setGalleryItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery', err);
    }
  }

  async function fetchAnnouncements() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('Announcement')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) {
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  }

  async function fetchPosters() {
    try {
      const res = await fetch('/api/posters');
      if (res.ok) {
        const data = await res.json();
        setPosters(data.filter((p: any) => p.isActive) || []);
      }
    } catch (err) {
      console.error('Failed to fetch posters', err);
    }
  }

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

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Contributions', icon: CreditCard, path: '#' },
    { name: 'Expenses', icon: Receipt, path: '#' },
    { name: 'Members', icon: Users, path: '#' },
    { name: 'Gallery', icon: ImageIcon, path: '#' },
    { name: 'Reports', icon: FileText, path: '#' },
    { name: 'Settings', icon: Settings, path: '#' },
  ];

  const getAnnouncementIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('food') || t.includes('menu')) return <Utensils className="w-5 h-5 text-amber-500" />;
    if (t.includes('transport') || t.includes('bus')) return <ArrowRight className="w-5 h-5 text-blue-500" />;
    if (t.includes('music') || t.includes('entertainment')) return <Music className="w-5 h-5 text-purple-500" />;
    return <Tent className="w-5 h-5 text-emerald-500" />;
  };

  const chartData = useMemo(() => {
    if (payments.length === 0) {
      return Array.from({length: 7}).map((_, i) => ({
        name: \`Day \${i+1}\`,
        amount: Math.floor(Math.random() * 5000) + (i * 2000)
      }));
    }
    const grouped: any = {};
    const sorted = [...payments].reverse();
    let cumulative = 0;
    sorted.forEach(p => {
        const date = new Date(p.date || p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
        cumulative += p.amount;
        grouped[date] = cumulative;
    });
    return Object.keys(grouped).map(k => ({
        name: k,
        amount: grouped[k]
    }));
  }, [payments]);

  const GOAL = 300000;
  const progressPercent = Math.min((stats.collected / GOAL) * 100, 100);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Trees className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">PicnicPay</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path}
              className={\`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-300 \${
                item.name === 'Dashboard' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                  : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
              }\`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link 
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-300 mt-8"
            >
              <Settings className="w-5 h-5" />
              Admin Portal
            </Link>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-emerald-50 rounded-2xl p-4 relative overflow-hidden">
            <Leaf className="absolute -top-2 -right-2 w-16 h-16 text-emerald-100/50 rotate-12" />
            <p className="text-xs font-bold text-emerald-800 relative z-10">Need help?</p>
            <p className="text-[10px] text-emerald-600 mt-1 relative z-10">Contact the picnic organizers.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Trees className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">PicnicPay</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-slate-50 to-emerald-50/30">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[24px] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none"></div>
              
              <div className="relative z-10 flex-1">
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                  <span className="block text-2xl md:text-3xl font-bold text-emerald-600 mb-2">🌳 Welcome back, {user?.name?.split(' ')[0]}!</span>
                  Our next picnic is almost here.
                </h1>
                <p className="mt-4 text-slate-500 font-medium max-w-lg">
                  Join the group effort to make this the best outdoor event of the year. Every contribution brings us closer to nature!
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button 
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg shadow-emerald-200 transition-all hover:-translate-y-1"
                  >
                    Contribute Now
                  </button>
                  <button className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full font-bold shadow-sm transition-all">
                    View Itinerary
                  </button>
                </div>
              </div>

              {/* Progress Circle & Countdown */}
              <div className="relative z-10 flex gap-8 shrink-0 flex-col sm:flex-row items-center">
                <div className="text-center bg-white/60 backdrop-blur-md p-6 rounded-[20px] border border-white shadow-xl shadow-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Countdown</p>
                  <div className="flex gap-3">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-slate-800">24</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Days</span>
                    </div>
                    <span className="text-3xl font-black text-slate-300">:</span>
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-slate-800">13</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Hrs</span>
                    </div>
                  </div>
                </div>

                <div className="relative w-32 h-32 flex items-center justify-center bg-white/60 backdrop-blur-md rounded-full border border-white shadow-xl shadow-slate-100">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <motion.path
                      className="text-emerald-500"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: \`\${progressPercent}, 100\` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="text-center relative z-10">
                    <span className="block text-xl font-black text-slate-800">{Math.round(progressPercent)}%</span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Funded</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[20px] p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                <Tent className="absolute -bottom-4 -right-4 w-24 h-24 text-white/20" />
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Picnic Fund</p>
                <h3 className="text-3xl font-black relative z-10">KES {stats.collected.toLocaleString()}</h3>
                <p className="text-emerald-100 text-xs mt-2 relative z-10">Goal: KES 300,000</p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-[20px] p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                <Users className="absolute -bottom-4 -right-4 w-24 h-24 text-white/20" />
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Members Joined</p>
                <h3 className="text-3xl font-black relative z-10">{stats.members}</h3>
                <p className="text-blue-100 text-xs mt-2 relative z-10">Ready for fun</p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-[20px] p-6 text-white shadow-lg shadow-orange-200 relative overflow-hidden">
                <Utensils className="absolute -bottom-4 -right-4 w-24 h-24 text-white/20" />
                <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Budget Used</p>
                <h3 className="text-3xl font-black relative z-10">KES {stats.expenses.toLocaleString()}</h3>
                <p className="text-orange-100 text-xs mt-2 relative z-10">Supplies & Venue</p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <Calendar className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-50" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Picnic Date</p>
                    <h3 className="text-xl font-black text-slate-800">Aug 28, 2026</h3>
                    <p className="text-slate-500 text-xs mt-2 font-medium">Karura Forest</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2 text-center">
                    <CloudSun className="w-6 h-6 text-amber-500 mx-auto" />
                    <span className="block text-[10px] font-bold text-amber-600 mt-1">28°C</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Grid: Chart & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Contribution Area Chart */}
                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Contribution Progress</h3>
                      <p className="text-xs text-slate-500 mt-1">Total funds raised over time</p>
                    </div>
                    <select className="bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-full px-4 py-2 outline-none">
                      <option>This Month</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => \`K\${val/1000}k\`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Timeline Cards (Transactions) */}
                <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Recent Contributions</h3>
                    <button className="text-emerald-600 text-sm font-bold hover:underline">View All</button>
                  </div>
                  
                  <div className="space-y-4">
                    {payments.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                          <Tent className="w-12 h-12" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">No contributions yet</h4>
                        <p className="text-sm text-slate-500 max-w-sm mb-6">Be the first to help make this picnic unforgettable!</p>
                        <button onClick={() => setIsPaymentModalOpen(true)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-full shadow-md">
                          Contribute Now
                        </button>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {payments.slice(0, 5).map((payment: any, i) => (
                          <motion.div 
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-lg">
                                {payment.user?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{payment.user?.name || 'Unknown Member'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500">{new Date(payment.date || payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Successful
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-800">KES {payment.amount.toLocaleString()}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">M-Pesa</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-8">
                
                {/* Announcements */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Announcements</h3>
                  <div className="space-y-4">
                    {announcements.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No news right now.</p>
                    ) : (
                      announcements.map((ann) => (
                        <div key={ann.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            {getAnnouncementIcon(ann.title)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{ann.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ann.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Gallery Mini-feed */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Picnic Moodboard</h3>
                    <button className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {galleryItems.length === 0 ? (
                      <div className="col-span-2 py-8 text-center text-slate-400 text-sm">
                        No photos added yet.
                      </div>
                    ) : (
                      galleryItems.map(item => (
                        <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <span className="text-white text-[10px] font-bold truncate">{item.title}</span>
                          </div>
                          <button className="absolute top-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white/40">
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {galleryItems.length > 0 && (
                    <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                      View Full Gallery
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <PaystackPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccessCallback={() => { fetchStats(); fetchPayments(); }} 
      />
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Dashboard.tsx', code);
